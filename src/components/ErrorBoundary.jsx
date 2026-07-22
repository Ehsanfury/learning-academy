/**
 * ErrorBoundary.jsx
 * Path: src/components/ErrorBoundary.jsx
 * Description: Error boundary component with better UI and error reporting
 * Version: 3.0 - Improved with monitoring, retry, and detailed error info
 * Changes:
 * - ✅ Better error UI with retry options
 * - ✅ Error reporting to monitoring service
 * - ✅ Stack trace display (dev only)
 * - ✅ Component stack trace
 * - ✅ Localized error messages
 * - ✅ Multiple recovery options (retry, go home, reload)
 * - ✅ Error count tracking (avoid infinite loops)
 */

import React from "react";
import { AlertCircle, RefreshCw, Home, Bug, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

// UI Components
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";

// Language
import { useLanguageContext } from "@context/LanguageContext";

// ============================================
// 🔤 ErrorBoundary Component
// ============================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // ============================================
    // 📊 Log error
    // ============================================

    console.error("🚨 Error caught by ErrorBoundary:", error, errorInfo);

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // ============================================
    // 📢 Report to monitoring (if available)
    // ============================================

    if (typeof window !== "undefined") {
      import("@utils/monitoring")
        .then(({ trackError }) => {
          trackError(error, {
            extra: {
              componentStack: errorInfo?.componentStack,
              errorId: this.state.errorId,
              errorCount: this.state.errorCount,
            },
            tags: {
              type: "react_error_boundary",
            },
          });
        })
        .catch(() => {
          // Silent fail if monitoring not loaded
        });
    }

    // ============================================
    // 📢 Call onError prop
    // ============================================

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // ============================================
  // 🔄 Recovery Actions
  // ============================================

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const report = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(report, null, 2))
      .then(() => {
        alert(
          "گزارش خطا در کلیپ‌بورد کپی شد. لطفاً آن را برای پشتیبانی ارسال کنید.",
        );
      })
      .catch(() => {
        console.log("Error report:", report);
      });
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { language = "fa" } = this.props;
    const isDev = process.env.NODE_ENV === "development";
    const isFa = language === "fa";

    // Too many errors - suggest reload
    if (this.state.errorCount > 3) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card
            variant="elevated"
            padding="xl"
            className="max-w-md w-full text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-danger-100 dark:bg-danger-950 rounded-full flex items-center justify-center mb-6">
                <Bug className="w-10 h-10 text-danger-500" />
              </div>

              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {isFa ? "خطای مکرر رخ داده است" : "Repeated errors detected"}
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
                {isFa
                  ? "به نظر می‌رسد خطا پایدار است. لطفاً صفحه را مجدداً بارگذاری کنید یا بعداً تلاش کنید."
                  : "It seems the error is persistent. Please reload the page or try again later."}
              </p>

              <Button
                variant="primary"
                onClick={this.handleReload}
                icon={RotateCcw}
                fullWidth
              >
                {isFa ? "بارگذاری مجدد صفحه" : "Reload Page"}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card
          variant="elevated"
          padding="xl"
          className="max-w-lg w-full text-center"
        >
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-danger-100 dark:bg-danger-950 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-danger-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {isFa ? "خطایی رخ داده است!" : "Something went wrong!"}
            </h2>

            {/* Description */}
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
              {isFa
                ? "متأسفانه خطایی در بارگذاری این بخش رخ داده است. می‌توانید دوباره تلاش کنید یا به صفحه اصلی بازگردید."
                : "Sorry, an error occurred while loading this section. You can try again or go back to the home page."}
            </p>

            {/* Error ID */}
            {this.state.errorId && (
              <p className="text-xs text-neutral-400 mb-4 font-mono">
                Error ID: {this.state.errorId}
              </p>
            )}

            {/* Error Details (dev only) */}
            {isDev && this.state.error && (
              <div className="w-full mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left overflow-auto max-h-48">
                <p className="text-xs text-danger-600 dark:text-danger-400 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-neutral-500 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center w-full">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon={RefreshCw}
              >
                {isFa ? "تلاش مجدد" : "Try Again"}
              </Button>

              <Link to="/">
                <Button variant="secondary" icon={Home}>
                  {isFa ? "بازگشت به خانه" : "Go Home"}
                </Button>
              </Link>

              <Button variant="ghost" onClick={this.handleReportBug} icon={Bug}>
                {isFa ? "گزارش خطا" : "Report Bug"}
              </Button>
            </div>

            {/* Reload option */}
            <button
              onClick={this.handleReload}
              className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              {isFa ? "یا صفحه را مجدداً بارگذاری کنید" : "Or reload the page"}
            </button>
          </div>
        </Card>
      </div>
    );
  }
}

// ============================================
// 📦 Wrapper with Language Context
// ============================================

function ErrorBoundaryWithLanguage(props) {
  const { language } = useLanguageContext();
  return <ErrorBoundary {...props} language={language} />;
}

export default ErrorBoundaryWithLanguage;

/**
 * ErrorBoundary.jsx
 * Path: src/components/ErrorBoundary.jsx
 * Description: Error boundary component for catching and displaying errors
 * Version: 2.0 - Updated with new UI components
 */

import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

// ✅ استفاده از کامپوننت‌های جدید UI
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";

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
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card
            variant="elevated"
            padding="xl"
            className="max-w-md w-full text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-danger-100 dark:bg-danger-950 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-danger-500" />
              </div>

              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {this.props.language === "fa"
                  ? "خطایی رخ داده است!"
                  : "Something went wrong!"}
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
                {this.props.language === "fa"
                  ? "متأسفانه خطایی در بارگذاری این صفحه رخ داده است. لطفاً دوباره تلاش کنید."
                  : "Sorry, an error occurred while loading this page. Please try again."}
              </p>

              {this.state.error && (
                <div className="w-full mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left overflow-auto max-h-32">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  icon={RefreshCw}
                >
                  {this.props.language === "fa" ? "تلاش مجدد" : "Try Again"}
                </Button>

                <Link to="/">
                  <Button variant="secondary" icon={Home}>
                    {this.props.language === "fa"
                      ? "بازگشت به خانه"
                      : "Go Home"}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// 📦 Wrapper with Language Context
// ============================================

import { useLanguageContext } from "@context/LanguageContext";

function ErrorBoundaryWithLanguage(props) {
  const { language } = useLanguageContext();
  return <ErrorBoundary {...props} language={language} />;
}

export default ErrorBoundaryWithLanguage;

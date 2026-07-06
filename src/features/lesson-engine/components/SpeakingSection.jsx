/**
 * SpeakingSection.jsx
 * هدف: تمرین مهارت گفتاری با تلفظ و نقش‌آفرینی
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'speaking'
 * Changes:
 * - ✅ FIXED: Syntax error - import debug moved outside import block
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import debug from "../../../utils/debug";
import {
  Mic,
  Volume2,
  StopCircle,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Button from "@components/ui/Button";
import { cn } from "@utils/helpers";
import ProgressBar from "@components/ProgressBar";

function SpeakingSection({ section, onComplete = null, aiMode = false }) {
  const { language } = useLanguageContext();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPhrases, setRecordedPhrases] = useState({});
  const [feedback, setFeedback] = useState({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const phrases = section.phrases || [];
  const currentPhrase = phrases[currentPhraseIndex];
  const aiPractice = section.aiPractice;
  const isComplete = Object.keys(recordedPhrases).length === phrases.length;

  const playAudio = (audioUrl) => {
    if (!audioUrl) {
      // Speech synthesis fallback
      const utterance = new SpeechSynthesisUtterance(currentPhrase?.de);
      utterance.lang = "de-DE";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
      return;
    }
    const audio = new Audio(audioUrl);
    audio.play().catch(console.warn);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        simulatePronunciationCheck(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      debug.error("Microphone access denied:", error);
      alert(
        language === "fa"
          ? "لطفاً دسترسی به میکروفون را允许 کنید"
          : "Please allow microphone access",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const simulatePronunciationCheck = (audioBlob) => {
    // شبیه‌سازی بررسی تلفظ - در نسخه واقعی به API ارسال میشه
    setTimeout(() => {
      const mockScore = Math.random() * 40 + 60; // 60-100%
      const isGood = mockScore >= 80;

      setFeedback((prev) => ({
        ...prev,
        [currentPhrase.id]: {
          score: Math.round(mockScore),
          isGood,
          message: isGood
            ? language === "fa"
              ? "تلفظ عالی! 🎉"
              : "Excellent pronunciation! 🎉"
            : language === "fa"
              ? "تلفظ خوب بود، کمی تمرین کن"
              : "Good effort, keep practicing",
          suggestions: isGood
            ? []
            : ['دقت به حرف "ch"', "تلفظ Umlaut را تمرین کن"],
        },
      }));

      setRecordedPhrases((prev) => ({
        ...prev,
        [currentPhrase.id]: true,
      }));
    }, 1500);
  };

  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
    }
  };

  const prevPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(currentPhraseIndex - 1);
    }
  };

  const resetPractice = () => {
    setCurrentPhraseIndex(0);
    setRecordedPhrases({});
    setFeedback({});
  };

  const handleComplete = () => {
    const totalScore = Object.values(feedback).reduce(
      (acc, f) => acc + (f?.score || 0),
      0,
    );
    const avgScore = phrases.length > 0 ? totalScore / phrases.length : 0;
    onComplete?.({
      sectionId: section.id,
      completedPhrases: Object.keys(recordedPhrases).length,
      avgScore,
    });
  };

  // AI Scenario Mode
  if (aiMode && aiPractice) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 text-white text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">
            {language === "fa" ? "تمرین با هوش مصنوعی" : "AI Speaking Practice"}
          </h3>
          <p className="text-white/80 text-sm">
            {language === "fa"
              ? "با معلم هوش مصنوعی مکالمه کن و تلفظت رو بهبود بده"
              : "Practice conversation with AI tutor and improve your pronunciation"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-primary-500" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {language === "fa"
                ? "برای شروع دکمه میکروفون را بزن و با هوش مصنوعی صحبت کن"
                : "Press the microphone button and speak with the AI"}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            {!isRecording ? (
              <Button
                variant="primary"
                size="lg"
                onClick={startRecording}
                icon={Mic}
              >
                {language === "fa" ? "شروع مکالمه" : "Start Conversation"}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={stopRecording}
                icon={StopCircle}
              >
                {language === "fa" ? "اتمام مکالمه" : "Stop"}
              </Button>
            )}
          </div>

          {feedback[currentPhrase?.id] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    feedback[currentPhrase.id].isGood
                      ? "bg-success-500"
                      : "bg-warning-500",
                  )}
                />
                <span className="text-sm font-medium">
                  {feedback[currentPhrase.id].message}
                </span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${feedback[currentPhrase.id].score}%` }}
                />
              </div>
              {feedback[currentPhrase.id].suggestions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-500 mb-1">
                    {language === "fa" ? "پیشنهادات:" : "Suggestions:"}
                  </p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    {feedback[currentPhrase.id].suggestions.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {isComplete && (
          <div className="text-center">
            <Button variant="success" onClick={handleComplete}>
              {language === "fa" ? "ادامه درس" : "Continue Lesson"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Regular phrases mode
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          {Object.keys(recordedPhrases).length} / {phrases.length}
        </span>
        <ProgressBar
          value={Object.keys(recordedPhrases).length}
          max={phrases.length}
          size="sm"
          className="flex-1 mx-4"
        />
      </div>

      {/* Current Phrase Card */}
      <motion.div
        key={currentPhraseIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-soft text-center"
      >
        <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
          {currentPhrase?.de}
        </h3>

        <p className="text-neutral-500 mb-6">{currentPhrase?.[language]}</p>

        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => playAudio(currentPhrase?.audio)}
            className="p-4 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-100 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>

          {!recordedPhrases[currentPhrase?.id] ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "p-4 rounded-full transition-colors",
                isRecording
                  ? "bg-danger-500 hover:bg-danger-600"
                  : "bg-primary-500 hover:bg-primary-600",
              )}
            >
              {isRecording ? (
                <StopCircle className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          ) : (
            <div className="p-4 rounded-full bg-success-500">
              <Check className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback[currentPhrase?.id] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  feedback[currentPhrase.id].isGood
                    ? "bg-success-500"
                    : "bg-warning-500",
                )}
              />
              <span className="text-sm">
                {feedback[currentPhrase.id].message}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${feedback[currentPhrase.id].score}%` }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevPhrase}
          disabled={currentPhraseIndex === 0}
        >
          {language === "fa" ? "قبلی" : "Previous"}
        </Button>

        <Button variant="ghost" onClick={resetPractice}>
          <RefreshCw className="w-4 h-4 ml-2" />
          {language === "fa" ? "شروع مجدد" : "Reset"}
        </Button>

        {currentPhraseIndex < phrases.length - 1 ? (
          <Button
            variant="primary"
            onClick={nextPhrase}
            disabled={!recordedPhrases[currentPhrase?.id]}
          >
            {language === "fa" ? "بعدی" : "Next"}
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleComplete}
            disabled={!isComplete}
          >
            {language === "fa" ? "اتمام تمرین" : "Complete Practice"}
          </Button>
        )}
      </div>

      {/* AI Mode Suggestion */}
      {aiPractice?.enabled && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            {language === "fa" ? "تمرین با هوش مصنوعی" : "Practice with AI"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SpeakingSection;

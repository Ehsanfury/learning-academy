/**
 * GrammarSection.jsx
 * هدف: آموزش گرامر با مثال‌های تعاملی
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'grammar'
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { Check, X, Lightbulb, AlertCircle } from "lucide-react";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { cn } from "@utils/helpers";

function GrammarSection({ section, onComplete = null }) {
  const { language } = useLanguageContext();
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillFeedback, setDrillFeedback] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const concept = section.concept?.[language] || section.concept;
  const explanation = section.explanation?.[language] || section.explanation;
  const examples = section.examples || [];
  const commonMistakes = section.commonMistakes || [];
  const interactiveDrill = section.interactiveDrill;

  const handleDrillAnswer = (questionIndex, answer) => {
    setDrillAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
    setDrillFeedback((prev) => ({ ...prev, [questionIndex]: null }));
  };

  const checkDrillAnswer = (questionIndex, correctAnswer) => {
    const userAnswer = drillAnswers[questionIndex];
    const isCorrect =
      userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    setDrillFeedback((prev) => ({
      ...prev,
      [questionIndex]: { isCorrect, correctAnswer },
    }));

    return isCorrect;
  };

  const submitAllDrills = () => {
    if (!interactiveDrill?.questions) return;

    let allCorrect = true;
    interactiveDrill.questions.forEach((q, idx) => {
      const isCorrect = checkDrillAnswer(idx, q.answer);
      if (!isCorrect) allCorrect = false;
    });

    setIsSubmitted(true);
    if (allCorrect) onComplete?.({ sectionId: section.id });
  };

  const resetDrills = () => {
    setDrillAnswers({});
    setDrillFeedback({});
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Concept Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-950 rounded-full mb-4">
          <Lightbulb className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {language === "fa" ? "نکته گرامری" : "Grammar Point"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {concept}
        </h3>
      </div>

      {/* Explanation */}
      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-6">
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>

        {!showExplanation && explanation?.length > 300 && (
          <button
            onClick={() => setShowExplanation(true)}
            className="mt-3 text-sm text-purple-500 hover:text-purple-600"
          >
            {language === "fa" ? "نمایش بیشتر" : "Show more"}
          </button>
        )}
      </div>

      {/* Examples */}
      {examples.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {language === "fa" ? "مثال‌ها" : "Examples"}
          </h4>
          <div className="space-y-3">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-4 border-r-4 border-purple-500"
              >
                <p className="text-primary-700 dark:text-primary-300 font-medium mb-2">
                  {example.de}
                </p>
                <p className="text-sm text-neutral-500">{example[language]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {commonMistakes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            {language === "fa" ? "اشتباهات رایج" : "Common Mistakes"}
          </h4>
          <div className="space-y-3">
            {commonMistakes.map((mistake, index) => (
              <div
                key={index}
                className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4"
              >
                <p className="text-danger-600 line-through mb-1">
                  ❌ {mistake.mistake}
                </p>
                <p className="text-success-600">✓ {mistake.correction}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {mistake.explanation?.[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Drill */}
      {interactiveDrill && interactiveDrill.questions && (
        <div className="space-y-4 mt-6">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {language === "fa" ? "تمرین تعاملی" : "Interactive Practice"}
          </h4>

          {interactiveDrill.questions.map((q, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-800 rounded-xl p-5"
            >
              <p className="text-neutral-700 dark:text-neutral-300 mb-3">
                {idx + 1}. {q.prompt}
              </p>
              <div className="flex gap-3">
                <Input
                  value={drillAnswers[idx] || ""}
                  onChange={(e) => handleDrillAnswer(idx, e.target.value)}
                  placeholder={
                    language === "fa"
                      ? "پاسخ خود را بنویسید..."
                      : "Type your answer..."
                  }
                  className="flex-1"
                  disabled={isSubmitted && drillFeedback[idx]?.isCorrect}
                />
                {!isSubmitted && (
                  <Button
                    variant="outline"
                    onClick={() => checkDrillAnswer(idx, q.answer)}
                  >
                    {language === "fa" ? "بررسی" : "Check"}
                  </Button>
                )}
              </div>

              {drillFeedback[idx] && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-3 p-3 rounded-lg text-sm",
                    drillFeedback[idx].isCorrect
                      ? "bg-success-50 dark:bg-success-950 text-success-700"
                      : "bg-danger-50 dark:bg-danger-950 text-danger-700",
                  )}
                >
                  {drillFeedback[idx].isCorrect ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {language === "fa" ? "پاسخ صحیح!" : "Correct!"}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <X className="w-4 h-4" />
                        {language === "fa" ? "پاسخ صحیح:" : "Correct answer:"}
                      </div>
                      <code className="bg-white dark:bg-neutral-800 px-2 py-1 rounded">
                        {drillFeedback[idx].correctAnswer}
                      </code>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="ghost" onClick={resetDrills}>
              {language === "fa" ? "شروع مجدد" : "Reset"}
            </Button>
            <Button
              variant="primary"
              onClick={submitAllDrills}
              disabled={
                Object.keys(drillAnswers).length !==
                interactiveDrill.questions.length
              }
            >
              {language === "fa" ? "تایید همه" : "Submit All"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrammarSection;

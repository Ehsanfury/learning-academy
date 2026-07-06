/**
 * IntroductionSection.jsx
 * هدف: نمایش بخش مقدماتی درس - توضیحات و اهداف
 * ارتباط: استفاده شده در sectionRenderer برای نوع 'introduction'
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { Target, Clock, Zap, ChevronDown, ChevronUp, Play } from "lucide-react";
import Button from "@components/ui/Button";
import { cn } from "@utils/helpers";

function IntroductionSection({
  section,
  onContinue = null,
  isActive = true,
  sectionIndex = 0,
}) {
  const { language } = useLanguageContext();
  const [expandedObjectives, setExpandedObjectives] = useState(false);

  const content = section.content?.[language] || section.content?.en || "";
  const objectives =
    section.learningObjectives?.[language] ||
    section.learningObjectives?.en ||
    [];
  const duration = section.duration || 0;
  const audioSrc = section.audio;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Audio Player (if available) */}
      {audioSrc && (
        <div className="mb-6">
          <audio ref={audioRef} src={audioSrc} preload="metadata" />
          <button
            onClick={toggleAudio}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-2xl hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isPlaying
                    ? "bg-primary-500"
                    : "bg-primary-200 dark:bg-primary-800",
                )}
              >
                <Play
                  className={cn(
                    "w-5 h-5",
                    isPlaying
                      ? "text-white"
                      : "text-primary-600 dark:text-primary-400",
                  )}
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {language === "fa"
                    ? "گوش دادن به معرفی درس"
                    : "Listen to lesson introduction"}
                </p>
                {duration > 0 && (
                  <p className="text-xs text-primary-500">
                    {duration} {language === "fa" ? "ثانیه" : "seconds"}
                  </p>
                )}
              </div>
            </div>
            {isPlaying && (
              <motion.div
                className="flex gap-0.5"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-primary-500 rounded-full"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </motion.div>
            )}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-soft mb-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      {objectives.length > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-5 mb-6">
          <button
            onClick={() => setExpandedObjectives(!expandedObjectives)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa" ? "اهداف یادگیری" : "Learning Objectives"}
              </h3>
            </div>
            {expandedObjectives ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          <motion.div
            initial={false}
            animate={{
              height: expandedObjectives ? "auto" : 0,
              opacity: expandedObjectives ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-2">
              {objectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <span className="text-primary-500 mt-0.5">✓</span>
                  <span>{objective}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* Estimated Time */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {language === "fa" ? "زمان تخمینی" : "Estimated time"}
          </span>
        </div>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          ~{section.duration || 5} {language === "fa" ? "دقیقه" : "minutes"}
        </span>
      </div>

      {/* Continue Button */}
      {onContinue && (
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            icon={ChevronDown}
            iconPosition="left"
          >
            {language === "fa" ? "شروع بخش اول" : "Start First Section"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default IntroductionSection;

/**
 * sectionRenderer.js
 * هدف: رندر کردن بخش‌های مختلف درس بر اساس نوع
 * ارتباط: استفاده شده در LessonPage و LessonContent
 */

import React from "react";
import VocabularySection from "../components/VocabularySection";
import GrammarSection from "../components/GrammarSection";
import ListeningSection from "../components/ListeningSection";
import SpeakingSection from "../components/SpeakingSection";
import ReadingSection from "../components/ReadingSection";
import WritingSection from "../components/WritingSection";
import QuizSection from "../components/QuizSection";
import SummarySection from "../components/SummarySection";
import IntroductionSection from "../components/IntroductionSection";
import debug from "../../../utils/debug";

/**
 * رجیستری کامپوننت‌های بخش‌ها
 */
const SECTION_COMPONENTS = {
  introduction: IntroductionSection,
  vocabulary: VocabularySection,
  grammar: GrammarSection,
  listening: ListeningSection,
  speaking: SpeakingSection,
  reading: ReadingSection,
  writing: WritingSection,
  quiz: QuizSection,
  summary: SummarySection,
};

/**
 * رندر کردن یک بخش خاص از درس
 * @param {Object} section - داده‌های بخش
 * @param {Object} props - پراپ‌های اضافی
 * @returns {JSX.Element|null}
 */
export function renderSection(section, props = {}) {
  if (!section || !section.type) {
    debug.warn("Invalid section provided to renderSection");
    return null;
  }

  const Component = SECTION_COMPONENTS[section.type];

  if (!Component) {
    debug.warn(`No component found for section type: ${section.type}`);
    return null;
  }

  return React.createElement(Component, {
    key: section.id || section.type,
    section,
    ...props,
  });
}

/**
 * رندر کردن چندین بخش پشت سر هم
 * @param {Array} sections - آرایه بخش‌ها
 * @param {Object} props - پراپ‌های مشترک
 * @returns {Array} آرایه JSX
 */
export function renderSections(sections, props = {}) {
  if (!sections || !Array.isArray(sections)) {
    return [];
  }

  return sections.map((section, index) =>
    renderSection(section, {
      ...props,
      sectionIndex: index,
      isFirst: index === 0,
      isLast: index === sections.length - 1,
    }),
  );
}

/**
 * گرفتن تایتل بخش بر اساس زبان
 */
export function getSectionTitle(section, language) {
  if (!section || !section.title) return "";

  if (typeof section.title === "string") {
    return section.title;
  }

  return section.title[language] || section.title.en || section.type;
}

/**
 * گرفتن وضعیت تکمیل بخش
 */
export function getSectionCompletionStatus(section, userAnswers = {}) {
  if (!section) return { completed: false, percentage: 0 };

  switch (section.type) {
    case "quiz":
      if (!section.questions || section.questions.length === 0) {
        return { completed: true, percentage: 100 };
      }
      const answeredCount = section.questions.filter(
        (q) => userAnswers[q.id] !== undefined && userAnswers[q.id] !== "",
      ).length;
      const percentage = (answeredCount / section.questions.length) * 100;
      return {
        completed: answeredCount === section.questions.length,
        percentage,
        answeredCount,
        totalCount: section.questions.length,
      };

    case "vocabulary":
      const reviewedCount =
        section.words?.filter((w) => userAnswers[w.id] === true).length || 0;
      return {
        completed: reviewedCount === section.words?.length,
        percentage: (reviewedCount / (section.words?.length || 1)) * 100,
        reviewedCount,
        totalCount: section.words?.length || 0,
      };

    default:
      return { completed: false, percentage: 0 };
  }
}

/**
 * گرفتن آیکون بخش
 */
export function getSectionIcon(sectionType) {
  const icons = {
    introduction: "🎯",
    vocabulary: "📝",
    grammar: "📐",
    listening: "🎧",
    speaking: "🎙️",
    reading: "📖",
    writing: "✍️",
    quiz: "📋",
    summary: "📌",
  };
  return icons[sectionType] || "📄";
}

/**
 * گرفتن رنگ بخش
 */
export function getSectionColor(sectionType) {
  const colors = {
    introduction: "from-sky-400 to-blue-500",
    vocabulary: "from-emerald-400 to-green-500",
    grammar: "from-purple-400 to-violet-500",
    listening: "from-amber-400 to-orange-500",
    speaking: "from-rose-400 to-red-500",
    reading: "from-cyan-400 to-teal-500",
    writing: "from-indigo-400 to-blue-500",
    quiz: "from-fuchsia-400 to-pink-500",
    summary: "from-gray-400 to-neutral-500",
  };
  return colors[sectionType] || "from-primary-400 to-primary-600";
}

export default {
  renderSection,
  renderSections,
  getSectionTitle,
  getSectionCompletionStatus,
  getSectionIcon,
  getSectionColor,
};

/**
 * lesson-engine/index.js
 * خروجی‌های عمومی ماژول Lesson Engine
 */

// Hooks
export { default as useLessonEngine } from "./hooks/useLessonEngine";

// Parsers & Renderers
export { default as LessonParser } from "./parsers/lessonParser";
export {
  default as sectionRenderer,
  renderSection,
  renderSections,
} from "./renderers/sectionRenderer";

// Components
export { default as IntroductionSection } from "./components/IntroductionSection";
export { default as VocabularySection } from "./components/VocabularySection";
export { default as GrammarSection } from "./components/GrammarSection";
export { default as ListeningSection } from "./components/ListeningSection";
export { default as SpeakingSection } from "./components/SpeakingSection";
export { default as ReadingSection } from "./components/ReadingSection";
export { default as WritingSection } from "./components/WritingSection";
export { default as QuizSection } from "./components/QuizSection";
export { default as SummarySection } from "./components/SummarySection";

// Utilities
export {
  getSectionIcon,
  getSectionColor,
  getSectionTitle,
} from "./renderers/sectionRenderer";

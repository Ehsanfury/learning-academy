/**
 * lessonParser.js
 * هدف: تبدیل JSON خام درس به ساختار قابل استفاده برای کامپوننت‌ها
 * ارتباط: استفاده شده در useLessonEngine hook
 */

export class LessonParser {
  /**
   * پارس کردن کل درس
   * @param {Object} rawLesson - JSON خام درس از فایل content
   * @returns {Object} درس پارس شده با ساختار نرمال‌شده
   */
  static parseLesson(rawLesson) {
    if (!rawLesson) return null;

    return {
      id: rawLesson.id,
      level: rawLesson.level,
      unit: rawLesson.unit,
      lessonNumber: rawLesson.lessonNumber,
      title: rawLesson.title,
      shortTitle: rawLesson.shortTitle,
      description: rawLesson.description,
      learningObjectives: rawLesson.learningObjectives,
      xpReward: rawLesson.xpReward,
      perfectBonusXP: rawLesson.perfectBonusXP || 25,
      estimatedMinutes: rawLesson.estimatedMinutes,
      difficulty: rawLesson.difficulty || 1,
      tags: rawLesson.tags || [],
      prerequisites: rawLesson.prerequisites || [],
      nextLessonId: rawLesson.nextLessonId,
      previousLessonId: rawLesson.previousLessonId,
      sections: this.parseSections(rawLesson.sections || []),
      spacedRepetitionCards: rawLesson.spacedRepetitionCards || [],
      media: rawLesson.media || {},
      createdAt: rawLesson.createdAt,
      updatedAt: rawLesson.updatedAt,
      version: rawLesson.version,
    };
  }

  /**
   * پارس کردن بخش‌های مختلف درس
   */
  static parseSections(sections) {
    return sections.map((section, index) => {
      const baseSection = {
        id: `${section.type}_${index}`,
        type: section.type,
        title: section.title,
        order: index,
      };

      switch (section.type) {
        case "introduction":
          return {
            ...baseSection,
            content: section.content,
            audio: section.audio,
            duration: section.duration,
          };

        case "vocabulary":
          return {
            ...baseSection,
            words: this.parseVocabularyWords(section.words || []),
            totalWords: section.totalWords,
            interactive: section.interactive,
            memorizationHint: section.memorizationHint,
          };

        case "grammar":
          return {
            ...baseSection,
            concept: section.concept,
            explanation: section.explanation,
            examples: section.examples || [],
            commonMistakes: section.commonMistakes || [],
            interactiveDrill: section.interactiveDrill,
          };

        case "listening":
          return {
            ...baseSection,
            description: section.description,
            audio: section.audio,
            transcript: section.transcript,
            questions: this.parseQuestions(section.questions || []),
          };

        case "speaking":
          return {
            ...baseSection,
            description: section.description,
            phrases: section.phrases || [],
            aiPractice: section.aiPractice,
          };

        case "reading":
          return {
            ...baseSection,
            passage: section.passage,
            questions: this.parseQuestions(section.questions || []),
            vocabularyHighlight: section.vocabularyHighlight || [],
          };

        case "quiz":
          return {
            ...baseSection,
            description: section.description,
            passingScore: section.passingScore || 70,
            questions: this.parseQuestions(section.questions || []),
            timed: section.timed || false,
            timeLimitSeconds: section.timeLimitSeconds,
          };

        case "summary":
          return {
            ...baseSection,
            whatYouLearned: section.whatYouLearned,
            keyVocabulary: section.keyVocabulary || [],
            nextSteps: section.nextSteps,
            dailyPractice: section.dailyPractice,
          };

        default:
          return baseSection;
      }
    });
  }

  /**
   * پارس کردن کلمات بخش واژگان
   */
  static parseVocabularyWords(words) {
    return words.map((word) => ({
      id: this.generateWordId(word.de),
      de: word.de,
      fa: word.fa,
      en: word.en,
      transliteration: word.transliteration,
      audio: word.audio,
      example: word.example,
      note: word.note,
      timeContext: word.timeContext,
    }));
  }

  /**
   * پارس کردن سوالات (آزمون، شنیداری، خواندنی)
   */
  static parseQuestions(questions) {
    return questions.map((q, index) => ({
      id: q.id || `q_${index}`,
      type: q.type,
      text: q.text,
      options: q.options,
      correct: q.correct,
      answer: q.answer,
      acceptVariants: q.acceptVariants || [],
      pairs: q.pairs,
      explanation: q.explanation,
      xpBonus: q.xpBonus || 0,
    }));
  }

  /**
   * تولید ID یکتا برای کلمه
   */
  static generateWordId(germanWord) {
    return germanWord
      .toLowerCase()
      .replace(/[^a-zäöüß]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  /**
   * استخراج تمام کلمات درس
   */
  static extractAllVocabulary(lesson) {
    const vocabularySection = lesson.sections.find(
      (s) => s.type === "vocabulary",
    );
    if (!vocabularySection || !vocabularySection.words) return [];
    return vocabularySection.words;
  }

  /**
   * محاسبه تعداد کل سوالات درس
   */
  static getTotalQuestions(lesson) {
    let total = 0;
    for (const section of lesson.sections) {
      if (section.questions) {
        total += section.questions.length;
      }
      if (section.type === "quiz" && section.questions) {
        total += section.questions.length;
      }
    }
    return total;
  }

  /**
   * گرفتن زمان تخمینی تکمیل درس
   */
  static getEstimatedCompletionTime(lesson) {
    let totalMinutes = lesson.estimatedMinutes || 0;

    for (const section of lesson.sections) {
      if (section.type === "vocabulary") {
        totalMinutes += (section.words?.length || 0) * 0.5;
      }
      if (section.type === "quiz" && section.questions) {
        totalMinutes += section.questions.length * 0.5;
      }
    }

    return Math.ceil(totalMinutes);
  }

  /**
   * بررسی آمادگی کاربر برای شروع درس (بر اساس پیش‌نیازها)
   */
  static checkPrerequisites(lesson, userProgress) {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return { ready: true, missingPrerequisites: [] };
    }

    const missing = lesson.prerequisites.filter(
      (prereqId) => !userProgress.completedLessons?.includes(prereqId),
    );

    return {
      ready: missing.length === 0,
      missingPrerequisites: missing,
    };
  }
}

export default LessonParser;

/**
 * ExerciseFactory.js
 * Path: backend/services/exerciseEngine/ExerciseFactory.js
 * Description: Factory pattern for creating different exercise types
 * Version: 2.0 - Complete implementation
 */

import { v4 as uuidv4 } from "uuid";
import logger from "../../config/logger.js";

// ============================================
// 📊 Exercise Types
// ============================================

export const EXERCISE_TYPES = {
  // Vocabulary
  MATCH: "match",
  MULTIPLE_CHOICE: "multiple_choice",
  FLASHCARD: "flashcard",
  WORD_FAMILY: "word_family",
  SYNONYM: "synonym",
  ANTONYM: "antonym",
  CATEGORIZATION: "categorization",
  MISSING_LETTERS: "missing_letters",
  WORD_ORDERING: "word_ordering",
  MEMORY_RECALL: "memory_recall",

  // Grammar
  FILL_IN_BLANK: "fill_in_blank",
  SENTENCE_TRANSFORMATION: "sentence_transformation",
  ERROR_CORRECTION: "error_correction",
  BUILD_SENTENCE: "build_sentence",
  REWRITE_SENTENCE: "rewrite_sentence",
  NEGATIVE_FORM: "negative_form",
  QUESTION_FORM: "question_form",
  CONJUGATION: "conjugation",
  MIXED_GRAMMAR: "mixed_grammar",

  // Reading
  COMPREHENSION: "comprehension",
  TRUE_FALSE: "true_false",
  SEQUENCING: "sequencing",
  FIND_INFORMATION: "find_information",
  SUMMARIZE: "summarize",

  // Listening
  LISTEN_MULTIPLE_CHOICE: "listen_multiple_choice",
  LISTEN_GAP_FILL: "listen_gap_fill",
  LISTEN_ORDERING: "listen_ordering",
  LISTEN_IDENTIFY: "listen_identify",
  LISTEN_ANSWER: "listen_answer",

  // Speaking
  SHADOWING: "shadowing",
  PRONUNCIATION_DRILL: "pronunciation_drill",
  GUIDED_SPEAKING: "guided_speaking",
  ROLE_PLAY: "role_play",
  INTERVIEW: "interview",
  FREE_SPEAKING: "free_speaking",

  // Writing
  SENTENCE_COMPLETION: "sentence_completion",
  GUIDED_WRITING: "guided_writing",
  SHORT_PARAGRAPH: "short_paragraph",
  EMAIL: "email",
  DIALOGUE_WRITING: "dialogue_writing",
  CREATIVE_WRITING: "creative_writing",

  // Interactive
  DRAG_DROP: "drag_drop",
  MATCHING_CARDS: "matching_cards",
  MEMORY_GAME: "memory_game",
  SENTENCE_BUILDER: "sentence_builder",
  CLICK_CORRECT: "click_correct",
  DICTATION: "dictation",
  TYPING_CHALLENGE: "typing_challenge",
  TIMED_QUIZ: "timed_quiz",
  CROSSWORD: "crossword",
  WORD_SEARCH: "word_search",
};

// ============================================
// 🏭 Exercise Factory
// ============================================

class ExerciseFactory {
  constructor() {
    this.exerciseRegistry = new Map();
    this.registerDefaultExercises();
  }

  registerDefaultExercises() {
    // Register all exercise types with their creators
    this.register(EXERCISE_TYPES.MATCH, this.createMatchExercise);
    this.register(EXERCISE_TYPES.MULTIPLE_CHOICE, this.createMultipleChoiceExercise);
    this.register(EXERCISE_TYPES.FILL_IN_BLANK, this.createFillInBlankExercise);
    this.register(EXERCISE_TYPES.TRUE_FALSE, this.createTrueFalseExercise);
    this.register(EXERCISE_TYPES.FLASHCARD, this.createFlashcardExercise);
    this.register(EXERCISE_TYPES.DRAG_DROP, this.createDragDropExercise);
    this.register(EXERCISE_TYPES.SENTENCE_BUILDER, this.createSentenceBuilderExercise);
    this.register(EXERCISE_TYPES.ERROR_CORRECTION, this.createErrorCorrectionExercise);
    this.register(EXERCISE_TYPES.CONJUGATION, this.createConjugationExercise);
    this.register(EXERCISE_TYPES.WORD_ORDERING, this.createWordOrderingExercise);
    this.register(EXERCISE_TYPES.LISTEN_GAP_FILL, this.createListenGapFillExercise);
    this.register(EXERCISE_TYPES.GUIDED_SPEAKING, this.createGuidedSpeakingExercise);
    this.register(EXERCISE_TYPES.GUIDED_WRITING, this.createGuidedWritingExercise);
    this.register(EXERCISE_TYPES.TIMED_QUIZ, this.createTimedQuizExercise);
  }

  register(type, creator) {
    this.exerciseRegistry.set(type, creator.bind(this));
  }

  // ============================================
  // 🔧 Exercise Creators
  // ============================================

  createMatchExercise(data) {
    const { items, title, description, difficulty = 1 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.MATCH,
      title: title || { fa: "تطبیق دهید", en: "Match", de: "Zuordnen" },
      description,
      difficulty,
      data: {
        items: items.map((item) => ({
          id: uuidv4(),
          left: item.left,
          right: item.right,
          pairId: item.pairId || uuidv4(),
        })),
      },
      config: {
        shuffle: true,
        showFeedback: true,
        timeLimit: null,
      },
      feedback: {
        correct: { fa: "✅ عالی!", en: "✅ Perfect!", de: "✅ Perfekt!" },
        incorrect: {
          fa: "❌ دوباره تلاش کنید",
          en: "❌ Try again",
          de: "❌ Versuchen Sie es erneut",
        },
      },
    };
  }

  createMultipleChoiceExercise(data) {
    const { question, options, correctIndex, explanation, difficulty = 1 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.MULTIPLE_CHOICE,
      title: data.title || { fa: "انتخاب کنید", en: "Choose", de: "Wählen Sie" },
      description: data.description,
      difficulty,
      data: {
        question,
        options: options.map((opt, idx) => ({
          id: uuidv4(),
          text: opt,
          isCorrect: idx === correctIndex,
        })),
        correctIndex,
        explanation,
      },
      config: {
        shuffle: true,
        showFeedback: true,
        timeLimit: 30,
      },
      feedback: {
        correct: { fa: "✅ پاسخ صحیح!", en: "✅ Correct!", de: "✅ Richtig!" },
        incorrect: { fa: "❌ پاسخ نادرست", en: "❌ Incorrect", de: "❌ Falsch" },
      },
    };
  }

  createFillInBlankExercise(data) {
    const { prompt, answer, hint, explanation, difficulty = 1 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.FILL_IN_BLANK,
      title: data.title || { fa: "پر کنید", en: "Fill in", de: "Füllen Sie" },
      description: data.description,
      difficulty,
      data: {
        prompt,
        answer,
        hint,
        explanation,
        caseSensitive: false,
        trimWhitespace: true,
      },
      config: {
        showHint: true,
        showFeedback: true,
        timeLimit: 45,
      },
      feedback: {
        correct: { fa: "✅ عالی!", en: "✅ Perfect!", de: "✅ Perfekt!" },
        incorrect: { fa: "❌ پاسخ صحیح: ", en: "❌ Correct answer: ", de: "❌ Richtige Antwort: " },
      },
    };
  }

  createTrueFalseExercise(data) {
    const { statement, answer, explanation, difficulty = 1 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.TRUE_FALSE,
      title: data.title || { fa: "درست یا نادرست", en: "True or False", de: "Richtig oder Falsch" },
      description: data.description,
      difficulty,
      data: {
        statement,
        answer,
        explanation,
      },
      config: {
        showFeedback: true,
        timeLimit: 20,
      },
      feedback: {
        correct: { fa: "✅ درست!", en: "✅ Correct!", de: "✅ Richtig!" },
        incorrect: { fa: "❌ نادرست!", en: "❌ Incorrect!", de: "❌ Falsch!" },
      },
    };
  }

  createFlashcardExercise(data) {
    const { cards, title, description, difficulty = 1 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.FLASHCARD,
      title: title || { fa: "فلش‌کارت", en: "Flashcards", de: "Karteikarten" },
      description,
      difficulty,
      data: {
        cards: cards.map((card) => ({
          id: uuidv4(),
          front: card.front,
          back: card.back,
          icon: card.icon || "📝",
          example: card.example,
          pronunciation: card.pronunciation,
        })),
      },
      config: {
        shuffle: true,
        autoFlip: false,
        showFeedback: true,
        timeLimit: null,
      },
      feedback: {
        correct: { fa: "✅ می‌دانید!", en: "✅ You know it!", de: "✅ Sie wissen es!" },
        incorrect: { fa: "🔄 دوباره مرور کنید", en: "🔄 Review again", de: "🔄 Wiederholen Sie" },
      },
    };
  }

  createDragDropExercise(data) {
    const { items, targets, title, description, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.DRAG_DROP,
      title: title || { fa: "بکشید و رها کنید", en: "Drag and Drop", de: "Ziehen und Ablegen" },
      description,
      difficulty,
      data: {
        items: items.map((item) => ({
          id: uuidv4(),
          text: item.text,
          targetId: item.targetId,
          icon: item.icon,
        })),
        targets: targets.map((target) => ({
          id: uuidv4(),
          label: target.label,
          accepts: target.accepts || [],
        })),
      },
      config: {
        shuffle: true,
        showFeedback: true,
        timeLimit: 60,
      },
      feedback: {
        correct: {
          fa: "✅ درست چیدمان شد!",
          en: "✅ Correctly arranged!",
          de: "✅ Richtig angeordnet!",
        },
        incorrect: {
          fa: "❌ دوباره تلاش کنید",
          en: "❌ Try again",
          de: "❌ Versuchen Sie es erneut",
        },
      },
    };
  }

  createSentenceBuilderExercise(data) {
    const { words, correctOrder, title, description, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.SENTENCE_BUILDER,
      title: title || { fa: "جمله بسازید", en: "Build a Sentence", de: "Bauen Sie einen Satz" },
      description,
      difficulty,
      data: {
        words: words.map((word) => ({
          id: uuidv4(),
          text: word,
        })),
        correctOrder,
        punctuation: data.punctuation || ".",
      },
      config: {
        shuffle: true,
        showFeedback: true,
        timeLimit: 60,
      },
      feedback: {
        correct: { fa: "✅ جمله درست!", en: "✅ Correct sentence!", de: "✅ Richtiger Satz!" },
        incorrect: {
          fa: "❌ ترتیب اشتباه است",
          en: "❌ Wrong order",
          de: "❌ Falsche Reihenfolge",
        },
      },
    };
  }

  createErrorCorrectionExercise(data) {
    const { sentence, errors, correctedSentence, explanation, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.ERROR_CORRECTION,
      title: title || {
        fa: "خطاها را پیدا کنید",
        en: "Find the Errors",
        de: "Finden Sie die Fehler",
      },
      description: data.description,
      difficulty,
      data: {
        sentence,
        errors: errors.map((err) => ({
          id: uuidv4(),
          original: err.original,
          corrected: err.corrected,
          explanation: err.explanation,
          position: err.position,
          type: err.type || "grammar",
        })),
        correctedSentence,
        explanation,
      },
      config: {
        showFeedback: true,
        timeLimit: 90,
      },
      feedback: {
        correct: {
          fa: "✅ همه خطاها را پیدا کردید!",
          en: "✅ Found all errors!",
          de: "✅ Alle Fehler gefunden!",
        },
        incorrect: {
          fa: "🔍 چند خطا باقی مانده",
          en: "🔍 Some errors remain",
          de: "🔍 Einige Fehler bleiben",
        },
      },
    };
  }

  createConjugationExercise(data) {
    const { verb, tense, pronouns, conjugations, title, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.CONJUGATION,
      title: title || { fa: "صرف فعل", en: "Conjugation", de: "Konjugation" },
      description: data.description,
      difficulty,
      data: {
        verb,
        tense,
        pronouns: pronouns.map((pronoun, idx) => ({
          id: uuidv4(),
          pronoun,
          correct: conjugations[idx],
        })),
      },
      config: {
        showFeedback: true,
        timeLimit: 60,
      },
      feedback: {
        correct: {
          fa: "✅ صرف درست!",
          en: "✅ Correct conjugation!",
          de: "✅ Richtige Konjugation!",
        },
        incorrect: {
          fa: "❌ صرف نادرست",
          en: "❌ Incorrect conjugation",
          de: "❌ Falsche Konjugation",
        },
      },
    };
  }

  createWordOrderingExercise(data) {
    const { words, correctOrder, title, description, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.WORD_ORDERING,
      title: title || { fa: "ترتیب کلمات", en: "Word Order", de: "Wortstellung" },
      description,
      difficulty,
      data: {
        words: words.map((word) => ({
          id: uuidv4(),
          text: word,
        })),
        correctOrder,
        explanation: data.explanation,
      },
      config: {
        shuffle: true,
        showFeedback: true,
        timeLimit: 60,
      },
      feedback: {
        correct: { fa: "✅ ترتیب درست!", en: "✅ Correct order!", de: "✅ Richtige Reihenfolge!" },
        incorrect: {
          fa: "❌ ترتیب اشتباه است",
          en: "❌ Wrong order",
          de: "❌ Falsche Reihenfolge",
        },
      },
    };
  }

  createListenGapFillExercise(data) {
    const { audioUrl, transcript, gaps, answers, title, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.LISTEN_GAP_FILL,
      title: title || { fa: "گوش دهید و پر کنید", en: "Listen and Fill", de: "Hören und Füllen" },
      description: data.description,
      difficulty,
      data: {
        audioUrl,
        transcript,
        gaps: gaps.map((gap, idx) => ({
          id: uuidv4(),
          position: gap.position,
          placeholder: gap.placeholder || "___",
          correct: answers[idx],
          hint: gap.hint,
        })),
      },
      config: {
        showFeedback: true,
        timeLimit: 120,
        allowReplay: true,
      },
      feedback: {
        correct: {
          fa: "✅ گوش دادید و کامل کردید!",
          en: "✅ Listened and completed!",
          de: "✅ Gehört und vervollständigt!",
        },
        incorrect: {
          fa: "🔍 دوباره گوش دهید",
          en: "🔍 Listen again",
          de: "🔍 Hören Sie noch einmal",
        },
      },
    };
  }

  createGuidedSpeakingExercise(data) {
    const { prompts, modelAnswer, title, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.GUIDED_SPEAKING,
      title: title || { fa: "گفتار هدایت‌شده", en: "Guided Speaking", de: "Geführtes Sprechen" },
      description: data.description,
      difficulty,
      data: {
        prompts: prompts.map((prompt) => ({
          id: uuidv4(),
          text: prompt.text,
          hint: prompt.hint,
          modelAnswer: prompt.modelAnswer,
        })),
        modelAnswer,
        tips: data.tips || [],
      },
      config: {
        showFeedback: true,
        timeLimit: 180,
      },
      feedback: {
        correct: { fa: "✅ گفتار خوب!", en: "✅ Good speaking!", de: "✅ Gutes Sprechen!" },
        incorrect: {
          fa: "🔍 دوباره تمرین کنید",
          en: "🔍 Practice again",
          de: "🔍 Üben Sie noch einmal",
        },
      },
    };
  }

  createGuidedWritingExercise(data) {
    const { prompts, modelAnswer, title, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.GUIDED_WRITING,
      title: title || { fa: "نوشتن هدایت‌شده", en: "Guided Writing", de: "Geführtes Schreiben" },
      description: data.description,
      difficulty,
      data: {
        prompts: prompts.map((prompt) => ({
          id: uuidv4(),
          text: prompt.text,
          hint: prompt.hint,
          modelAnswer: prompt.modelAnswer,
        })),
        modelAnswer,
        tips: data.tips || [],
      },
      config: {
        showFeedback: true,
        timeLimit: 300,
      },
      feedback: {
        correct: { fa: "✅ نوشتن خوب!", en: "✅ Good writing!", de: "✅ Gutes Schreiben!" },
        incorrect: {
          fa: "🔍 دوباره بنویسید",
          en: "🔍 Write again",
          de: "🔍 Schreiben Sie noch einmal",
        },
      },
    };
  }

  createTimedQuizExercise(data) {
    const { questions, timeLimit, title, description, difficulty = 2 } = data;

    return {
      id: uuidv4(),
      type: EXERCISE_TYPES.TIMED_QUIZ,
      title: title || { fa: "آزمون زمان‌دار", en: "Timed Quiz", de: "Zeitgesteuertes Quiz" },
      description,
      difficulty,
      data: {
        questions: questions.map((q) => ({
          id: uuidv4(),
          ...q,
        })),
        timeLimit: timeLimit || 60,
        totalQuestions: questions.length,
      },
      config: {
        showFeedback: true,
        timeLimit: timeLimit || 60,
        showTimer: true,
      },
      feedback: {
        correct: { fa: "✅ زمان تمام شد!", en: "✅ Time's up!", de: "✅ Zeit ist um!" },
        incorrect: {
          fa: "⏰ زمان بیشتر نیاز دارید",
          en: "⏰ Need more time",
          de: "⏰ Brauchen Sie mehr Zeit",
        },
      },
    };
  }

  // ============================================
  // 🎯 Exercise Generator
  // ============================================

  generate(type, data) {
    const creator = this.exerciseRegistry.get(type);
    if (!creator) {
      logger.error(`❌ Exercise type "${type}" not registered`);
      throw new Error(`Exercise type "${type}" not supported`);
    }

    try {
      const exercise = creator(data);
      return this.enrichExercise(exercise);
    } catch (error) {
      logger.error(`❌ Error generating exercise of type "${type}":`, error);
      throw error;
    }
  }

  enrichExercise(exercise) {
    // Add common metadata
    return {
      ...exercise,
      metadata: {
        ...exercise.metadata,
        generatedAt: new Date().toISOString(),
        version: "2.0.0",
        schema: "exercise-v2",
      },
      stats: {
        attempts: 0,
        successRate: 0,
        avgTime: 0,
      },
    };
  }

  // ============================================
  // 📊 Get Available Types
  // ============================================

  getAvailableTypes() {
    return Array.from(this.exerciseRegistry.keys());
  }

  getExerciseTypeInfo(type) {
    const info = {
      [EXERCISE_TYPES.MATCH]: {
        category: "vocabulary",
        difficultyRange: [1, 3],
        estimatedTime: 30,
      },
      [EXERCISE_TYPES.MULTIPLE_CHOICE]: {
        category: "all",
        difficultyRange: [1, 5],
        estimatedTime: 20,
      },
      [EXERCISE_TYPES.FILL_IN_BLANK]: {
        category: "grammar",
        difficultyRange: [1, 4],
        estimatedTime: 30,
      },
      [EXERCISE_TYPES.TRUE_FALSE]: {
        category: "reading",
        difficultyRange: [1, 3],
        estimatedTime: 15,
      },
      [EXERCISE_TYPES.FLASHCARD]: {
        category: "vocabulary",
        difficultyRange: [1, 3],
        estimatedTime: 10,
      },
      [EXERCISE_TYPES.DRAG_DROP]: {
        category: "interactive",
        difficultyRange: [2, 4],
        estimatedTime: 45,
      },
      [EXERCISE_TYPES.SENTENCE_BUILDER]: {
        category: "grammar",
        difficultyRange: [2, 4],
        estimatedTime: 45,
      },
      [EXERCISE_TYPES.ERROR_CORRECTION]: {
        category: "grammar",
        difficultyRange: [3, 5],
        estimatedTime: 60,
      },
      [EXERCISE_TYPES.CONJUGATION]: {
        category: "grammar",
        difficultyRange: [2, 4],
        estimatedTime: 30,
      },
      [EXERCISE_TYPES.WORD_ORDERING]: {
        category: "grammar",
        difficultyRange: [2, 4],
        estimatedTime: 30,
      },
      [EXERCISE_TYPES.LISTEN_GAP_FILL]: {
        category: "listening",
        difficultyRange: [2, 4],
        estimatedTime: 60,
      },
      [EXERCISE_TYPES.GUIDED_SPEAKING]: {
        category: "speaking",
        difficultyRange: [2, 4],
        estimatedTime: 120,
      },
      [EXERCISE_TYPES.GUIDED_WRITING]: {
        category: "writing",
        difficultyRange: [2, 4],
        estimatedTime: 180,
      },
      [EXERCISE_TYPES.TIMED_QUIZ]: {
        category: "assessment",
        difficultyRange: [1, 5],
        estimatedTime: 60,
      },
    };

    return (
      info[type] || {
        category: "unknown",
        difficultyRange: [1, 3],
        estimatedTime: 30,
      }
    );
  }
}

export default new ExerciseFactory();

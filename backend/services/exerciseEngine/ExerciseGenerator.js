/**
 * ExerciseGenerator.js
 * Path: backend/services/exerciseEngine/ExerciseGenerator.js
 * Description: Generates exercises from lesson content
 * Version: 2.0 - Complete implementation
 */

import ExerciseFactory, { EXERCISE_TYPES } from "./ExerciseFactory.js";
import logger from "../../config/logger.js";

class ExerciseGenerator {
  // ============================================
  // 🎯 Main Generation Method
  // ============================================

  generateFromLesson(lesson, options = {}) {
    const {
      types = this.getDefaultTypes(),
      difficulty = 1,
      count = 10,
      includeAll = false,
    } = options;

    const exercises = [];

    // Generate vocabulary exercises
    if (types.includes("vocabulary") && lesson.vocabulary) {
      exercises.push(...this.generateVocabularyExercises(lesson.vocabulary, difficulty));
    }

    // Generate grammar exercises
    if (types.includes("grammar") && lesson.grammar) {
      exercises.push(...this.generateGrammarExercises(lesson.grammar, difficulty));
    }

    // Generate reading exercises
    if (types.includes("reading") && lesson.reading) {
      exercises.push(...this.generateReadingExercises(lesson.reading, difficulty));
    }

    // Generate listening exercises
    if (types.includes("listening") && lesson.listening) {
      exercises.push(...this.generateListeningExercises(lesson.listening, difficulty));
    }

    // Generate speaking exercises
    if (types.includes("speaking") && lesson.speaking) {
      exercises.push(...this.generateSpeakingExercises(lesson.speaking, difficulty));
    }

    // Generate writing exercises
    if (types.includes("writing") && lesson.writing) {
      exercises.push(...this.generateWritingExercises(lesson.writing, difficulty));
    }

    // Generate interactive exercises
    if (types.includes("interactive")) {
      exercises.push(...this.generateInteractiveExercises(lesson, difficulty));
    }

    // Limit the number of exercises
    const limited = includeAll ? exercises : exercises.slice(0, count);

    logger.info(`✅ Generated ${limited.length} exercises for lesson ${lesson.id}`);
    return limited;
  }

  // ============================================
  // 📚 Vocabulary Exercises
  // ============================================

  generateVocabularyExercises(vocabulary, difficulty) {
    const exercises = [];
    const words = vocabulary.filter((w) => w.de && w.fa);

    if (words.length === 0) return exercises;

    // Match exercise
    if (difficulty <= 2) {
      const matchItems = words.slice(0, 6).map((w) => ({
        left: w.de,
        right: w.fa,
        pairId: w.id,
      }));

      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.MATCH, {
          items: matchItems,
          title: {
            fa: "لغات را با معنی تطبیق دهید",
            en: "Match words with meanings",
            de: "Wörter mit Bedeutungen zuordnen",
          },
          difficulty,
        })
      );
    }

    // Multiple choice
    if (words.length >= 4) {
      const selected = words.slice(0, 4);
      const question = {
        fa: `معنی "${selected[0].de}" چیست؟`,
        en: `What is the meaning of "${selected[0].de}"?`,
        de: `Was bedeutet "${selected[0].de}"?`,
      };

      const options = selected.map((w) => w.fa);
      const correctIndex = 0;

      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.MULTIPLE_CHOICE, {
          question,
          options,
          correctIndex,
          explanation: {
            fa: `"${selected[0].de}" به معنی "${selected[0].fa}" است.`,
            en: `"${selected[0].de}" means "${selected[0].fa}".`,
            de: `"${selected[0].de}" bedeutet "${selected[0].fa}".`,
          },
          difficulty,
        })
      );
    }

    // Flashcards
    if (words.length > 0) {
      const cards = words.slice(0, 8).map((w) => ({
        front: w.de,
        back: {
          fa: w.fa,
          en: w.en || w.fa,
          de: w.de,
        },
        pronunciation: w.pronunciation,
        example: w.example?.de,
      }));

      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.FLASHCARD, {
          cards,
          title: { fa: "فلش‌کارت لغات", en: "Vocabulary Flashcards", de: "Vokabelkarteikarten" },
          difficulty,
        })
      );
    }

    return exercises;
  }

  // ============================================
  // 📝 Grammar Exercises
  // ============================================

  generateGrammarExercises(grammar, difficulty) {
    const exercises = [];

    if (!grammar || !grammar.topics) return exercises;

    grammar.topics.forEach((topic) => {
      // Fill in the blank
      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.FILL_IN_BLANK, {
          prompt: {
            fa: `جاهای خالی را با حرف تعریف مناسب پر کنید: ___ ${topic.title.fa}`,
            en: `Fill in the blanks with the correct article: ___ ${topic.title.en}`,
            de: `Füllen Sie die Lücken mit dem richtigen Artikel: ___ ${topic.title.de}`,
          },
          answer: "der",
          hint: {
            fa: "به جنسیت کلمه توجه کنید",
            en: "Pay attention to the gender of the word",
            de: "Achten Sie auf das Genus des Wortes",
          },
          explanation: {
            fa: `"${topic.title.fa}" ${topic.concept.fa}`,
            en: `"${topic.title.en}" ${topic.concept.en}`,
            de: `"${topic.title.de}" ${topic.concept.de}`,
          },
          difficulty,
        })
      );

      // Multiple choice
      if (topic.rules) {
        exercises.push(
          ExerciseFactory.generate(EXERCISE_TYPES.MULTIPLE_CHOICE, {
            question: {
              fa: `کدام یک از موارد زیر درست است؟`,
              en: `Which of the following is correct?`,
              de: `Welches der folgenden ist richtig?`,
            },
            options: [
              topic.rules.fa?.[0] || "گزینه ۱",
              topic.rules.fa?.[1] || "گزینه ۲",
              topic.rules.fa?.[2] || "گزینه ۳",
            ],
            correctIndex: 0,
            explanation: {
              fa: `گزینه اول صحیح است: ${topic.rules.fa?.[0] || ""}`,
              en: `The first option is correct: ${topic.rules.en?.[0] || ""}`,
              de: `Die erste Option ist richtig: ${topic.rules.de?.[0] || ""}`,
            },
            difficulty: Math.min(difficulty + 1, 5),
          })
        );
      }
    });

    return exercises;
  }

  // ============================================
  // 📖 Reading Exercises
  // ============================================

  generateReadingExercises(reading, difficulty) {
    const exercises = [];

    if (!reading || !reading.questions) return exercises;

    // True/False
    reading.questions.forEach((q) => {
      if (q.type === "true_false") {
        exercises.push(
          ExerciseFactory.generate(EXERCISE_TYPES.TRUE_FALSE, {
            statement: q.question,
            answer: q.answer,
            explanation: q.explanation,
            difficulty,
          })
        );
      }
    });

    // Multiple choice
    reading.questions.forEach((q) => {
      if (q.type === "multiple_choice") {
        exercises.push(
          ExerciseFactory.generate(EXERCISE_TYPES.MULTIPLE_CHOICE, {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty,
          })
        );
      }
    });

    return exercises;
  }

  // ============================================
  // 🎧 Listening Exercises
  // ============================================

  generateListeningExercises(listening, difficulty) {
    const exercises = [];

    if (!listening || !listening.tasks) return exercises;

    // Listening gap fill
    if (listening.script) {
      const lines = listening.script.de?.split("\n") || [];
      const gaps = lines.map((line, index) => ({
        position: index,
        placeholder: "___",
        correct: line.split(" ").slice(-2).join(" "),
      }));

      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.LISTEN_GAP_FILL, {
          audioUrl: listening.audioUrl || "/audio/placeholder.mp3",
          transcript: listening.script,
          gaps: gaps.slice(0, 3),
          answers: gaps.slice(0, 3).map((g) => g.correct),
          title: listening.title,
          difficulty,
        })
      );
    }

    return exercises;
  }

  // ============================================
  // 🗣️ Speaking Exercises
  // ============================================

  generateSpeakingExercises(speaking, difficulty) {
    const exercises = [];

    if (!speaking || !speaking.activities) return exercises;

    // Guided speaking
    const prompts = speaking.activities
      .filter((a) => a.type === "repeat" || a.type === "read_aloud")
      .slice(0, 3)
      .map((a) => ({
        text: a.phrases?.join(" ") || a.dialogue?.de || "",
        hint: a.instructions,
        modelAnswer: a.dialogue?.de || "",
      }));

    if (prompts.length > 0) {
      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.GUIDED_SPEAKING, {
          prompts,
          title: { fa: "تمرین گفتاری", en: "Speaking Practice", de: "Sprechübung" },
          difficulty,
        })
      );
    }

    return exercises;
  }

  // ============================================
  // ✍️ Writing Exercises
  // ============================================

  generateWritingExercises(writing, difficulty) {
    const exercises = [];

    if (!writing || !writing.activities) return exercises;

    // Guided writing
    const prompts = writing.activities
      .filter((a) => a.type === "complete_sentences" || a.type === "guided_writing")
      .slice(0, 3)
      .map((a) => ({
        text: a.sentences?.join(" ") || a.prompts || "",
        hint: a.hint,
        modelAnswer: a.modelAnswer || "",
      }));

    if (prompts.length > 0) {
      exercises.push(
        ExerciseFactory.generate(EXERCISE_TYPES.GUIDED_WRITING, {
          prompts,
          title: { fa: "تمرین نوشتاری", en: "Writing Practice", de: "Schreibübung" },
          difficulty,
        })
      );
    }

    return exercises;
  }

  // ============================================
  // 🎮 Interactive Exercises
  // ============================================

  generateInteractiveExercises(lesson, difficulty) {
    const exercises = [];

    // Sentence builder
    if (lesson.reading?.text) {
      const sentences = lesson.reading.text.de?.split("\n").filter((s) => s.trim()) || [];
      const selected = sentences.slice(0, 2);

      selected.forEach((sentence) => {
        const words = sentence.split(" ");
        exercises.push(
          ExerciseFactory.generate(EXERCISE_TYPES.SENTENCE_BUILDER, {
            words: words.map((w) => w.replace(/[.,!?]/g, "")).filter((w) => w),
            correctOrder: words.map((_, idx) => idx),
            title: { fa: "جمله بسازید", en: "Build a Sentence", de: "Bauen Sie einen Satz" },
            difficulty,
          })
        );
      });
    }

    return exercises;
  }

  // ============================================
  // 🛠️ Helper Methods
  // ============================================

  getDefaultTypes() {
    return ["vocabulary", "grammar", "reading", "listening", "speaking", "writing"];
  }
}

export default new ExerciseGenerator();

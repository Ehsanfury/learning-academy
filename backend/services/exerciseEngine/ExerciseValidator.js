/**
 * ExerciseValidator.js
 * Path: backend/services/exerciseEngine/ExerciseValidator.js
 * Description: Validates exercise answers and provides feedback
 * Version: 2.0 - Complete implementation
 */

import logger from "../../config/logger.js";
import { EXERCISE_TYPES } from "./ExerciseFactory.js";

class ExerciseValidator {
  // ============================================
  // 🔍 Main Validation Method
  // ============================================

  validate(exercise, userAnswers) {
    const validator = this.getValidator(exercise.type);
    if (!validator) {
      logger.error(`❌ No validator for exercise type: ${exercise.type}`);
      return {
        success: false,
        score: 0,
        feedback: { fa: "خطا در اعتبارسنجی", en: "Validation error", de: "Validierungsfehler" },
        errors: [],
        correctAnswers: [],
      };
    }

    try {
      return validator(exercise, userAnswers);
    } catch (error) {
      logger.error(`❌ Validation error for exercise ${exercise.id}:`, error);
      return {
        success: false,
        score: 0,
        feedback: { fa: "خطا در اعتبارسنجی", en: "Validation error", de: "Validierungsfehler" },
        errors: [{ message: error.message }],
        correctAnswers: [],
      };
    }
  }

  // ============================================
  // 🔧 Validator Registry
  // ============================================

  getValidator(type) {
    const validators = {
      [EXERCISE_TYPES.MATCH]: this.validateMatch,
      [EXERCISE_TYPES.MULTIPLE_CHOICE]: this.validateMultipleChoice,
      [EXERCISE_TYPES.FILL_IN_BLANK]: this.validateFillInBlank,
      [EXERCISE_TYPES.TRUE_FALSE]: this.validateTrueFalse,
      [EXERCISE_TYPES.FLASHCARD]: this.validateFlashcard,
      [EXERCISE_TYPES.DRAG_DROP]: this.validateDragDrop,
      [EXERCISE_TYPES.SENTENCE_BUILDER]: this.validateSentenceBuilder,
      [EXERCISE_TYPES.ERROR_CORRECTION]: this.validateErrorCorrection,
      [EXERCISE_TYPES.CONJUGATION]: this.validateConjugation,
      [EXERCISE_TYPES.WORD_ORDERING]: this.validateWordOrdering,
      [EXERCISE_TYPES.LISTEN_GAP_FILL]: this.validateListenGapFill,
      [EXERCISE_TYPES.GUIDED_SPEAKING]: this.validateGuidedSpeaking,
      [EXERCISE_TYPES.GUIDED_WRITING]: this.validateGuidedWriting,
      [EXERCISE_TYPES.TIMED_QUIZ]: this.validateTimedQuiz,
    };

    return validators[type] || null;
  }

  // ============================================
  // 📊 Individual Validators
  // ============================================

  validateMatch(exercise, userAnswers) {
    const { items } = exercise.data;
    let correct = 0;
    const total = items.length;
    const errors = [];
    const correctAnswers = [];

    items.forEach((item) => {
      const userAnswer = userAnswers[item.id];
      const isCorrect = userAnswer === item.pairId;

      if (isCorrect) {
        correct++;
      } else {
        errors.push({
          itemId: item.id,
          expected: item.pairId,
          received: userAnswer,
          message: `Expected "${item.right}" but got "${userAnswer}"`,
        });
      }

      correctAnswers.push({
        itemId: item.id,
        correct: item.pairId,
      });
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ عالی!" : `❌ ${correct} از ${total} درست`,
        en: passed ? "✅ Perfect!" : `❌ ${correct} of ${total} correct`,
        de: passed ? "✅ Perfekt!" : `❌ ${correct} von ${total} richtig`,
      },
      errors,
      correctAnswers,
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateMultipleChoice(exercise, userAnswers) {
    const { options, correctIndex } = exercise.data;
    const userAnswer = userAnswers.selectedIndex;
    const isCorrect = userAnswer === correctIndex;
    const selectedOption = options[userAnswer]?.text || "N/A";
    const correctOption = options[correctIndex]?.text || "N/A";

    return {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      passed: isCorrect,
      feedback: {
        fa: isCorrect ? "✅ پاسخ صحیح!" : `❌ پاسخ صحیح: ${correctOption}`,
        en: isCorrect ? "✅ Correct!" : `❌ Correct answer: ${correctOption}`,
        de: isCorrect ? "✅ Richtig!" : `❌ Richtige Antwort: ${correctOption}`,
      },
      errors: isCorrect
        ? []
        : [
            {
              message: `Expected "${correctOption}" but got "${selectedOption}"`,
            },
          ],
      correctAnswers: [
        {
          correct: correctIndex,
          text: correctOption,
        },
      ],
      stats: {
        correct: isCorrect ? 1 : 0,
        total: 1,
        percentage: isCorrect ? 100 : 0,
      },
    };
  }

  validateFillInBlank(exercise, userAnswers) {
    const { answer, caseSensitive, trimWhitespace } = exercise.data;
    const userAnswer = userAnswers.text || "";

    let normalizedUser = userAnswer;
    let normalizedCorrect = answer;

    if (trimWhitespace) {
      normalizedUser = normalizedUser.trim();
      normalizedCorrect = normalizedCorrect.trim();
    }

    if (!caseSensitive) {
      normalizedUser = normalizedUser.toLowerCase();
      normalizedCorrect = normalizedCorrect.toLowerCase();
    }

    const isCorrect = normalizedUser === normalizedCorrect;

    return {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      passed: isCorrect,
      feedback: {
        fa: isCorrect ? "✅ عالی!" : `❌ پاسخ صحیح: ${answer}`,
        en: isCorrect ? "✅ Perfect!" : `❌ Correct answer: ${answer}`,
        de: isCorrect ? "✅ Perfekt!" : `❌ Richtige Antwort: ${answer}`,
      },
      errors: isCorrect
        ? []
        : [
            {
              expected: answer,
              received: userAnswer,
              message: `Expected "${answer}" but got "${userAnswer}"`,
            },
          ],
      correctAnswers: [
        {
          correct: answer,
        },
      ],
      stats: {
        correct: isCorrect ? 1 : 0,
        total: 1,
        percentage: isCorrect ? 100 : 0,
      },
    };
  }

  validateTrueFalse(exercise, userAnswers) {
    const { answer, statement } = exercise.data;
    const userAnswer = userAnswers.value;
    const isCorrect = userAnswer === answer;

    return {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      passed: isCorrect,
      feedback: {
        fa: isCorrect ? "✅ درست!" : `❌ پاسخ صحیح: ${answer ? "درست" : "نادرست"}`,
        en: isCorrect ? "✅ Correct!" : `❌ Correct answer: ${answer ? "True" : "False"}`,
        de: isCorrect ? "✅ Richtig!" : `❌ Richtige Antwort: ${answer ? "Richtig" : "Falsch"}`,
      },
      errors: isCorrect
        ? []
        : [
            {
              expected: answer,
              received: userAnswer,
              message: `Statement: "${statement}"`,
            },
          ],
      correctAnswers: [
        {
          correct: answer,
        },
      ],
      stats: {
        correct: isCorrect ? 1 : 0,
        total: 1,
        percentage: isCorrect ? 100 : 0,
      },
    };
  }

  validateFlashcard(exercise, userAnswers) {
    // Flashcard validation is typically self-reported
    const { cards } = exercise.data;
    const results = [];

    cards.forEach((card) => {
      const userAnswer = userAnswers[card.id];
      const isCorrect = userAnswer === "known";
      results.push({
        cardId: card.id,
        isCorrect,
        known: userAnswer === "known",
      });
    });

    const correct = results.filter((r) => r.isCorrect).length;
    const total = cards.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ عالی!" : `❌ ${correct} از ${total} کارت را می‌دانید`,
        en: passed ? "✅ Great!" : `❌ You know ${correct} of ${total} cards`,
        de: passed ? "✅ Großartig!" : `❌ Sie kennen ${correct} von ${total} Karten`,
      },
      errors: [],
      correctAnswers: results.map((r) => ({
        cardId: r.cardId,
        correct: "known",
        received: r.known ? "known" : "unknown",
      })),
      stats: {
        correct,
        total,
        percentage: score,
        known: results.filter((r) => r.known).length,
        unknown: results.filter((r) => !r.known).length,
      },
    };
  }

  validateDragDrop(exercise, userAnswers) {
    const { items, targets } = exercise.data;
    let correct = 0;
    const total = items.length;
    const errors = [];

    items.forEach((item) => {
      const userTargetId = userAnswers[item.id];
      const isCorrect = userTargetId === item.targetId;

      if (isCorrect) {
        correct++;
      } else {
        const target = targets.find((t) => t.id === userTargetId);
        const correctTarget = targets.find((t) => t.id === item.targetId);
        errors.push({
          itemId: item.id,
          expected: correctTarget?.label || "unknown",
          received: target?.label || "unknown",
        });
      }
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ چیدمان درست!" : `❌ ${correct} از ${total} درست`,
        en: passed ? "✅ Correct arrangement!" : `❌ ${correct} of ${total} correct`,
        de: passed ? "✅ Richtige Anordnung!" : `❌ ${correct} von ${total} richtig`,
      },
      errors,
      correctAnswers: items.map((item) => ({
        itemId: item.id,
        correct: item.targetId,
      })),
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateSentenceBuilder(exercise, userAnswers) {
    const { correctOrder, words } = exercise.data;
    const userOrder = userAnswers.order || [];
    let correct = 0;

    userOrder.forEach((wordId, index) => {
      if (wordId === correctOrder[index]) {
        correct++;
      }
    });

    const total = correctOrder.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= 80;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ جمله درست!" : `❌ ${correct} از ${total} کلمه در جای درست`,
        en: passed ? "✅ Correct sentence!" : `❌ ${correct} of ${total} words in correct position`,
        de: passed
          ? "✅ Richtiger Satz!"
          : `❌ ${correct} von ${total} Wörtern an richtiger Position`,
      },
      errors: userOrder
        .map((wordId, index) => {
          if (wordId !== correctOrder[index]) {
            const word = words.find((w) => w.id === wordId);
            const correctWord = words.find((w) => w.id === correctOrder[index]);
            return {
              position: index,
              expected: correctWord?.text || "unknown",
              received: word?.text || "unknown",
            };
          }
          return null;
        })
        .filter(Boolean),
      correctAnswers: [
        {
          correct: correctOrder.map((id) => words.find((w) => w.id === id)?.text).join(" "),
        },
      ],
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateErrorCorrection(exercise, userAnswers) {
    const { errors, correctedSentence } = exercise.data;
    let correct = 0;
    const total = errors.length;
    const results = [];

    errors.forEach((error) => {
      const userAnswer = userAnswers[error.id];
      const isCorrect = userAnswer === error.corrected;

      if (isCorrect) {
        correct++;
      }

      results.push({
        errorId: error.id,
        isCorrect,
        original: error.original,
        expected: error.corrected,
        received: userAnswer,
        explanation: error.explanation,
      });
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 80;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ همه خطاها را پیدا کردید!" : `❌ ${correct} از ${total} خطا را پیدا کردید`,
        en: passed ? "✅ Found all errors!" : `❌ Found ${correct} of ${total} errors`,
        de: passed ? "✅ Alle Fehler gefunden!" : `❌ ${correct} von ${total} Fehlern gefunden`,
      },
      errors: results
        .filter((r) => !r.isCorrect)
        .map((r) => ({
          original: r.original,
          expected: r.expected,
          received: r.received,
          explanation: r.explanation,
        })),
      correctAnswers: results.map((r) => ({
        errorId: r.errorId,
        correct: r.expected,
      })),
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateConjugation(exercise, userAnswers) {
    const { pronouns, verb } = exercise.data;
    let correct = 0;
    const total = pronouns.length;

    pronouns.forEach((pronoun) => {
      const userAnswer = userAnswers[pronoun.id];
      const isCorrect = userAnswer === pronoun.correct;

      if (isCorrect) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 80;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ صرف درست!" : `❌ ${correct} از ${total} صرف درست`,
        en: passed ? "✅ Correct conjugation!" : `❌ ${correct} of ${total} conjugations correct`,
        de: passed
          ? "✅ Richtige Konjugation!"
          : `❌ ${correct} von ${total} Konjugationen richtig`,
      },
      errors: pronouns
        .filter((p, idx) => {
          const userAnswer = userAnswers[p.id];
          return userAnswer !== p.correct;
        })
        .map((p) => ({
          pronoun: p.pronoun,
          expected: p.correct,
          received: userAnswers[p.id],
        })),
      correctAnswers: pronouns.map((p) => ({
        pronounId: p.id,
        correct: p.correct,
      })),
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateWordOrdering(exercise, userAnswers) {
    return this.validateSentenceBuilder(exercise, userAnswers);
  }

  validateListenGapFill(exercise, userAnswers) {
    const { gaps, answers } = exercise.data;
    let correct = 0;
    const total = gaps.length;

    gaps.forEach((gap, index) => {
      const userAnswer = userAnswers[gap.id];
      const isCorrect = userAnswer?.toLowerCase().trim() === answers[index]?.toLowerCase().trim();

      if (isCorrect) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ گوش دادید و کامل کردید!" : `❌ ${correct} از ${total} جا را درست پر کردید`,
        en: passed
          ? "✅ Listened and completed!"
          : `❌ Filled ${correct} of ${total} gaps correctly`,
        de: passed
          ? "✅ Gehört und vervollständigt!"
          : `❌ ${correct} von ${total} Lücken richtig gefüllt`,
      },
      errors: gaps
        .filter((gap, index) => {
          const userAnswer = userAnswers[gap.id];
          return userAnswer?.toLowerCase().trim() !== answers[index]?.toLowerCase().trim();
        })
        .map((gap) => ({
          gapId: gap.id,
          expected: answers[gaps.indexOf(gap)],
          received: userAnswers[gap.id],
        })),
      correctAnswers: gaps.map((gap, index) => ({
        gapId: gap.id,
        correct: answers[index],
      })),
      stats: {
        correct,
        total,
        percentage: score,
      },
    };
  }

  validateGuidedSpeaking(exercise, userAnswers) {
    // Speaking is typically evaluated by AI or teacher
    // For now, we'll return a placeholder result
    const { prompts } = exercise.data;
    const total = prompts.length;
    const answered = Object.keys(userAnswers).filter((key) => userAnswers[key]?.trim()).length;

    const score = Math.round((answered / total) * 100);
    const passed = answered >= Math.ceil(total * 0.7);

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ گفتار خوب!" : `❌ ${answered} از ${total} سوال پاسخ داده شد`,
        en: passed ? "✅ Good speaking!" : `❌ Answered ${answered} of ${total} prompts`,
        de: passed
          ? "✅ Gutes Sprechen!"
          : `❌ ${answered} von ${total} Aufforderungen beantwortet`,
      },
      errors: [],
      correctAnswers: [],
      stats: {
        answered,
        total,
        percentage: score,
      },
    };
  }

  validateGuidedWriting(exercise, userAnswers) {
    // Writing is typically evaluated by AI or teacher
    // For now, we'll return a placeholder result
    const { prompts } = exercise.data;
    const total = prompts.length;
    const answered = Object.keys(userAnswers).filter(
      (key) => userAnswers[key]?.trim().length > 10
    ).length;

    const score = Math.min(Math.round((answered / total) * 100), 100);
    const passed = answered >= Math.ceil(total * 0.7);

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ نوشتن خوب!" : `❌ ${answered} از ${total} تمرین نوشتاری کامل شد`,
        en: passed ? "✅ Good writing!" : `❌ Completed ${answered} of ${total} writing tasks`,
        de: passed
          ? "✅ Gutes Schreiben!"
          : `❌ ${answered} von ${total} Schreibaufgaben abgeschlossen`,
      },
      errors: [],
      correctAnswers: [],
      stats: {
        answered,
        total,
        percentage: score,
        wordCount: Object.values(userAnswers).reduce(
          (sum, val) => sum + (val?.trim()?.split(/\s+/)?.length || 0),
          0
        ),
      },
    };
  }

  validateTimedQuiz(exercise, userAnswers) {
    const { questions } = exercise.data;
    let correct = 0;
    const total = questions.length;

    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      const isCorrect = userAnswer === q.correctIndex || userAnswer === q.answer;

      if (isCorrect) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;
    const timeTaken = userAnswers.timeTaken || 0;

    return {
      success: passed,
      score,
      passed,
      feedback: {
        fa: passed ? "✅ آزمون قبول شد!" : `❌ ${correct} از ${total} سوال درست`,
        en: passed ? "✅ Quiz passed!" : `❌ ${correct} of ${total} questions correct`,
        de: passed ? "✅ Quiz bestanden!" : `❌ ${correct} von ${total} Fragen richtig`,
      },
      errors: questions
        .filter((q, index) => {
          const userAnswer = userAnswers[q.id];
          return userAnswer !== q.correctIndex && userAnswer !== q.answer;
        })
        .map((q) => ({
          questionId: q.id,
          expected: q.correctIndex || q.answer,
          received: userAnswers[q.id],
        })),
      correctAnswers: questions.map((q) => ({
        questionId: q.id,
        correct: q.correctIndex || q.answer,
      })),
      stats: {
        correct,
        total,
        percentage: score,
        timeTaken,
        avgTimePerQuestion: total > 0 ? Math.round(timeTaken / total) : 0,
      },
    };
  }
}

export default new ExerciseValidator();

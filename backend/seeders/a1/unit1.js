/**
 * a1/unit1.js
 * German Academy
// TODO: Translate - TODO: Translate - * Seeder برای درس‌های A1 - Unit 1
 */

export const unit1 = {
  level: "A1",
  unit: 1,
  lessons: [
    {
      id: "a1-l01",
      lessonNumber: 1,
      title: {
        fa: "سلام و احوالپرسی",
        en: "Greetings",
        de: "Begrüßungen",
      },
      description: {
        fa: "در این درس با سلام و احوالپرسی به آلمانی آشنا می‌شوید.",
        en: "In this lesson you will learn greetings in German.",
        de: "In dieser Lektion lernen Sie Begrüßungen auf Deutsch.",
      },
      learningObjectives: {
        fa: [
          "✅ یادگیری ۵ روش مختلف سلام کردن",
          "✅ گفتن اسم خود با فعل heißen",
          "✅ بیان ملیت و زبان",
        ],
      },
      xpReward: 50,
      perfectBonusXP: 25,
      estimatedMinutes: 45,
      difficulty: 1,
      prerequisites: [],
      nextLessonId: "a1-l02",
      sections: [
        {
          type: "introduction",
          title: { fa: "🌟 مقدمه", en: "🌟 Introduction", de: "🌟 Einleitung" },
          content: {
            fa: "به اولین درس از سطح A1 خوش آمدید! 🎉\n\nدر این درس با سلام و احوالپرسی به زبان آلمانی آشنا می‌شوید.",
            en: "Welcome to your first A1 lesson! 🎉\n\nIn this lesson you will learn greetings in German.",
            de: "Willkommen zu Ihrer ersten A1-Lektion! 🎉\n\nIn dieser Lektion lernen Sie Begrüßungen auf Deutsch.",
          },
        },
        {
          type: "vocabulary",
          title: {
            fa: "📖 گنجینه لغات",
            en: "📖 Vocabulary",
            de: "📖 Wortschatz",
          },
          words: [
            {
              de: "Hallo",
              fa: "سلام",
              en: "Hello",
              transliteration: "هالو",
              synonyms: ["Hi", "Hey"],
              antonyms: ["Tschüss"],
              example: {
                de: "Hallo, wie geht es dir?",
                fa: "سلام، حالت چطوره؟",
                en: "Hello, how are you?",
              },
            },
            {
              de: "Guten Tag",
              fa: "روز بخیر",
              en: "Good day",
              transliteration: "گوتن تاک",
              synonyms: ["Tag"],
              antonyms: ["Gute Nacht"],
              example: {
                de: "Guten Tag! Ich heiße Thomas.",
                fa: "روز بخیر! اسم من توماس است.",
                en: "Good day! My name is Thomas.",
              },
            },
            {
              de: "heißen",
              fa: "نام داشتن، نامیده شدن",
              en: "to be called",
              transliteration: "هایسن",
              synonyms: ["genannt werden"],
              example: {
                de: "Ich heiße Ahmad.",
                fa: "اسم من احمد است.",
                en: "My name is Ahmad.",
              },
            },
          ],
        },
        {
          type: "grammar",
          title: {
            fa: "📝 کپسول گرامر",
            en: "📝 Grammar Capsule",
            de: "📝 Grammatik-Kapsel",
          },
          concept: {
            fa: "صرف فعل‌های اصلی (Konjugation)",
            en: "Conjugation of main verbs",
            de: "Konjugation der Hauptverben",
          },
          explanation: {
// TODO: Translate - TODO: Translate - fa: "در آلمانی، انتهای فعل با توجه به فاعل تغییر می‌کند.\n\n📌 **فعل heißen (نام داشتن):**\n• ich heiße → من نام دارم\n• du heißt → تو نام داری\n• er/sie/es heißt → او نام دارد\n• wir heißen → ما نام داریم\n• ihr heißt → شما نام دارید\n• sie/Sie heißen → آنها/شما نام دارند",
            en: "In German, the verb ending changes depending on the subject.\n\n📌 **Verb 'heißen' (to be called):**\n• ich heiße → I am called\n• du heißt → you are called\n• er/sie/es heißt → he/she/it is called\n• wir heißen → we are called\n• ihr heißt → you are called\n• sie/Sie heißen → they/you are called",
            de: "Im Deutschen ändert sich die Verbendung je nach Subjekt.\n\n📌 **Verb 'heißen':**\n• ich heiße\n• du heißt\n• er/sie/es heißt\n• wir heißen\n• ihr heißt\n• sie/Sie heißen",
          },
          examples: [
            {
              de: "Ich heiße Ahmad.",
              fa: "اسم من احمد است.",
              en: "My name is Ahmad.",
            },
            {
              de: "Wie heißt du?",
              fa: "اسم تو چیست؟",
              en: "What is your name?",
            },
            {
              de: "Ich komme aus dem Iran.",
              fa: "من اهل ایران هستم.",
              en: "I come from Iran.",
            },
          ],
        },
        {
          type: "exercises",
          title: {
            fa: "🏋️ کارگاه تمرین",
            en: "🏋️ Exercises",
            de: "🏋️ Übungen",
          },
          questions: [
            {
              id: "ex1",
              type: "sentence_building",
              question: {
                fa: "کلمات را مرتب کنید: 'heiße / ich / Thomas'",
                en: "Arrange: 'heiße / ich / Thomas'",
                de: "Ordnen: 'heiße / ich / Thomas'",
              },
              answer: "Ich heiße Thomas.",
              hint: {
                fa: "با فاعل شروع کن",
                en: "Start with the subject",
                de: "Beginnen Sie mit dem Subjekt",
              },
            },
            {
              id: "ex2",
              type: "fill_in",
              question: {
                fa: "جای خالی را پر کنید: 'Du ________ aus Deutschland.' (kommen)",
                en: "Fill in: 'Du ________ aus Deutschland.' (kommen)",
                de: "Füllen Sie: 'Du ________ aus Deutschland.' (kommen)",
              },
              answer: "kommst",
              hint: {
                fa: "فعل kommen را برای du صرف کن",
                en: "Conjugate kommen for du",
                de: "Konjugieren Sie kommen für du",
              },
            },
          ],
        },
        {
          type: "quiz",
          title: { fa: "📝 آزمون", en: "📝 Quiz", de: "📝 Quiz" },
          passingScore: 80,
          questions: [
            {
              id: "qz1",
              type: "multiple_choice",
              text: {
                fa: "کدام یک برای سلام کردن به صورت غیررسمی است؟",
                en: "Which one is used for informal greetings?",
                de: "Welches wird für informelle Begrüßungen verwendet?",
              },
              options: ["Guten Tag", "Hallo", "Auf Wiedersehen", "Gute Nacht"],
              correctIndex: 1,
              xpBonus: 10,
              explanation: {
                fa: "Hallo یک سلام غیررسمی است.",
                en: "Hallo is an informal greeting.",
                de: "Hallo ist eine informelle Begrüßung.",
              },
            },
            {
              id: "qz2",
              type: "fill_in",
              text: {
                fa: "جمله را کامل کن: 'Ich ______ aus dem Iran.' (kommen)",
                en: "Complete: 'Ich ______ aus dem Iran.' (kommen)",
                de: "Vervollständigen: 'Ich ______ aus dem Iran.' (kommen)",
              },
              answer: "komme",
              xpBonus: 10,
            },
          ],
        },
        {
          type: "summary",
          title: { fa: "📋 خلاصه", en: "📋 Summary", de: "📋 Zusammenfassung" },
          whatYouLearned: {
            fa: [
              "✅ سلام به آلمانی به صورت رسمی و غیررسمی",
              "✅ معرفی خود با فعل heißen",
              "✅ بیان ملیت با kommen aus",
            ],
            en: [
              "✅ Greetings in German (formal and informal)",
              "✅ Introducing yourself with the verb 'heißen'",
              "✅ Expressing nationality with 'kommen aus'",
            ],
            de: [
              "✅ Begrüßungen auf Deutsch (formell und informell)",
              "✅ Sich vorstellen mit dem Verb 'heißen'",
              "✅ Nationalität ausdrücken mit 'kommen aus'",
            ],
          },
        },
      ],
    },
    {
      id: "a1-l02",
      lessonNumber: 2,
      title: {
        fa: "اعداد ۱ تا ۱۰",
        en: "Numbers 1-10",
        de: "Zahlen 1-10",
      },
// TODO: Translate - TODO: Translate - // ... ادامه درس‌ها
    },
  ],
};

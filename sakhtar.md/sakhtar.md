مستر پرامپت ساختار درس‌های German Academy
markdown

# 🎯 MASTER PROMPT: German Academy Lesson Structure

## 📌 نقش شما

شما به عنوان Senior Content Architect و Full Stack Developer برای پروژه German Academy عمل می‌کنید. وظیفه شما تبدیل محتوای خام درس‌های زبان آلمانی به ساختار JSON استاندارد است که با بک‌اند (Node.js/PostgreSQL) و فرانت‌اند (React) سازگار باشد.

---

## 📂 مسیر ذخیره فایل

H:\german-academy\content\courses{LEVEL}\lessons{LESSON_ID}.json

text
مثال: `H:\german-academy\content\courses\A1\lessons\a1-l03.json`

---

## 🏗️ ساختار استاندارد درس (11 بخش اجباری)

هر درس باید دقیقاً دارای **11 بخش** زیر باشد:

| شماره | نام بخش       | نوع (type)            | توضیح                                                          |
| ----- | ------------- | --------------------- | -------------------------------------------------------------- |
| 1     | معرفی         | `introduction`        | مقدمه درس و تصویر ذهنی                                         |
| 2     | راهنمای تلفظ  | `pronunciation_guide` | آموزش تلفظ با سیستم دوزبانه                                    |
| 3     | احوال‌پرسی‌ها | `greetings`           | عبارات و کلمات مرتبط با احوال‌پرسی                             |
| 4     | واژگان        | `vocabulary`          | لیست واژگان جدید با مثال                                       |
| 5     | گرامر         | `grammar`             | موضوعات گرامری با جدول و مثال                                  |
| 6     | دیالوگ‌ها     | `dialogues`           | مکالمات واقعی با شخصیت‌ها                                      |
| 7     | نکات فرهنگی   | `culture_notes`       | اطلاعات فرهنگی مرتبط با درس                                    |
| 8     | تمرین‌ها      | `exercises`           | انواع تمرین (vocabulary, grammar, reading, listening, writing) |
| 9     | مرور          | `review`              | سوالات مروری برای تثبیت یادگیری                                |
| 10    | ارزیابی       | `assessment`          | آزمون پایان درس با خودارزیابی                                  |
| 11    | برگه خلاصه    | `cheat_sheet`         | خلاصه نکات کلیدی درس                                           |

---

## 📝 قالب کامل JSON

```json
{
  "id": "A1-LXX",
  "order": XX,
  "level": "A1",
  "unit": 1,
  "version": "2.0.0",
  "status": "published",
  "title": {
    "fa": "عنوان فارسی",
    "en": "English Title",
    "de": "Deutscher Titel"
  },
  "subtitle": {
    "fa": "زیرعنوان فارسی",
    "en": "English Subtitle",
    "de": "Deutscher Untertitel"
  },
  "description": {
    "fa": "توضیحات کامل فارسی",
    "en": "Full English description",
    "de": "Vollständige deutsche Beschreibung"
  },
  "estimatedMinutes": 90,
  "xpReward": 75,
  "perfectBonusXP": 30,
  "difficulty": 1,
  "cefr": "A1.1",

  "learningObjectives": {
    "fa": ["هدف ۱", "هدف ۲", "هدف ۳"],
    "en": ["Objective 1", "Objective 2", "Objective 3"],
    "de": ["Ziel 1", "Ziel 2", "Ziel 3"]
  },

  "requiredPreviousKnowledge": {
    "fa": "پیش‌نیازهای درس",
    "en": "Prerequisites",
    "de": "Voraussetzungen"
  },

  "lessonIntroduction": {
    "title": {
      "fa": "عنوان معرفی",
      "en": "Introduction Title",
      "de": "Einführungstitel"
    },
    "content": {
      "fa": "متن معرفی فارسی با توضیحات کامل",
      "en": "Full English introduction text",
      "de": "Vollständiger deutscher Einführungstext"
    },
    "imagePrompt": "توضیحات تصویر برای AI"
  },

  "pronunciationGuide": {
    "title": {
      "fa": "راهنمای تلفظ",
      "en": "Pronunciation Guide",
      "de": "Ausspracheführer"
    },
    "layers": {
      "fa": "توضیح لایه‌های تلفظ",
      "en": "Pronunciation layers explanation",
      "de": "Erklärung der Ausspracheschichten"
    },
    "sounds": [
      {
        "id": "sound-xxx",
        "letter": "حرف یا ترکیب",
        "description": {
          "fa": "توضیح تلفظ",
          "en": "Pronunciation description",
          "de": "Aussprachebeschreibung"
        },
        "ipa": "[ای‌پی‌ای]",
        "persianEquivalent": "≈ معادل فارسی",
        "commonMistake": {
          "fa": "اشتباه رایج فارسی‌زبانان",
          "en": "Common mistake for Persian speakers",
          "de": "Häufiger Fehler für Persischsprachige"
        },
        "examples": [
          { "word": "کلمه آلمانی", "persian": "تلفظ فارسی", "meaning": "معنی" }
        ]
      }
    ]
  },

  "greetings": {
    "items": [
      {
        "id": "greet-xxx",
        "german": "عبارت آلمانی",
        "persian": "تلفظ فارسی",
        "ipa": "[ای‌پی‌ای]",
        "meaning": "معنی",
        "time": "زمان استفاده",
        "formality": "رسمیت (دوستانه/رسمی/هردو)",
        "usage": {
          "fa": "توضیح کاربرد",
          "en": "Usage explanation",
          "de": "Verwendungserklärung"
        },
        "commonMistake": {
          "fa": "اشتباه رایج",
          "en": "Common mistake",
          "de": "Häufiger Fehler"
        }
      }
    ]
  },

  "vocabulary": [
    {
      "id": "voc-xxx",
      "de": "کلمه آلمانی",
      "article": "der/die/das",
      "plural": "جمع",
      "ipa": "[ای‌پی‌ای]",
      "fa": "معنی فارسی",
      "en": "English meaning",
      "example": {
        "de": "مثال آلمانی",
        "fa": "مثال فارسی",
        "en": "English example"
      },
      "usageNotes": {
        "fa": "نکات کاربردی",
        "en": "Usage notes",
        "de": "Verwendungshinweise"
      },
      "commonMistakes": {
        "fa": "اشتباهات رایج",
        "en": "Common mistakes",
        "de": "Häufige Fehler"
      },
      "difficulty": 1,
      "frequency": 5
    }
  ],

  "grammar": {
    "topics": [
      {
        "id": "gram-xxx",
        "title": {
          "fa": "عنوان موضوع گرامری",
          "en": "Grammar topic title",
          "de": "Grammatikthema"
        },
        "concept": {
          "fa": "توضیح مفهوم",
          "en": "Concept explanation",
          "de": "Konzerklärung"
        },
        "conjugationTable": {
          "headers": ["ستون ۱", "ستون ۲"],
          "rows": [
            ["ردیف ۱", "مقدار"],
            ["ردیف ۲", "مقدار"]
          ]
        },
        "examples": [
          {
            "sentence": "جمله آلمانی",
            "persian": "تلفظ فارسی",
            "meaning": "معنی"
          }
        ],
        "pattern": {
          "fa": "الگوی گرامری",
          "en": "Grammar pattern",
          "de": "Grammatikmuster"
        },
        "note": {
          "fa": "نکته مهم",
          "en": "Important note",
          "de": "Wichtiger Hinweis"
        }
      }
    ]
  },

  "dialogues": {
    "items": [
      {
        "id": "dialog-xxx",
        "title": {
          "fa": "عنوان دیالوگ",
          "en": "Dialogue title",
          "de": "Dialogtitel"
        },
        "characters": [
          { "name": "نام شخصیت", "role": "نقش" }
        ],
        "lines": [
          {
            "speaker": "نام گوینده",
            "german": "متن آلمانی",
            "persian": "تلفظ فارسی",
            "meaning": {
              "fa": "معنی فارسی",
              "en": "English meaning",
              "de": "Deutsche Bedeutung"
            }
          }
        ]
      }
    ]
  },

  "cultureNotes": {
    "fa": "متن نکات فرهنگی فارسی",
    "en": "Cultural notes in English",
    "de": "Kulturelle Hinweise auf Deutsch"
  },

  "exercises": {
    "vocabulary": [
      {
        "id": "ex-voc-xxx",
        "type": "match",
        "difficulty": 1,
        "title": {
          "fa": "عنوان تمرین",
          "en": "Exercise title",
          "de": "Übungstitel"
        },
        "items": [
          { "left": "کلمه", "right": "معنی" }
        ],
        "feedback": {
          "correct": "پیام صحیح",
          "incorrect": "پیام اشتباه"
        }
      }
    ],
    "grammar": [
      {
        "id": "ex-g-xxx",
        "type": "fill_in",
        "difficulty": 1,
        "title": {
          "fa": "عنوان تمرین گرامر",
          "en": "Grammar exercise title",
          "de": "Grammatikübungstitel"
        },
        "questions": [
          {
            "id": "g-qx",
            "prompt": "متن سوال",
            "options": ["گزینه ۱", "گزینه ۲"],
            "correct": "پاسخ صحیح",
            "feedback": "توضیح پاسخ"
          }
        ]
      }
    ],
    "reading": [
      {
        "id": "ex-r-xxx",
        "type": "true_false",
        "difficulty": 1,
        "title": {
          "fa": "عنوان تمرین خواندن",
          "en": "Reading exercise title",
          "de": "Leseübungstitel"
        },
        "passage": {
          "fa": "متن فارسی",
          "en": "English text",
          "de": "Deutscher Text"
        },
        "questions": [
          {
            "id": "r-qx",
            "statement": {
              "fa": "جمله فارسی",
              "en": "English sentence",
              "de": "Deutscher Satz"
            },
            "answer": true,
            "explanation": {
              "fa": "توضیح پاسخ",
              "en": "Answer explanation",
              "de": "Antwortserklärung"
            }
          }
        ]
      }
    ],
    "listening": [
      {
        "id": "ex-l-xxx",
        "type": "multiple_choice",
        "difficulty": 1,
        "title": {
          "fa": "عنوان تمرین شنیداری",
          "en": "Listening exercise title",
          "de": "Hörverständnisübungstitel"
        },
        "questions": [
          {
            "id": "l-qx",
            "question": {
              "fa": "سوال فارسی",
              "en": "English question",
              "de": "Deutsche Frage"
            },
            "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳"],
            "correctIndex": 0,
            "explanation": {
              "fa": "توضیح پاسخ",
              "en": "Answer explanation",
              "de": "Antwortserklärung"
            }
          }
        ]
      }
    ],
    "writing": [
      {
        "id": "ex-w-xxx",
        "type": "guided_writing",
        "difficulty": 1,
        "title": {
          "fa": "عنوان تمرین نوشتاری",
          "en": "Writing exercise title",
          "de": "Schreibübungstitel"
        },
        "prompts": {
          "fa": "راهنمای نوشتن فارسی",
          "en": "Writing prompt in English",
          "de": "Schreibaufforderung auf Deutsch"
        }
      }
    ]
  },

  "review": {
    "title": {
      "fa": "مرور درس",
      "en": "Lesson Review",
      "de": "Lektionsüberprüfung"
    },
    "quiz": [
      {
        "id": "rev-qx",
        "type": "multiple_choice",
        "question": {
          "fa": "سوال فارسی",
          "en": "English question",
          "de": "Deutsche Frage"
        },
        "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
        "correctIndex": 0,
        "explanation": {
          "fa": "توضیح پاسخ",
          "en": "Answer explanation",
          "de": "Antwortserklärung"
        }
      },
      {
        "id": "rev-qx",
        "type": "true_false",
        "question": {
          "fa": "جمله فارسی",
          "en": "English sentence",
          "de": "Deutscher Satz"
        },
        "answer": true,
        "explanation": {
          "fa": "توضیح پاسخ",
          "en": "Answer explanation",
          "de": "Antwortserklärung"
        }
      }
    ]
  },

  "assessment": {
    "title": {
      "fa": "آزمون پایان درس",
      "en": "Final Assessment",
      "de": "Abschlussbewertung"
    },
    "totalQuestions": 15,
    "passingScore": 70,
    "sections": {
      "section_name": { "count": 3, "questions": [] }
    },
    "selfEvaluation": {
      "fa": ["سوال خودارزیابی ۱", "سوال خودارزیابی ۲"],
      "en": ["Self-evaluation 1", "Self-evaluation 2"],
      "de": ["Selbstbewertung 1", "Selbstbewertung 2"]
    }
  },

  "cheatSheet": {
    "greetings": [
      { "de": "عبارت آلمانی", "fa": "معنی فارسی" }
    ],
    "pronouns": [
      { "de": "ضمیر آلمانی", "fa": "معنی فارسی" }
    ],
    "key_phrases": [
      { "de": "عبارت کلیدی", "fa": "معنی فارسی" }
    ],
    "grammar": [
      { "title": "موضوع گرامری", "summary": "خلاصه" }
    ],
    "du_vs_sie": [
      { "situation": "موقعیت", "use": "du/Sie" }
    ]
  },

  "metadata": {
    "createdAt": "2026-07-05",
    "updatedAt": "2026-07-05",
    "version": "2.0.0",
    "author": "German Academy Team",
    "status": "published",
    "tags": ["tag1", "tag2"],
    "difficulty": 1,
    "prerequisites": ["A1-LXX"]
  }
}
⚙️ قوانین طلایی
۱. فیلدهای چندزبانه
همه فیلدهای متنی باید به صورت آبجکت با سه کلید fa، en، de باشند:

json
"title": {
  "fa": "متن فارسی",
  "en": "English text",
  "de": "Deutscher Text"
}
۲. شناسه‌ها (IDs)
درس: A1-LXX (با حروف بزرگ) یا a1-lxx (با حروف کوچک)

واژگان: voc-xxx

گرامر: gram-xxx

دیالوگ: dialog-xxx

تمرین‌ها: ex-{type}-{number}

۳. تعداد آیتم‌ها
واژگان: حداقل ۱۰ کلمه

گرامر: حداقل ۲-۳ موضوع

دیالوگ‌ها: حداقل ۲-۳ دیالوگ

تمرین‌ها: حداقل ۳ نوع تمرین

سوالات مرور: حداقل ۵ سوال

۴. تلفظ فارسی
همه کلمات آلمانی باید تلفظ فارسی داشته باشند با استفاده از حروف فارسی.

۵. ساختار فایل
فایل باید JSON معتبر باشد و با UTF-8 ذخیره شود.

🚀 دستورات اجرا پس از ساخت فایل
powershell
cd H:\german-academy\backend
node scripts/runLessonSeeder.js
✅ چک‌لیست نهایی
قبل از ارسال فایل، این موارد را بررسی کنید:

۱۱ بخش کامل وجود دارد

همه فیلدهای متنی سه‌زبانه هستند

تلفظ فارسی برای همه کلمات وجود دارد

JSON معتبر است

شناسه‌ها یکتا هستند

تعداد آیتم‌ها مناسب است

فایل با UTF-8 ذخیره شده است

text

---

## 📝 نحوه استفاده از این پرامپت

وقتی می‌خواهید درس جدیدی ایجاد کنید، این متن را به همراه محتوای خام درس برای من ارسال کنید:
با توجه به مستر پرامپت ساختار درس‌های German Academy، لطفاً محتوای زیر را به فرمت JSON استاندارد تبدیل کن:

[محتوای خام درس شما اینجا قرار می‌گیرد]

text

من بر اساس این مستر پرامپت، محتوای شما را به ساختار استاندارد ۱۱ بخشی تبدیل می‌کنم.
```

/**
 * StoryEngine.js
 * Path: backend/services/storyEngine/StoryEngine.js
 * Description: Interactive story engine with chapters, branching, and vocabulary highlighting
 * Version: 2.0 - Complete implementation
 */

import { v4 as uuidv4 } from "uuid";
import logger from "../../config/logger.js";
import { Story, StoryProgress, User } from "../../models/index.js";
import { Op } from "sequelize";

// ============================================
// 📊 Story Engine Class
// ============================================

class StoryEngine {
  constructor() {
    this.storyCache = new Map();
    this.activeSessions = new Map();
  }

  // ============================================
  // 📚 Story Management
  // ============================================

  /**
   * Get story with full content
   */
  async getStory(storyId, userId = null) {
    // Check cache first
    if (this.storyCache.has(storyId)) {
      const cached = this.storyCache.get(storyId);
      if (Date.now() - cached.timestamp < 60000) {
        // 1 minute cache
        return this.enrichStory(cached.data, userId);
      }
    }

    let story = await Story.findByPk(storyId);

    // If not found, try mock data
    if (!story) {
      const mockStory = this.getMockStory(storyId);
      if (mockStory) {
        return this.enrichStory(mockStory, userId);
      }
      return null;
    }

    // Cache the story
    this.storyCache.set(storyId, {
      data: story.toJSON(),
      timestamp: Date.now(),
    });

    return this.enrichStory(story.toJSON(), userId);
  }

  /**
   * Get all stories with progress
   */
  async getStories(userId = null, filters = {}) {
    const { level, limit = 20, offset = 0 } = filters;

    const where = { isActive: true };
    if (level) where.level = level;

    const { count, rows } = await Story.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["level", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    // If no stories, return mock data
    if (rows.length === 0) {
      const mockStories = this.getMockStories(level);
      return {
        stories: mockStories.map((s) => this.enrichStory(s, userId)),
        total: mockStories.length,
        isMock: true,
      };
    }

    // Get progress for each story
    let progressMap = {};
    if (userId) {
      const storyIds = rows.map((s) => s.id);
      const progress = await StoryProgress.findAll({
        where: {
          userId,
          storyId: { [Op.in]: storyIds },
        },
      });
      progress.forEach((p) => {
        progressMap[p.storyId] = p;
      });
    }

    const stories = rows.map((story) => ({
      ...story.toJSON(),
      progress: progressMap[story.id] || null,
    }));

    return {
      stories,
      total: count,
      pagination: { limit, offset, total: count },
    };
  }

  // ============================================
  // 📖 Story Progress
  // ============================================

  /**
   * Start a story
   */
  async startStory(userId, storyId) {
    const story = await this.getStory(storyId, userId);
    if (!story) {
      throw new Error("Story not found");
    }

    let progress = await StoryProgress.findOne({
      where: { userId, storyId },
    });

    if (!progress) {
      progress = await StoryProgress.create({
        userId,
        storyId,
        status: "in_progress",
        progress: 0,
        currentChapter: 0,
        currentPage: 0,
        metadata: {
          startedAt: new Date(),
          totalChapters: story.chapters?.length || 0,
          totalPages: story.pages?.length || 0,
        },
      });
    }

    return {
      story,
      progress,
      currentContent: this.getCurrentContent(story, progress),
    };
  }

  /**
   * Continue story
   */
  async continueStory(userId, storyId, action = null) {
    const progress = await StoryProgress.findOne({
      where: { userId, storyId },
    });

    if (!progress) {
      throw new Error("Story not started");
    }

    const story = await this.getStory(storyId, userId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Process action if provided
    if (action) {
      const result = this.processAction(story, progress, action);
      if (result.branch) {
        // Follow branch
        progress.currentChapter = result.nextChapter;
        progress.currentPage = result.nextPage;
        progress.metadata.branchHistory = progress.metadata.branchHistory || [];
        progress.metadata.branchHistory.push({
          chapter: result.previousChapter,
          page: result.previousPage,
          choice: action,
          timestamp: new Date(),
        });
      }
    } else {
      // Move to next page/chapter
      const next = this.getNextContent(story, progress);
      if (next) {
        progress.currentChapter = next.chapter;
        progress.currentPage = next.page;
      }
    }

    // Update progress
    const totalContent = story.chapters?.reduce((sum, ch) => sum + (ch.pages?.length || 0), 0) || 1;
    const currentContent = progress.currentChapter * 10 + progress.currentPage;
    progress.progress = Math.min(Math.round((currentContent / totalContent) * 100), 100);

    // Check if story is complete
    if (progress.progress >= 100) {
      progress.status = "completed";
      progress.completedAt = new Date();

      // Award XP
      const xpReward = story.xpReward || 50;
      await this.awardXP(userId, xpReward, "story_completion");
    }

    await progress.save();

    return {
      story,
      progress,
      currentContent: this.getCurrentContent(story, progress),
      isComplete: progress.status === "completed",
    };
  }

  /**
   * Get story progress
   */
  async getProgress(userId, storyId) {
    const progress = await StoryProgress.findOne({
      where: { userId, storyId },
    });

    if (!progress) {
      return {
        status: "not_started",
        progress: 0,
      };
    }

    return progress;
  }

  // ============================================
  // 🎯 Story Content Helpers
  // ============================================

  getCurrentContent(story, progress) {
    const { currentChapter = 0, currentPage = 0 } = progress;
    const chapters = story.chapters || [];

    if (currentChapter >= chapters.length) {
      return this.getCompletionContent(story);
    }

    const chapter = chapters[currentChapter];
    const pages = chapter.pages || [];

    if (currentPage >= pages.length) {
      // Move to next chapter
      return this.getNextChapterContent(story, currentChapter + 1);
    }

    return {
      type: "page",
      chapter: {
        index: currentChapter,
        title: chapter.title,
      },
      page: {
        index: currentPage,
        content: pages[currentPage],
        totalPages: pages.length,
      },
      vocabulary: this.getVocabularyForPage(story, currentChapter, currentPage),
      choices: this.getChoices(story, currentChapter, currentPage),
      isLastPage: currentPage >= pages.length - 1,
      isLastChapter: currentChapter >= chapters.length - 1,
    };
  }

  getNextContent(story, progress) {
    const { currentChapter = 0, currentPage = 0 } = progress;
    const chapters = story.chapters || [];

    if (currentChapter >= chapters.length) {
      return null;
    }

    const chapter = chapters[currentChapter];
    const pages = chapter.pages || [];

    if (currentPage + 1 < pages.length) {
      return { chapter: currentChapter, page: currentPage + 1 };
    } else if (currentChapter + 1 < chapters.length) {
      return { chapter: currentChapter + 1, page: 0 };
    }

    return null;
  }

  getNextChapterContent(story, chapterIndex) {
    const chapters = story.chapters || [];
    if (chapterIndex >= chapters.length) {
      return this.getCompletionContent(story);
    }

    const chapter = chapters[chapterIndex];
    return {
      type: "chapter_start",
      chapter: {
        index: chapterIndex,
        title: chapter.title,
        introduction: chapter.introduction,
      },
      totalChapters: chapters.length,
    };
  }

  getCompletionContent(story) {
    return {
      type: "completion",
      title: story.completionTitle || {
        fa: "داستان به پایان رسید!",
        en: "Story Completed!",
        de: "Geschichte abgeschlossen!",
      },
      message: story.completionMessage || {
        fa: "تبریک! شما این داستان را کامل کردید. 🎉",
        en: "Congratulations! You completed this story. 🎉",
        de: "Herzlichen Glückwunsch! Sie haben diese Geschichte abgeschlossen. 🎉",
      },
      xpReward: story.xpReward || 50,
      nextStory: story.nextStoryId,
    };
  }

  // ============================================
  // 📚 Vocabulary Helpers
  // ============================================

  getVocabularyForPage(story, chapterIndex, pageIndex) {
    const chapters = story.chapters || [];
    if (chapterIndex >= chapters.length) return [];

    const chapter = chapters[chapterIndex];
    const pages = chapter.pages || [];
    if (pageIndex >= pages.length) return [];

    const page = pages[pageIndex];
    return page.vocabulary || [];
  }

  getChoices(story, chapterIndex, pageIndex) {
    const chapters = story.chapters || [];
    if (chapterIndex >= chapters.length) return [];

    const chapter = chapters[chapterIndex];
    const pages = chapter.pages || [];
    if (pageIndex >= pages.length) return [];

    const page = pages[pageIndex];
    return page.choices || [];
  }

  // ============================================
  // 🎮 Action Processing
  // ============================================

  processAction(story, progress, action) {
    const { currentChapter, currentPage } = progress;
    const chapters = story.chapters || [];

    if (currentChapter >= chapters.length) {
      return { branch: false };
    }

    const chapter = chapters[currentChapter];
    const pages = chapter.pages || [];
    if (currentPage >= pages.length) {
      return { branch: false };
    }

    const page = pages[currentPage];
    const choices = page.choices || [];

    const selectedChoice = choices.find((c) => c.id === action || c.text === action);
    if (!selectedChoice) {
      return { branch: false };
    }

    return {
      branch: true,
      previousChapter: currentChapter,
      previousPage: currentPage,
      nextChapter:
        selectedChoice.nextChapter !== undefined ? selectedChoice.nextChapter : currentChapter,
      nextPage: selectedChoice.nextPage !== undefined ? selectedChoice.nextPage : currentPage + 1,
      choice: selectedChoice,
    };
  }

  // ============================================
  // ⭐ XP System
  // ============================================

  async awardXP(userId, amount, source) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      await user.increment("xp", { by: amount });

      // Update level
      const xpPerLevel = 100;
      const newLevel = Math.floor((user.xp + amount) / xpPerLevel) + 1;
      if (newLevel > user.level) {
        await user.update({ level: newLevel });
      }

      logger.info(`⭐ Awarded ${amount} XP to user ${userId} for ${source}`);
    } catch (error) {
      logger.error(`❌ Error awarding XP: ${error.message}`);
    }
  }

  // ============================================
  // 🎭 Enrich Story
  // ============================================

  enrichStory(story, userId) {
    return {
      ...story,
      vocabularyHighlighted: this.highlightVocabulary(story),
      totalChapters: story.chapters?.length || 0,
      totalPages: story.chapters?.reduce((sum, ch) => sum + (ch.pages?.length || 0), 0) || 0,
      estimatedTime: story.estimatedMinutes || 10,
      hasProgress: !!userId,
    };
  }

  highlightVocabulary(story) {
    const allVocabulary = [];
    const chapters = story.chapters || [];

    chapters.forEach((chapter) => {
      const pages = chapter.pages || [];
      pages.forEach((page) => {
        if (page.vocabulary) {
          allVocabulary.push(...page.vocabulary);
        }
      });
    });

    return allVocabulary;
  }

  // ============================================
  // 📋 Mock Data
  // ============================================

  getMockStory(storyId) {
    const stories = this.getMockStories();
    return stories.find((s) => s.id === storyId) || null;
  }

  getMockStories(level = null) {
    const allStories = [
      {
        id: "story-1",
        level: "A1",
        title: { fa: "سفر به برلین", en: "Trip to Berlin", de: "Reise nach Berlin" },
        description: {
          fa: "یک داستان جذاب درباره سفر به پایتخت آلمان",
          en: "An exciting story about traveling to Germany's capital",
          de: "Eine spannende Geschichte über die Reise in die deutsche Hauptstadt",
        },
        icon: "✈️",
        xpReward: 50,
        estimatedMinutes: 15,
        chapters: [
          {
            id: "ch1",
            title: {
              fa: "آماده‌سازی برای سفر",
              en: "Preparing for the Trip",
              de: "Vorbereitung auf die Reise",
            },
            introduction: {
              fa: "آنا برای اولین بار به آلمان سفر می‌کند. او بسیار هیجان‌زده است.",
              en: "Anna is traveling to Germany for the first time. She is very excited.",
              de: "Anna reist zum ersten Mal nach Deutschland. Sie ist sehr aufgeregt.",
            },
            pages: [
              {
                id: "p1",
                content: {
                  text: {
                    fa: "آنا چمدان خود را بسته است. او همه چیز را برای سفر آماده کرده است. بلیط هواپیما را در دست دارد و به فرودگاه می‌رود.",
                    en: "Anna has packed her suitcase. She has everything ready for the trip. She has the plane ticket in hand and is going to the airport.",
                    de: "Anna hat ihren Koffer gepackt. Sie hat alles für die Reise vorbereitet. Sie hat das Flugticket in der Hand und geht zum Flughafen.",
                  },
                  vocabulary: [
                    { word: "der Koffer", meaning: { fa: "چمدان", en: "suitcase", de: "Koffer" } },
                    {
                      word: "das Flugticket",
                      meaning: { fa: "بلیط هواپیما", en: "plane ticket", de: "Flugticket" },
                    },
                    {
                      word: "der Flughafen",
                      meaning: { fa: "فرودگاه", en: "airport", de: "Flughafen" },
                    },
                  ],
                  choices: [
                    { id: "go_to_airport", text: "به فرودگاه برو", nextPage: 1 },
                    { id: "check_ticket", text: "بلیط را بررسی کن", nextPage: 0 },
                  ],
                },
              },
              {
                id: "p2",
                content: {
                  text: {
                    fa: "آنا به فرودگاه رسیده است. او باید بلیط خود را نشان دهد و سوار هواپیما شود.",
                    en: "Anna has arrived at the airport. She needs to show her ticket and board the plane.",
                    de: "Anna ist am Flughafen angekommen. Sie muss ihr Ticket vorzeigen und ins Flugzeug einsteigen.",
                  },
                  vocabulary: [
                    {
                      word: "das Flugzeug",
                      meaning: { fa: "هواپیما", en: "plane", de: "Flugzeug" },
                    },
                    {
                      word: "einsteigen",
                      meaning: { fa: "سوار شدن", en: "board", de: "einsteigen" },
                    },
                  ],
                  choices: [{ id: "show_ticket", text: "بلیط را نشان بده", nextPage: 2 }],
                },
              },
              {
                id: "p3",
                content: {
                  text: {
                    fa: "آنا سوار هواپیما شده است. او کنار پنجره نشسته و به بیرون نگاه می‌کند. پرواز به زودی شروع می‌شود.",
                    en: "Anna has boarded the plane. She is sitting by the window and looking outside. The flight will start soon.",
                    de: "Anna ist ins Flugzeug eingestiegen. Sie sitzt am Fenster und schaut nach draußen. Der Flug beginnt bald.",
                  },
                  vocabulary: [
                    { word: "das Fenster", meaning: { fa: "پنجره", en: "window", de: "Fenster" } },
                    { word: "der Flug", meaning: { fa: "پرواز", en: "flight", de: "Flug" } },
                  ],
                  choices: [],
                },
              },
            ],
          },
        ],
        completionTitle: {
          fa: "سفر به برلین به پایان رسید!",
          en: "Trip to Berlin Completed!",
          de: "Reise nach Berlin abgeschlossen!",
        },
        completionMessage: {
          fa: "آنا با موفقیت به برلین رسید! او آماده شروع ماجراجویی‌های جدید است.",
          en: "Anna successfully arrived in Berlin! She is ready for new adventures.",
          de: "Anna ist erfolgreich in Berlin angekommen! Sie ist bereit für neue Abenteuer.",
        },
        nextStoryId: "story-2",
      },
    ];

    if (level) {
      return allStories.filter((s) => s.level === level);
    }

    return allStories;
  }
}

export default new StoryEngine();

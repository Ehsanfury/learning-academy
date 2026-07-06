/**
 * ScenarioEngine.js
 * Path: backend/services/scenarioEngine/ScenarioEngine.js
 * Description: Interactive scenario engine with dialogue, NPC memory, and role-play AI
 * Version: 2.0 - Complete implementation
 */

import { v4 as uuidv4 } from "uuid";
import logger from "../../config/logger.js";
import aiService from "../aiService.js";
import { User } from "../../models/index.js";

// ============================================
// 📊 Scenario Engine Class
// ============================================

class ScenarioEngine {
  constructor() {
    this.activeScenarios = new Map();
    this.npcMemory = new Map();
    this.dialogueHistory = new Map();
    this.scenarioCache = new Map();
  }

  // ============================================
  // 🎭 Scenario Management
  // ============================================

  /**
   * Start a new scenario
   */
  async startScenario(userId, scenarioType, options = {}) {
    const { level = "A1", difficulty = 1, context = {} } = options;

    // Get or create scenario template
    const scenario = this.getScenarioTemplate(scenarioType, level);
    if (!scenario) {
      throw new Error(`Scenario type "${scenarioType}" not found`);
    }

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      userId,
      scenarioType,
      level,
      difficulty,
      context: {
        ...context,
        startedAt: new Date(),
        currentStage: 0,
        totalStages: scenario.stages.length,
        completed: false,
        score: 0,
        mistakes: 0,
        correctAnswers: 0,
      },
      npcState: this.initializeNPCState(scenario),
      dialogueHistory: [],
      userProgress: {},
    };

    // Store active session
    this.activeScenarios.set(sessionId, session);

    // Initialize NPC memory
    this.npcMemory.set(sessionId, {
      user: {
        name: context.userName || "Student",
        level: level,
        preferences: context.preferences || {},
        mistakes: [],
        strengths: [],
        interactions: 0,
      },
      npc: scenario.npc,
      history: [],
    });

    // Generate opening dialogue
    const openingDialogue = await this.generateOpeningDialogue(scenario, session);

    return {
      sessionId,
      scenario: {
        id: scenario.id,
        title: scenario.title,
        type: scenario.type,
        level: scenario.level,
        npc: scenario.npc,
        setting: scenario.setting,
        goal: scenario.goal,
      },
      openingDialogue,
      options: scenario.initialOptions || [],
    };
  }

  /**
   * Continue scenario
   */
  async continueScenario(sessionId, userInput) {
    const session = this.activeScenarios.get(sessionId);
    if (!session) {
      throw new Error("Scenario session not found");
    }

    const scenario = this.getScenarioTemplate(session.scenarioType, session.level);
    if (!scenario) {
      throw new Error("Scenario template not found");
    }

    // Process user input
    const result = await this.processUserInput(session, scenario, userInput);

    // Update session
    session.dialogueHistory.push({
      role: "user",
      content: userInput,
      timestamp: new Date(),
    });

    session.dialogueHistory.push({
      role: "npc",
      content: result.response,
      timestamp: new Date(),
    });

    // Update NPC memory
    const memory = this.npcMemory.get(sessionId);
    if (memory) {
      memory.history.push({
        user: userInput,
        npc: result.response,
        timestamp: new Date(),
        intent: result.intent || "unknown",
        sentiment: result.sentiment || "neutral",
      });
      memory.user.interactions++;
      memory.user.mistakes.push(...(result.mistakes || []));
      memory.user.strengths.push(...(result.strengths || []));
    }

    // Update progress
    if (result.progress) {
      session.context.currentStage = result.progress.stage || session.context.currentStage;
      session.context.score += result.progress.score || 0;
      session.context.correctAnswers += result.progress.correct || 0;
      session.context.mistakes += result.progress.mistakes || 0;
    }

    // Check completion
    if (session.context.currentStage >= session.context.totalStages) {
      session.context.completed = true;
      session.context.completedAt = new Date();
    }

    // Save session
    this.activeScenarios.set(sessionId, session);

    return {
      response: result.response,
      options: result.options || [],
      feedback: result.feedback || null,
      progress: {
        currentStage: session.context.currentStage,
        totalStages: session.context.totalStages,
        score: session.context.score,
        completed: session.context.completed,
        percentage: Math.round((session.context.currentStage / session.context.totalStages) * 100),
      },
      npc: {
        name: scenario.npc.name,
        mood: result.mood || "neutral",
        emotion: result.emotion || "neutral",
      },
      vocabulary: result.vocabulary || [],
      grammar: result.grammar || null,
    };
  }

  /**
   * Get scenario status
   */
  async getScenarioStatus(sessionId) {
    const session = this.activeScenarios.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId,
      scenarioType: session.scenarioType,
      level: session.level,
      progress: {
        currentStage: session.context.currentStage,
        totalStages: session.context.totalStages,
        percentage: Math.round((session.context.currentStage / session.context.totalStages) * 100),
        completed: session.context.completed,
      },
      score: session.context.score,
      mistakes: session.context.mistakes,
      correctAnswers: session.context.correctAnswers,
      startedAt: session.context.startedAt,
      lastActivity: session.dialogueHistory[session.dialogueHistory.length - 1]?.timestamp,
    };
  }

  /**
   * End scenario
   */
  async endScenario(sessionId) {
    const session = this.activeScenarios.get(sessionId);
    if (!session) {
      return null;
    }

    const result = {
      sessionId,
      scenarioType: session.scenarioType,
      level: session.level,
      completed: session.context.completed,
      score: session.context.score,
      mistakes: session.context.mistakes,
      correctAnswers: session.context.correctAnswers,
      totalInteractions: session.dialogueHistory.length,
      duration: new Date() - session.context.startedAt,
      summary: await this.generateScenarioSummary(session),
      recommendations: await this.generateRecommendations(session),
    };

    // Award XP if completed
    if (session.context.completed) {
      const xpReward = this.calculateXPReward(session);
      await this.awardXP(session.userId, xpReward, "scenario_completion");
      result.xpEarned = xpReward;
    }

    // Cleanup
    this.activeScenarios.delete(sessionId);
    this.npcMemory.delete(sessionId);

    return result;
  }

  // ============================================
  // 🎯 User Input Processing
  // ============================================

  async processUserInput(session, scenario, userInput) {
    // Use AI to process the input
    const aiResponse = await this.callAI(session, scenario, userInput);

    // Parse AI response
    const parsed = this.parseAIResponse(aiResponse);

    // Get next options
    const options = this.getNextOptions(session, scenario, parsed);

    // Generate vocabulary from the response
    const vocabulary = this.extractVocabulary(aiResponse);

    return {
      response: parsed.response,
      options: options,
      feedback: parsed.feedback || null,
      mood: parsed.mood || "neutral",
      emotion: parsed.emotion || "neutral",
      intent: parsed.intent || "unknown",
      sentiment: parsed.sentiment || "neutral",
      progress: parsed.progress || null,
      vocabulary: vocabulary,
      grammar: parsed.grammar || null,
      mistakes: parsed.mistakes || [],
      strengths: parsed.strengths || [],
    };
  }

  // ============================================
  // 🤖 AI Integration
  // ============================================

  async callAI(session, scenario, userInput) {
    const memory = this.npcMemory.get(session.id);
    const context = this.buildAIContext(session, scenario, memory);

    const prompt = `
      You are ${scenario.npc.name}, a ${scenario.npc.role} in a ${scenario.type} scenario.
      Setting: ${scenario.setting}
      Goal: ${scenario.goal}
      
      Current context: ${context}
      
      User said: "${userInput}"
      
      Respond in a natural, engaging way. Keep the conversation flowing.
      Provide feedback on the user's German language usage.
      If there are grammar errors, gently correct them.
      
      Respond in this JSON format:
      {
        "response": "Your natural response in German",
        "translation": "Translation in the user's language (Persian)",
        "feedback": {
          "positive": "What the user did well",
          "improvement": "What they can improve",
          "grammar": "Grammar tips if needed"
        },
        "mood": "happy|neutral|sad|angry|surprised",
        "intent": "greeting|question|answer|request|complaint|other",
        "vocabulary": ["word1", "word2"],
        "grammar": { "concept": "explanation" },
        "progress": {
          "stage": 1,
          "score": 10,
          "correct": 1,
          "mistakes": 0
        }
      }
    `;

    try {
      const response = await aiService.chat(prompt, {
        userId: session.userId,
        temperature: 0.7,
        maxTokens: 800,
      });

      return response.text;
    } catch (error) {
      logger.error(`❌ AI call failed: ${error.message}`);
      return this.getFallbackResponse(scenario, userInput);
    }
  }

  // ============================================
  // 🛠️ Helper Methods
  // ============================================

  buildAIContext(session, scenario, memory) {
    const history = memory?.history || [];
    const recentHistory = history
      .slice(-5)
      .map((h) => `User: ${h.user}\nNPC: ${h.npc}`)
      .join("\n");

    return `
      Scenario: ${scenario.title}
      Level: ${session.level}
      Current Stage: ${session.context.currentStage}/${session.context.totalStages}
      User Progress: ${session.context.score} points, ${session.context.mistakes} mistakes
      
      Recent Conversation:
      ${recentHistory}
      
      NPC Memory:
      - User name: ${memory?.user?.name || "Student"}
      - Interactions: ${memory?.user?.interactions || 0}
      - Known mistakes: ${(memory?.user?.mistakes || []).join(", ")}
      - Strengths: ${(memory?.user?.strengths || []).join(", ")}
    `;
  }

  parseAIResponse(aiResponse) {
    try {
      // Try to parse JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || aiResponse,
          translation: parsed.translation || "",
          feedback: parsed.feedback || null,
          mood: parsed.mood || "neutral",
          emotion: parsed.emotion || "neutral",
          intent: parsed.intent || "unknown",
          sentiment: parsed.sentiment || "neutral",
          progress: parsed.progress || null,
          vocabulary: parsed.vocabulary || [],
          grammar: parsed.grammar || null,
          mistakes: [],
          strengths: [],
        };
      }
    } catch (e) {
      logger.warn("⚠️ Failed to parse AI response as JSON");
    }

    return {
      response: aiResponse,
      translation: "",
      feedback: null,
      mood: "neutral",
      emotion: "neutral",
      intent: "unknown",
      sentiment: "neutral",
      progress: null,
      vocabulary: [],
      grammar: null,
      mistakes: [],
      strengths: [],
    };
  }

  getNextOptions(session, scenario, parsed) {
    const stage = session.context.currentStage;
    const stageConfig = scenario.stages?.[stage];

    if (!stageConfig) {
      return [];
    }

    return stageConfig.options || [];
  }

  extractVocabulary(text) {
    // Extract German words from the response
    const words = text.match(/[A-ZÄÖÜ][a-zäöüß]+|[a-zäöüß]+/g) || [];
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 5).map((word) => ({
      word,
      type: "new",
    }));
  }

  getFallbackResponse(scenario, userInput) {
    return `Das ist interessant! Erzählen Sie mir mehr darüber. (That's interesting! Tell me more about it.)`;
  }

  initializeNPCState(scenario) {
    return {
      mood: "neutral",
      relationship: 0,
      trust: 0,
      knowledge: 0,
      topics: {},
      lastInteraction: null,
    };
  }

  // ============================================
  // 📚 Scenario Templates
  // ============================================

  getScenarioTemplate(type, level) {
    const templates = this.getScenarioTemplates();
    return templates.find((s) => s.id === type && s.level === level) || null;
  }

  getScenarioTemplates() {
    return [
      {
        id: "restaurant",
        type: "restaurant",
        level: "A1",
        title: { fa: "رستوران", en: "Restaurant", de: "Restaurant" },
        npc: {
          name: "Herr Müller",
          role: "garçon",
          personality: "friendly, professional, patient",
        },
        setting: {
          fa: "یک رستوران آلمانی در برلین",
          en: "A German restaurant in Berlin",
          de: "Ein deutsches Restaurant in Berlin",
        },
        goal: {
          fa: "سفارش غذا و نوشیدنی به آلمانی",
          en: "Order food and drinks in German",
          de: "Essen und Getränke auf Deutsch bestellen",
        },
        stages: [
          {
            id: "stage1",
            title: "ورود به رستوران",
            description: "به رستوران خوش آمدید! من گارسون هستم. چه چیزی دوست دارید؟",
            options: [
              { id: "greeting", text: "سلام! یک میز برای دو نفر", nextStage: 1 },
              { id: "menu", text: "منوی غذا را می‌توانم ببینم؟", nextStage: 1 },
            ],
          },
          {
            id: "stage2",
            title: "سفارش غذا",
            description: "چه چیزی دوست دارید سفارش دهید؟",
            options: [
              { id: "order_food", text: "من می‌خواهم یک استیک سفارش دهم", nextStage: 2 },
              { id: "order_drink", text: "یک نوشیدنی می‌خواهم", nextStage: 2 },
            ],
          },
        ],
        initialOptions: [
          { id: "greeting", text: "سلام! من اینجا هستم برای ناهار", nextStage: 0 },
          { id: "menu", text: "منوی غذا را ببینم", nextStage: 0 },
        ],
      },
    ];
  }

  // ============================================
  // 📊 Scoring & XP
  // ============================================

  calculateXPReward(session) {
    const baseXP = 50;
    const bonusMultiplier = session.context.completed ? 1.5 : 0.5;
    const accuracyBonus =
      session.context.correctAnswers /
      (session.context.correctAnswers + session.context.mistakes + 1);

    return Math.round(baseXP * bonusMultiplier + accuracyBonus * 20);
  }

  async awardXP(userId, amount, source) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      await user.increment("xp", { by: amount });

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
  // 📋 Summary & Recommendations
  // ============================================

  async generateScenarioSummary(session) {
    const dialogueCount = session.dialogueHistory.length;
    const duration = new Date() - session.context.startedAt;
    const minutes = Math.round(duration / 60000);

    return {
      totalInteractions: dialogueCount,
      durationMinutes: minutes,
      accuracy:
        (session.context.correctAnswers /
          (session.context.correctAnswers + session.context.mistakes + 1)) *
        100,
      vocabularyLearned: session.context.vocabularyLearned || 0,
      grammarConcepts: session.context.grammarConcepts || 0,
    };
  }

  async generateRecommendations(session) {
    const memory = this.npcMemory.get(session.id);
    const recommendations = [];

    if (memory?.user?.mistakes?.length > 0) {
      recommendations.push({
        type: "grammar",
        priority: "high",
        text: `Focus on: ${memory.user.mistakes.join(", ")}`,
      });
    }

    if (session.context.score < 50) {
      recommendations.push({
        type: "practice",
        priority: "high",
        text: "Practice basic vocabulary and phrases",
      });
    }

    return recommendations;
  }

  // ============================================
  // 🎭 Generate Opening Dialogue
  // ============================================

  async generateOpeningDialogue(scenario, session) {
    const npc = scenario.npc;
    const setting = scenario.setting;

    return {
      npc: npc.name,
      message: `Guten Tag! Willkommen im Restaurant. Was kann ich für Sie tun?`,
      translation: `روز بخیر! به رستوران خوش آمدید. چه کمکی می‌توانم به شما کنم؟`,
    };
  }
}

export default new ScenarioEngine();

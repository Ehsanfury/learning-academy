/**
 * aiService.js
 * Path: backend/services/aiService.js
 * Description: AI service with better error handling and fallback
 * Version: 2.0 - Improved
 * Changes:
 * - ✅ Multiple provider support (OpenAI, Anthropic, local)
 * - ✅ Fallback to second provider on failure
 * - ✅ Mock mode for development
 * - ✅ Rate limiting per user
 * - ✅ Response caching
 * - ✅ Better error handling
 * - ✅ Token usage tracking
 */

import logger from "../config/logger.js";
import config from "../config/env.js";

// ============================================
// ⚙️ Constants
// ============================================

const MAX_TOKENS_PER_USER_PER_DAY = 10000;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory caches (use Redis in production)
const responseCache = new Map();
const userTokenUsage = new Map();

class AIService {
  constructor() {
    this.providers = {
      openai: this.callOpenAI.bind(this),
      anthropic: this.callAnthropic.bind(this),
      local: this.callLocalLLM.bind(this),
      mock: this.callMock.bind(this),
    };

    this.defaultProvider = config.ai?.provider || "mock";
    this.fallbackProvider = config.ai?.fallbackProvider || "mock";
  }

  // ============================================
  // 🎯 Main Chat Method
  // ============================================

  async chat(userId, message, level = "A1", options = {}) {
    try {
      // Check rate limit
      await this.checkRateLimit(userId);

      // Check cache
      const cacheKey = this.getCacheKey(userId, message, level, options);
      if (responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          logger.info(`🤖 AI cache hit for user: ${userId}`);
          return { ...cached.response, isCached: true };
        }
        responseCache.delete(cacheKey);
      }

      // Build context
      const context = this.buildContext(level, options);

      // Try primary provider
      let response;
      try {
        response = await this.providers[this.defaultProvider](message, context, options);
      } catch (primaryError) {
        logger.warn(`🤖 Primary AI provider failed, trying fallback: ${primaryError.message}`);

        // Try fallback provider
        try {
          response = await this.providers[this.fallbackProvider](message, context, options);
          response.usedFallback = true;
        } catch (fallbackError) {
          logger.error(`🤖 All AI providers failed: ${fallbackError.message}`);
          // Last resort: mock response
          response = await this.callMock(message, context, options);
          response.isMock = true;
        }
      }

      // Track token usage
      if (response.tokensUsed) {
        this.trackTokenUsage(userId, response.tokensUsed);
      }

      // Cache response
      responseCache.set(cacheKey, {
        response,
        timestamp: Date.now(),
      });

      logger.info(`🤖 AI response sent to user: ${userId} (provider: ${response.provider})`);

      return response;
    } catch (error) {
      logger.error(`🤖 AI chat error for user ${userId}:`, error);
      throw error;
    }
  }

  // ============================================
  // 🚦 Rate Limiting
  // ============================================

  async checkRateLimit(userId) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    const usage = userTokenUsage.get(key) || 0;

    if (usage >= MAX_TOKENS_PER_USER_PER_DAY) {
      throw new Error("Daily AI usage limit exceeded. Please try again tomorrow.");
    }
  }

  trackTokenUsage(userId, tokens) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    const current = userTokenUsage.get(key) || 0;
    userTokenUsage.set(key, current + tokens);
  }

  // ============================================
  // 🔑 Cache Key
  // ============================================

  getCacheKey(userId, message, level, options) {
    const optionsStr = JSON.stringify(options || {});
    return `${userId}-${level}-${message}-${optionsStr}`;
  }

  // ============================================
  // 🏗️ Build Context
  // ============================================

  buildContext(level, options = {}) {
    return {
      level,
      mode: options.mode || "general",
      nativeLanguage: options.nativeLanguage || "fa",
      systemPrompt: this.getSystemPrompt(level, options.mode),
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    };
  }

  getSystemPrompt(level, mode) {
    const basePrompt = `You are a helpful German language teacher for ${level} level students.
    The student's native language is Persian/Farsi.
    Provide clear explanations and examples.
    Correct mistakes gently and encourage the student.`;

    const modePrompts = {
      general: "Help the student with general German language questions.",
      conversation:
        "Engage in a conversation in German. Keep responses simple for the student's level.",
      grammar: "Focus on grammar explanations and examples.",
      vocabulary: "Help with vocabulary building and word usage.",
    };

    return `${basePrompt}\n\n${modePrompts[mode] || modePrompts.general}`;
  }

  // ============================================
  // 🤖 OpenAI Provider
  // ============================================

  async callOpenAI(message, context, options) {
    if (!config.ai?.openai?.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.ai.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.openai.model || "gpt-4",
        messages: [
          { role: "system", content: context.systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: context.maxTokens,
        temperature: context.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0]?.message?.content || "",
      provider: "openai",
      tokensUsed: data.usage?.total_tokens || 0,
      model: data.model,
    };
  }

  // ============================================
  // 🤖 Anthropic Provider
  // ============================================

  async callAnthropic(message, context, options) {
    if (!config.ai?.anthropic?.apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.ai.anthropic.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.ai.anthropic.model || "claude-3-sonnet-20240229",
        system: context.systemPrompt,
        messages: [{ role: "user", content: message }],
        max_tokens: context.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.content?.[0]?.text || "",
      provider: "anthropic",
      tokensUsed: data.usage?.output_tokens || 0,
      model: data.model,
    };
  }

  // ============================================
  // 🤖 Local LLM Provider
  // ============================================

  async callLocalLLM(message, context, options) {
    const localUrl = config.ai?.local?.url || "http://localhost:11434";

    const response = await fetch(`${localUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ai?.local?.model || "llama2",
        prompt: `${context.systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: context.temperature,
          num_predict: context.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.response || "",
      provider: "local",
      tokensUsed: 0,
      model: config.ai?.local?.model || "llama2",
    };
  }

  // ============================================
  // 🎭 Mock Provider (for development/testing)
  // ============================================

  async callMock(message, context, options) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockResponses = {
      general: `This is a mock response to: "${message}". In production, this would be a real AI response from ${context.level} level German teacher.`,
      conversation: `Das ist eine Beispielantwort. (This is a sample response in German.)`,
      grammar: `Hier ist eine Grammatikerklärung. (Here is a grammar explanation.)`,
      vocabulary: `Hier sind einige Vokabeln. (Here are some vocabulary words.)`,
    };

    return {
      text: mockResponses[context.mode] || mockResponses.general,
      provider: "mock",
      tokensUsed: 0,
      isMock: true,
    };
  }

  // ============================================
  // 📊 Get Usage Stats
  // ============================================

  async getUsageStats(userId) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    const todayUsage = userTokenUsage.get(key) || 0;

    return {
      today: todayUsage,
      limit: MAX_TOKENS_PER_USER_PER_DAY,
      remaining: MAX_TOKENS_PER_USER_PER_DAY - todayUsage,
      percentage: Math.round((todayUsage / MAX_TOKENS_PER_USER_PER_DAY) * 100),
    };
  }

  // ============================================
  // 🧹 Clear Cache
  // ============================================

  clearCache() {
    responseCache.clear();
    logger.info("🤖 AI response cache cleared");
  }
}

export default new AIService();

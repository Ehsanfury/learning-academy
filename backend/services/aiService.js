/**
 * aiService.js
 * Path: backend/services/aiService.js
 * Description: AI service with support for Gemini, OpenRouter, and Cerebras
 * Version: 8.0 - Added Cerebras support
 * Changes:
 * - ✅ ADDED: Cerebras AI support (csk-...)
 * - ✅ FIXED: Better error handling for all providers
 * - ✅ FIXED: Mock mode as final fallback
 */

import axios from "axios";
import logger from "../config/logger.js";

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.cerebrasApiKey = process.env.CEREBRAS_API_KEY;
    this.timeout = 30000;

    logger.info("🤖 AI Service Initialized");
    logger.info(`   Gemini: ${this.geminiApiKey ? "✅ Configured" : "❌ Not configured"}`);
    logger.info(`   OpenRouter: ${this.openRouterApiKey ? "✅ Configured" : "❌ Not configured"}`);
    logger.info(`   Cerebras: ${this.cerebrasApiKey ? "✅ Configured" : "❌ Not configured"}`);
  }

  /**
   * Main chat method - always returns a response
   */
  async chat(userId, message, level = "A1", context = {}) {
    try {
      const sanitizedMessage = this.sanitizeInput(message);
      const mode = context.mode || "tutor";
      const language = context.language || "fa";

      logger.info(
        `💬 AI Chat from user ${userId}: "${sanitizedMessage.substring(0, 50)}..." (mode: ${mode})`
      );

      const conversationHistory = (context.messages || []).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content || m.message || "",
      }));

      if (
        conversationHistory.length > 0 &&
        conversationHistory[conversationHistory.length - 1].role === "user"
      ) {
        conversationHistory.pop();
      }

      // ✅ Try Cerebras first (new)
      if (this.cerebrasApiKey) {
        try {
          const response = await this.callCerebras(
            sanitizedMessage,
            level,
            conversationHistory,
            mode,
            language
          );
          if (response) {
            return {
              text: response,
              provider: "cerebras",
              isMock: false,
            };
          }
        } catch (error) {
          logger.warn(`⚠️ Cerebras failed: ${error.message}`);
        }
      }

      // Try Gemini
      if (this.geminiApiKey) {
        try {
          const response = await this.callGemini(
            sanitizedMessage,
            level,
            conversationHistory,
            mode,
            language
          );
          if (response) {
            return {
              text: response,
              provider: "gemini",
              isMock: false,
            };
          }
        } catch (error) {
          logger.warn(`⚠️ Gemini failed: ${error.message}`);
        }
      }

      // Try OpenRouter as fallback
      if (this.openRouterApiKey) {
        try {
          const response = await this.callOpenRouter(
            sanitizedMessage,
            level,
            conversationHistory,
            mode,
            language
          );
          if (response) {
            return {
              text: response,
              provider: "openrouter",
              isMock: false,
            };
          }
        } catch (error) {
          logger.warn(`⚠️ OpenRouter failed: ${error.message}`);
        }
      }

      // Final fallback: mock response
      logger.warn(`⚠️ Using mock response for user ${userId}`);
      return {
        text: this.getMockResponse(sanitizedMessage, mode),
        provider: "mock",
        isMock: true,
      };
    } catch (error) {
      logger.error(`❌ AI Chat error:`, error);
      return {
        text: this.getMockResponse(message),
        provider: "mock",
        isMock: true,
        error: error.message,
      };
    }
  }

  /**
   * ✅ NEW: Call Cerebras API
   * Cerebras uses OpenAI-compatible API
   */
  async callCerebras(message, level, history = [], mode = "tutor", language = "fa") {
    const systemPrompt = this.getSystemPrompt(level, mode, language);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: "llama3.1-70b",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.cerebrasApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from Cerebras");
    }

    return text;
  }

  /**
   * Call Gemini API
   */
  async callGemini(message, level, history = [], mode = "tutor", language = "fa") {
    try {
      const systemPrompt = this.getSystemPrompt(level, mode, language);
      let conversationPrompt = `${systemPrompt}\n\n`;

      history.forEach((h) => {
        const role = h.role === "assistant" ? "AI" : "User";
        conversationPrompt += `${role}: ${h.content}\n`;
      });
      conversationPrompt += `User: ${message}\nAI:`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          contents: [
            {
              parts: [{ text: conversationPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.geminiApiKey,
          },
          timeout: this.timeout,
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return text;
    } catch (error) {
      if (error.response?.status === 403) {
        logger.error(`❌ Gemini API Key is invalid or expired.`);
      }
      throw error;
    }
  }

  /**
   * Call OpenRouter API
   */
  async callOpenRouter(message, level, history = [], mode = "tutor", language = "fa") {
    const systemPrompt = this.getSystemPrompt(level, mode, language);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Learning Academy",
        },
        timeout: this.timeout,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from OpenRouter");
    }

    return text;
  }

  /**
   * Get system prompt based on mode
   */
  getSystemPrompt(level, mode = "tutor", language = "fa") {
    const basePrompt = `You are a friendly German language assistant. The student is at level ${level}.`;

    const modePrompts = {
      tutor: `
You are a professional German language tutor. Your role is to:
1. Teach German in a structured way
2. Correct mistakes gently
3. Explain grammar rules
4. Provide examples
5. Always respond in ${language} but include German examples

Example: "عالی! جمله شما درست است. به آلمانی می‌گوییم: Ich heiße ..."`,

      conversation: `
You are a friendly German conversation partner. Your role is to:
1. Have natural conversations in German
2. Help the user practice speaking
3. Keep the conversation flowing
4. Use simple German with occasional English help
5. Respond in German with English translations when needed`,

      free: `
You are a helpful AI assistant. Your role is to:
1. Answer questions about any topic
2. Help with German language learning when asked
3. Be friendly and helpful
4. Respond in ${language} or German based on user's preference
5. Be versatile and adaptable`,
    };

    return basePrompt + (modePrompts[mode] || modePrompts.tutor);
  }

  /**
   * Get mock response
   */
  getMockResponse(message, mode = "tutor") {
    const lower = message.toLowerCase();

    if (lower.includes("hallo") || lower.includes("سلام") || lower.includes("hi")) {
      return "Hallo! Wie geht es dir? (سلام! حالت چطور است؟)";
    }
    if (lower.includes("name") || lower.includes("اسم") || lower.includes("نام")) {
      return "Ich heiße German Academy. Wie heißt du? (اسم من آکادمی آلمانی است. شما چه نامی دارید؟)";
    }
    if (lower.includes("wie geht") || lower.includes("حال") || lower.includes("چطوری")) {
      return "Mir geht es gut, danke! Und dir? (من خوبم، متشکرم! و شما؟)";
    }
    if (lower.includes("danke") || lower.includes("مرسی") || lower.includes("ممنون")) {
      return "Bitte schön! (خواهش می‌کنم!)";
    }
    if (lower.includes("tschüss") || lower.includes("خداحافظ") || lower.includes("بای")) {
      return "Auf Wiedersehen! Bis bald! (خدانگهدار! به زودی می‌بینمت!)";
    }
    if (lower.includes("lieblingsessen") || lower.includes("غذا")) {
      return "Mein Lieblingsessen ist Pizza! Ich esse gerne Pizza mit Tomaten und Käse. (غذای مورد علاقه من پیتزا است! من پیتزا با گوجه و پنیر دوست دارم.)";
    }

    return `این یک جمله جالب است! به آلمانی می‌توانید بگویید: "${message}"
آیا می‌خواهید معنی آن را بدانید؟`;
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input) {
    if (!input) return "";
    return input
      .replace(/<[^>]*>/g, "")
      .replace(/[{}[\]()]/g, "")
      .replace(/system:/gi, "")
      .trim();
  }

  /**
   * Generate response (alias for chat)
   */
  async generateResponse(userId, message, level = "A1", context = {}) {
    return this.chat(userId, message, level, context);
  }

  /**
   * Grammar correction
   */
  async correctGrammar(text, userId = "anonymous") {
    const response = await this.chat(userId, `لطفاً این جمله آلمانی را تصحیح کن: ${text}`, "A1");
    return {
      corrected: response.text,
      errors: [],
      suggestions: [],
    };
  }

  /**
   * Translate to German
   */
  async translateToGerman(text, nativeLanguage = "fa") {
    const response = await this.chat(
      "anonymous",
      `لطفاً این جمله را به آلمانی ترجمه کن: ${text}`,
      "A1"
    );
    return {
      translation: response.text,
      original: text,
    };
  }

  /**
   * Explain grammar
   */
  async explainGrammar(concept, level = "A1", nativeLanguage = "fa") {
    const response = await this.chat(
      "anonymous",
      `لطفاً مفهوم گرامری "${concept}" را برای سطح ${level} توضیح بده`,
      level
    );
    return {
      explanation: response.text,
      concept,
      level,
    };
  }

  /**
   * Generate exercise
   */
  async generateExercise(topic, level = "A1", count = 5) {
    const response = await this.chat(
      "anonymous",
      `لطفاً ${count} تمرین برای موضوع "${topic}" در سطح ${level} بساز`,
      level
    );
    return {
      exercises: response.text,
      topic,
      level,
      count,
    };
  }

  /**
   * Start scenario
   */
  async startScenario(scenarioType, level = "A1") {
    const response = await this.chat(
      "anonymous",
      `یک سناریوی ${scenarioType} برای مکالمه آلمانی در سطح ${level} شروع کن`,
      level
    );
    return {
      text: response.text,
      scenarioType,
      level,
    };
  }

  /**
   * Continue scenario
   */
  async continueScenario(history, message) {
    const response = await this.chat(
      "anonymous",
      `ادامه سناریو: ${history}\nپاسخ من: ${message}`,
      "A1"
    );
    return {
      text: response.text,
    };
  }
}

export default new AIService();

/**
 * aiService.js
 * Path: backend/services/aiService.js
 * Description: AI service with fallback support
 * Version: 7.0 - Fixed Gemini API key exposure
 * Changes:
 * - ✅ FIXED: Gemini API key no longer in URL (using @google/generative-ai SDK)
 * - ✅ FIXED: Gemini model updated to gemini-2.0-flash
 * - ✅ FIXED: Conversation history now sent to AI
 * - ✅ FIXED: OpenRouter model updated to gpt-4o-mini
 * - ✅ FIXED: Better error handling
 */

import axios from "axios";
import logger from "../config/logger.js";

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.timeout = 30000;

    logger.info("🤖 AI Service Initialized");
    logger.info(`   Gemini: ${this.geminiApiKey ? "✅ Configured" : "❌ Not configured"}`);
    logger.info(`   OpenRouter: ${this.openRouterApiKey ? "✅ Configured" : "❌ Not configured"}`);
  }

  /**
   * Main chat method - always returns a response
   */
  async chat(userId, message, level = "A1", context = {}) {
    try {
      const sanitizedMessage = this.sanitizeInput(message);
      logger.info(`💬 AI Chat from user ${userId}: "${sanitizedMessage.substring(0, 50)}..."`);

      // Build conversation history from context
      const conversationHistory = (context.messages || []).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content || m.message || "",
      }));

      // Remove last user message (it's being sent now)
      if (
        conversationHistory.length > 0 &&
        conversationHistory[conversationHistory.length - 1].role === "user"
      ) {
        conversationHistory.pop();
      }

      // Try Gemini first
      if (this.geminiApiKey) {
        try {
          const response = await this.callGemini(sanitizedMessage, level, conversationHistory);
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
          const response = await this.callOpenRouter(sanitizedMessage, level, conversationHistory);
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
        text: this.getMockResponse(sanitizedMessage),
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
   * Call Gemini API
   * ✅ FIXED: Using @google/generative-ai SDK instead of URL with API key
   * ✅ FIXED: Updated to gemini-2.0-flash
   */
  async callGemini(message, level, history = []) {
    try {
      // ✅ FIXED: Use SDK instead of URL with API key
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemPrompt = this.getSystemPrompt(level);
      const fullPrompt = `${systemPrompt}\n\n`;

      // Build conversation with history
      let conversationPrompt = fullPrompt;
      history.forEach((h) => {
        const role = h.role === "assistant" ? "AI" : "User";
        conversationPrompt += `${role}: ${h.content}\n`;
      });
      conversationPrompt += `User: ${message}\nAI:`;

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: conversationPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topP: 0.95,
        },
      });

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return text;
    } catch (error) {
      logger.error(`❌ Gemini API error:`, error.message);
      throw error;
    }
  }

  /**
   * Call OpenRouter API
   * ✅ FIXED: Updated to gpt-4o-mini
   */
  async callOpenRouter(message, level, history = []) {
    const systemPrompt = this.getSystemPrompt(level);

    // Build messages with history
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
   * Generate response (alias for chat)
   */
  async generateResponse(userId, message, level = "A1", context = {}) {
    return this.chat(userId, message, level, context);
  }

  /**
   * Get system prompt
   */
  getSystemPrompt(level) {
    return `You are a friendly German language tutor. Your student is at level ${level}.

Important rules:
1. Always respond in Persian (Farsi) but include German examples
2. Keep responses short (2-3 sentences)
3. Be encouraging and helpful
4. Correct mistakes gently
5. Include vocabulary when helpful

Example: "عالی! جمله شما درست است. به آلمانی می‌گوییم: Ich heiße ..."

Now respond to the user's message in Persian.`;
  }

  /**
   * Get mock response (fallback)
   */
  getMockResponse(message) {
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
    if (lower.includes("was") || lower.includes("چیست") || lower.includes("این")) {
      return "Das ist ein/eine... (این یک ... است). برای یادگیری بهتر، می‌توانید بپرسید: 'Was bedeutet das?' (این یعنی چه؟)";
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

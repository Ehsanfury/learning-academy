import api from "./api";

const aiApi = {
  sendMessage: async (message, context = {}) => {
    return api.post("/ai/chat", {
      message,
      mode: context.mode || "chat",
      level: context.level || "A1",
      scenario: context.scenario || null,
      history: context.history || [],
    });
  },

  checkGrammar: async (text, level = "A1") => {
    return api.post("/ai/grammar-check", {
      text,
      level,
    });
  },

  analyzePronunciation: async (audioBlob, targetPhrase) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("targetPhrase", targetPhrase);

    return api.post("/ai/speak", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  generateScenario: async (scenarioType, level = "A1") => {
    return api.post("/ai/scenario", {
      type: scenarioType,
      level,
    });
  },

  getSuggestions: async (level = "A1") => {
    return api.get("/ai/suggestions", { params: { level } });
  },
};

export default aiApi;

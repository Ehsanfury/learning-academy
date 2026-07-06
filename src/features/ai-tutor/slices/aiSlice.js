import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiApi from "@services/aiApi";

export const sendMessage = createAsyncThunk(
  "ai/sendMessage",
  async ({ message, context }, { rejectWithValue }) => {
    try {
      const response = await aiApi.sendMessage(message, context);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const checkGrammar = createAsyncThunk(
  "ai/checkGrammar",
  async ({ text, level }, { rejectWithValue }) => {
    try {
      const response = await aiApi.checkGrammar(text, level);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    messages: [],
    isTyping: false,
    mode: "chat",
    activeScenario: null,
    error: null,
    suggestions: [],
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setActiveScenario: (state, action) => {
      state.activeScenario = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.activeScenario = null;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        state.messages.push({
          type: "bot",
          text: action.payload.text,
          grammarNote: action.payload.grammarNote,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload;
      });
  },
});

export const {
  setMode,
  setActiveScenario,
  addMessage,
  clearMessages,
  setSuggestions,
} = aiSlice.actions;

export default aiSlice.reducer;

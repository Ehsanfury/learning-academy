/**
 * socketHandler.js
 WebSocket connection management for real-time communication
 */

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Join lesson room
    socket.on("join-lesson", (lessonId) => {
      socket.join(`lesson:${lessonId}`);
      console.log(`📚 Socket ${socket.id} joined lesson:${lessonId}`);

      // Notify others in the room
      socket.to(`lesson:${lessonId}`).emit("user-joined", {
        userId: socket.id,
        timestamp: new Date(),
      });
    });

    // Leave lesson room
    socket.on("leave-lesson", (lessonId) => {
      socket.leave(`lesson:${lessonId}`);
      console.log(`📚 Socket ${socket.id} left lesson:${lessonId}`);
    });

    // Real-time answer submission
    socket.on("submit-answer", (data) => {
      const { lessonId, questionId, answer, userId } = data;
      socket.to(`lesson:${lessonId}`).emit("answer-submitted", {
        userId,
        questionId,
        answer,
        timestamp: new Date(),
      });
    });

    // Live typing indicator
    socket.on("typing", (data) => {
      const { lessonId, userId, isTyping } = data;
      socket.to(`lesson:${lessonId}`).emit("user-typing", {
        userId,
        isTyping,
        timestamp: new Date(),
      });
    });

    // Join AI tutor room
    socket.on("join-ai-tutor", (userId) => {
      socket.join(`ai:${userId}`);
      console.log(`🤖 Socket ${socket.id} joined AI tutor for user:${userId}`);
    });

    // AI conversation event
    socket.on("ai-message", async (data) => {
      const { userId, message, mode, level } = data;

      // Emit thinking status
      socket.emit("ai-thinking", { status: true });

      // Simulate AI response (replace with actual AI call)
      setTimeout(() => {
        socket.emit("ai-response", {
          text: `AI response to: "${message}"`,
          timestamp: new Date(),
        });
        socket.emit("ai-thinking", { status: false });
      }, 1000);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });
};

export default initializeSocket;

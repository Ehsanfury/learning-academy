/**
 * swagger.js
 * Path: backend/config/swagger.js
 * Description: Swagger/OpenAPI configuration for API documentation
 */

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Learning Academy API",
      version: "1.0.0",
      description: "API documentation for Learning Academy - German Language Learning Platform",
      contact: {
        name: "Learning Academy Team",
        email: "support@learning-academy.com",
        url: "https://learning-academy.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5001/api",
        description: "Development server",
      },
      {
        url: "https://api.learning-academy.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "admin"] },
            xp: { type: "integer" },
            level: { type: "integer" },
            streak: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Lesson: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: {
              type: "object",
              properties: {
                fa: { type: "string" },
                en: { type: "string" },
                de: { type: "string" },
              },
            },
            level: { type: "string" },
            totalSections: { type: "integer" },
            totalVocabulary: { type: "integer" },
            xpReward: { type: "integer" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { type: "string" },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management" },
      { name: "Lessons", description: "Lesson management" },
      { name: "AI", description: "AI services" },
      { name: "Achievements", description: "Achievement system" },
      { name: "Dictionary", description: "Dictionary and vocabulary" },
      { name: "Stories", description: "Interactive stories" },
      { name: "Scenarios", description: "Real-life scenarios" },
      { name: "Mentors", description: "Mentor system" },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Learning Academy API Docs",
    })
  );
};

export default specs;

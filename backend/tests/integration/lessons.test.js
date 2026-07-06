/**
 * lessons.test.js
 * Path: backend/tests/integration/lessons.test.js
 * Description: Lessons API integration tests
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import sequelize from "../../config/db.js";

const API_URL = "/api/lessons";

describe("Lessons API Integration Tests", () => {
  let accessToken;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create and login user
    await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      name: "Test User",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("GET /api/lessons", () => {
    it("should return list of lessons", async () => {
      const response = await request(app)
        .get(API_URL)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get(API_URL).expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/lessons/:id", () => {
    it("should return lesson details", async () => {
      // First get the list to get a lesson ID
      const listResponse = await request(app)
        .get(API_URL)
        .set("Authorization", `Bearer ${accessToken}`);

      if (listResponse.body.data.length > 0) {
        const lessonId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`${API_URL}/${lessonId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data).toHaveProperty("id");
      }
    });

    it("should return 404 for non-existent lesson", async () => {
      const response = await request(app)
        .get(`${API_URL}/non-existent`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});

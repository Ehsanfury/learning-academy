/**
 * auth.test.js
 * Path: backend/tests/integration/auth.test.js
 * Description: Auth API integration tests
 * Changes:
 * - ✅ FIXED: Drop all tables before sync to avoid foreign key issues
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import sequelize from "../../config/db.js";

describe("Auth API", () => {
  const testUser = {
    email: "api@example.com",
    password: "Test123456",
    name: "API Test",
    username: "apitest",
  };

  let accessToken;

  beforeAll(async () => {
    // ✅ FIXED: Drop all tables with cascade before sync
    await sequelize.drop({ cascade: true });
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send(testUser).expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should not register with existing email", async () => {
      const response = await request(app).post("/api/auth/register").send(testUser).expect(409);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("user");

      accessToken = response.body.data.accessToken;
    });

    it("should not login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user profile", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should not allow access without token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});

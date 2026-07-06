/**
 * auth.test.js
 * Path: backend/tests/integration/auth.test.js
 * Description: Auth API integration tests
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import sequelize from "../../config/db.js";
import User from "../../models/User.js";

const API_URL = "/api/auth";

describe("Auth API Integration Tests", () => {
  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/auth/register", () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
      name: "Test User",
    };

    it("should register a new user", async () => {
      const response = await request(app).post(`${API_URL}/register`).send(userData).expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    it("should return 409 if email already exists", async () => {
      const response = await request(app).post(`${API_URL}/register`).send(userData).expect(409);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("already exists");
    });

    it("should return 400 if validation fails", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "123",
      };

      const response = await request(app).post(`${API_URL}/register`).send(invalidData).expect(400);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/auth/login", () => {
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user successfully", async () => {
      const response = await request(app).post(`${API_URL}/login`).send(loginData).expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.headers).toHaveProperty("set-cookie");
    });

    it("should return 401 for invalid credentials", async () => {
      const invalidData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app).post(`${API_URL}/login`).send(invalidData).expect(401);

      expect(response.body).toHaveProperty("success", false);
    });

    it("should return 400 if email is missing", async () => {
      const invalidData = {
        password: "password123",
      };

      const response = await request(app).post(`${API_URL}/login`).send(invalidData).expect(400);

      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/auth/me", () => {
    let accessToken;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app).post(`${API_URL}/login`).send({
        email: "test@example.com",
        password: "password123",
      });
      accessToken = response.body.data.accessToken;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("email", "test@example.com");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/users/me").expect(401);

      expect(response.body).toHaveProperty("success", false);
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});

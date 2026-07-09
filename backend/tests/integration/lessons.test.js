/**
 * lessons.test.js
 * Path: backend/tests/integration/lessons.test.js
 * Description: Lessons API integration tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import sequelize from '../../config/db.js';
import { Lesson } from '../../models/index.js';

describe('Lessons API', () => {
  let accessToken;

  beforeAll(async () => {
    // ✅ فقط sync - drop قبلاً در testSetup انجام شده
    await sequelize.sync({ force: true });

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'lesson@example.com',
        password: 'Test123456',
        name: 'Lesson Test',
        username: 'lessontest',
      });

    if (userResponse.body.success && userResponse.body.data?.accessToken) {
      accessToken = userResponse.body.data.accessToken;
    }

    // Create test lesson
    await Lesson.create({
      id: 'test-l01',
      level: 'A1',
      unit: 1,
      order: 1,
      title: { fa: 'درس تست', en: 'Test Lesson' },
      description: { fa: 'توضیحات', en: 'Description' },
      sections: [],
      totalSections: 0,
      isActive: true,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe("GET /api/lessons", () => {
    it("should return list of lessons", async () => {
      const response = await request(app)
        .get("/api/lessons")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("lessons");
      expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it("should filter lessons by level", async () => {
      const response = await request(app)
        .get("/api/lessons?level=A1")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.lessons[0].level).toBe("A1");
    });
  });

  describe("GET /api/lessons/:id", () => {
    it("should return a specific lesson", async () => {
      const response = await request(app)
        .get("/api/lessons/test-l01")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data.id).toBe("test-l01");
    });

    it("should return 404 for non-existent lesson", async () => {
      const response = await request(app)
        .get("/api/lessons/non-existent")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
    });
  });
});

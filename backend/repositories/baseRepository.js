/**
 * baseRepository.js
 * Path: backend/repositories/baseRepository.js
 * Description: Base repository with common CRUD operations
 * Changes:
 * - ✅ FIXED: Added null check for options in findAll
 * - ✅ Added proper error handling
 * - ✅ Added default options
 * - ✅ Improved logging
 */

import { Op } from "sequelize";
import logger from "../config/logger.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with pagination
   * ✅ FIXED: Added null check for options
   */
  async findAll(options = {}, pagination = null) {
    try {
      // ✅ FIXED: Ensure options is not null
      const safeOptions = options || {};

      let queryOptions = { ...safeOptions };

      // Add pagination if provided
      if (pagination) {
        const { limit = 10, offset = 0 } = pagination;
        queryOptions = {
          ...queryOptions,
          limit,
          offset,
        };
      }

      logger.debug(`📊 Finding all ${this.model.name} records`, {
        options: queryOptions,
        pagination,
      });

      const result = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${result.length} ${this.model.name} records`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.findAll error:`, {
        error: error.message,
        stack: error.stack,
        options,
        pagination,
      });
      throw error;
    }
  }

  /**
   * Find and count all records with pagination
   */
  async findAndCountAll(options = {}, pagination = null) {
    try {
      const safeOptions = options || {};

      let queryOptions = { ...safeOptions };

      if (pagination) {
        const { limit = 10, offset = 0 } = pagination;
        queryOptions = {
          ...queryOptions,
          limit,
          offset,
        };
      }

      logger.debug(`📊 Finding and counting ${this.model.name} records`, {
        options: queryOptions,
      });

      const result = await this.model.findAndCountAll(queryOptions);

      logger.debug(`✅ Found ${result.count} ${this.model.name} records`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.findAndCountAll error:`, {
        error: error.message,
        stack: error.stack,
        options,
        pagination,
      });
      throw error;
    }
  }

  /**
   * Find one record
   */
  async findOne(options = {}) {
    try {
      const safeOptions = options || {};

      logger.debug(`📊 Finding one ${this.model.name} record`, { options: safeOptions });

      const result = await this.model.findOne(safeOptions);

      if (!result) {
        logger.debug(`ℹ️ No ${this.model.name} record found`);
        return null;
      }

      logger.debug(`✅ Found ${this.model.name} record`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.findOne error:`, {
        error: error.message,
        stack: error.stack,
        options,
      });
      throw error;
    }
  }

  /**
   * Find by primary key
   */
  async findById(id, options = {}) {
    try {
      if (!id) {
        throw new ValidationError({
          message: "ID is required",
          details: [{ field: "id", message: "ID is required" }],
        });
      }

      const safeOptions = options || {};

      logger.debug(`📊 Finding ${this.model.name} by id: ${id}`);

      const result = await this.model.findByPk(id, safeOptions);

      if (!result) {
        logger.debug(`ℹ️ No ${this.model.name} found with id: ${id}`);
        return null;
      }

      logger.debug(`✅ Found ${this.model.name} with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.findById error:`, {
        error: error.message,
        stack: error.stack,
        id,
        options,
      });
      throw error;
    }
  }

  /**
   * Find by ID or throw not found
   */
  async findByIdOrFail(id, options = {}) {
    const result = await this.findById(id, options);
    if (!result) {
      throw new NotFoundError({
        message: `${this.model.name} with id "${id}" not found`,
        resource: { model: this.model.name, id },
      });
    }
    return result;
  }

  /**
   * Create a record
   */
  async create(data, options = {}) {
    try {
      if (!data) {
        throw new ValidationError({
          message: "Data is required",
          details: [{ field: "data", message: "Data is required" }],
        });
      }

      const safeOptions = options || {};

      logger.debug(`📝 Creating ${this.model.name} record`, { data });

      const result = await this.model.create(data, safeOptions);

      logger.info(`✅ Created ${this.model.name} record with id: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.create error:`, {
        error: error.message,
        stack: error.stack,
        data,
        options,
      });
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id, data, options = {}) {
    try {
      if (!id) {
        throw new ValidationError({
          message: "ID is required",
          details: [{ field: "id", message: "ID is required" }],
        });
      }

      if (!data) {
        throw new ValidationError({
          message: "Data is required",
          details: [{ field: "data", message: "Data is required" }],
        });
      }

      const safeOptions = options || {};

      logger.debug(`📝 Updating ${this.model.name} record: ${id}`, { data });

      const record = await this.findByIdOrFail(id);
      const result = await record.update(data, safeOptions);

      logger.info(`✅ Updated ${this.model.name} record with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.update error:`, {
        error: error.message,
        stack: error.stack,
        id,
        data,
        options,
      });
      throw error;
    }
  }

  /**
   * Delete a record (soft delete if paranoid)
   */
  async delete(id, options = {}) {
    try {
      if (!id) {
        throw new ValidationError({
          message: "ID is required",
          details: [{ field: "id", message: "ID is required" }],
        });
      }

      const safeOptions = options || {};

      logger.debug(`🗑️ Deleting ${this.model.name} record: ${id}`);

      const record = await this.findByIdOrFail(id);
      const result = await record.destroy(safeOptions);

      logger.info(`✅ Deleted ${this.model.name} record with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.delete error:`, {
        error: error.message,
        stack: error.stack,
        id,
        options,
      });
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(options = {}) {
    try {
      const safeOptions = options || {};

      logger.debug(`📊 Counting ${this.model.name} records`, { options: safeOptions });

      const result = await this.model.count(safeOptions);

      logger.debug(`✅ Counted ${result} ${this.model.name} records`);
      return result;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.count error:`, {
        error: error.message,
        stack: error.stack,
        options,
      });
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(id, options = {}) {
    try {
      if (!id) {
        return false;
      }

      const safeOptions = options || {};

      const count = await this.model.count({
        where: { id },
        ...safeOptions,
      });

      return count > 0;
    } catch (error) {
      logger.error(`❌ ${this.model.name}.exists error:`, {
        error: error.message,
        stack: error.stack,
        id,
        options,
      });
      return false;
    }
  }
}

export default BaseRepository;

import { Organization } from '../models/organization.model.js';

export class OrganizationRepository {
  static async create(orgData) {
    return await Organization.create(orgData);
  }

  static async findById(id) {
    return await Organization.findById(id);
  }

  static async findAll(filter = {}) {
    return await Organization.find(filter);
  }

  static async update(id, data) {
    return await Organization.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await Organization.findByIdAndDelete(id);
  }
}

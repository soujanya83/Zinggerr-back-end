import { Role } from '../models/role.model.js';

export class RoleRepository {
  static async findByNameAndOrg(name, organizationId = null) {
    return await Role.findOne({ name, organization: organizationId });
  }

  static async create(roleData) {
    return await Role.create(roleData);
  }

  static async findById(id) {
    return await Role.findById(id);
  }

  static async findAll(filter = {}) {
    return await Role.find(filter);
  }

  static async update(id, data) {
    return await Role.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await Role.findByIdAndDelete(id);
  }
}

import { Permission } from '../models/permission.model.js';

export class PermissionRepository {
  static async create(data) {
    return await Permission.create(data);
  }

  static async findById(id) {
    return await Permission.findById(id);
  }

  static async findByModuleAndOrg(module, organizationId = null) {
    return await Permission.findOne({ module, organization: organizationId });
  }

  static async update(id, data) {
    return await Permission.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await Permission.findByIdAndDelete(id);
  }

  static async findAll(filter = {}) {
    return await Permission.find(filter);
  }

  static async count() {
    return await Permission.countDocuments();
  }

  static async bulkCreate(permissions) {
    return await Permission.insertMany(permissions);
  }
}

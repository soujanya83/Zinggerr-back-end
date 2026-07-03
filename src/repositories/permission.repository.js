import { Permission } from '../models/permission.model.js';

export class PermissionRepository {
  static async findAll() {
    return await Permission.find();
  }

  static async count() {
    return await Permission.countDocuments();
  }

  static async bulkCreate(permissions) {
    return await Permission.insertMany(permissions);
  }
}

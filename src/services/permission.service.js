import { PermissionRepository } from '../repositories/permission.repository.js';
import { ApiError } from '../utils/ApiError.js';

export class PermissionService {
  static async createPermission(permissionData) {
    const orgId = permissionData.organization || null;
    const existing = await PermissionRepository.findByModuleAndOrg(permissionData.module, orgId);
    if (existing) {
      throw new ApiError(409, `Permission module '${permissionData.module}' already exists`);
    }
    return await PermissionRepository.create(permissionData);
  }

  static async getAllPermissions() {
    return await PermissionRepository.findAll();
  }

  static async getPermissionById(id) {
    const permission = await PermissionRepository.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission module not found');
    }
    return permission;
  }

  static async updatePermission(id, updateData) {
    const permission = await PermissionRepository.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission module not found');
    }

    if (updateData.module) {
      const orgId = updateData.organization !== undefined ? updateData.organization : (permission.organization || null);
      const existing = await PermissionRepository.findByModuleAndOrg(updateData.module, orgId);
      if (existing && existing._id.toString() !== id) {
        throw new ApiError(409, `Permission module '${updateData.module}' already exists`);
      }
    }

    return await PermissionRepository.update(id, updateData);
  }

  static async deletePermission(id) {
    const permission = await PermissionRepository.findById(id);
    if (!permission) {
      throw new ApiError(404, 'Permission module not found');
    }
    return await PermissionRepository.delete(id);
  }
}

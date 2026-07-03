import { RoleRepository } from '../repositories/role.repository.js';
import { ApiError } from '../utils/ApiError.js';

export class RoleService {
  static async createRole(roleData) {
    const orgId = roleData.organization || null;
    const existing = await RoleRepository.findByNameAndOrg(roleData.name, orgId);
    if (existing) {
      throw new ApiError(409, `Role '${roleData.name}' already exists`);
    }

    return await RoleRepository.create(roleData);
  }

  static async getAllRoles() {
    return await RoleRepository.findAll();
  }

  static async getRoleById(id) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    return role;
  }

  static async updateRole(id, updateData) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // Prevent modifying SuperAdmin name to protect system integrity
    if (role.name === 'SuperAdmin' && updateData.name && updateData.name !== 'SuperAdmin') {
      throw new ApiError(400, 'Cannot change the name of the SuperAdmin role');
    }

    if (updateData.name) {
      const orgId = updateData.organization !== undefined ? updateData.organization : (role.organization || null);
      const existing = await RoleRepository.findByNameAndOrg(updateData.name, orgId);
      if (existing && existing._id.toString() !== id) {
        throw new ApiError(409, `Role '${updateData.name}' already exists`);
      }
    }

    return await RoleRepository.update(id, updateData);
  }

  static async deleteRole(id) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // Prevent deleting default SuperAdmin role
    if (role.name === 'SuperAdmin') {
      throw new ApiError(400, 'Cannot delete the SuperAdmin role');
    }

    return await RoleRepository.delete(id);
  }

  static async assignPermissions(id, permissions) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    return await RoleRepository.update(id, { permissions });
  }
}

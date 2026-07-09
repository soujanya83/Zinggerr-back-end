import { UserRepository } from '../repositories/user.repository.js';
import { User } from '../models/user.model.js';
import { AuthHelper } from '../utils/auth.js';
import { ApiError } from '../utils/ApiError.js';

export class UserService {
  static async createUser(userData, loggedInUserOrgId) {
    const orgId = userData.organization || loggedInUserOrgId;
    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required');
    }

    userData.organization = orgId;

    // Validate that the role is associated with this organization
    const { Role } = await import('../models/role.model.js');
    const roleObj = await Role.findById(userData.role);
    if (!roleObj) {
      throw new ApiError(404, 'Role not found');
    }

    if (roleObj.organization.toString() !== orgId.toString()) {
      throw new ApiError(400, 'Selected role is not associated with this organization');
    }

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    userData.password = await AuthHelper.hashPassword(userData.password);

    // Create user (our UserRepository.create automatically sets organizations list)
    const newUser = await UserRepository.create(userData);
    return newUser;
  }

  static async getUsers({ search, gender, status, role, organization }, loggedInUserOrgId) {
    const orgId = organization || loggedInUserOrgId;
    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required');
    }

    const filter = {
      $or: [
        { organization: orgId },
        { organizations: orgId }
      ]
    };

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { firstname: searchRegex },
          { lastname: searchRegex },
          { email: searchRegex },
          { contactNumber: searchRegex }
        ]
      });
    }

    if (gender) {
      filter.gender = gender;
    }

    if (status) {
      filter.status = status;
    }

    if (role) {
      filter.role = role;
    }

    // Exclude users with SuperAdmin role
    const { Role } = await import('../models/role.model.js');
    const superAdminRoles = await Role.find({ name: 'SuperAdmin', organization: orgId });
    const superAdminRoleIds = superAdminRoles.map(r => r._id);

    if (superAdminRoleIds.length > 0) {
      filter.role = filter.role ? { $eq: filter.role, $nin: superAdminRoleIds } : { $nin: superAdminRoleIds };
    }

    return await User.find(filter).populate('role').populate('organization');
  }

  static async getUserById(userId, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId, ['role', 'organization']);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    return user;
  }

  static async updateUser(userId, updateData, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const orgId = updateData.organization || user.organization || loggedInUserOrgId;
    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    // Validate role if updated
    if (updateData.role) {
      const { Role } = await import('../models/role.model.js');
      const roleObj = await Role.findById(updateData.role);
      if (!roleObj) {
        throw new ApiError(404, 'Role not found');
      }
      if (roleObj.organization.toString() !== orgId.toString()) {
        throw new ApiError(400, 'Selected role is not associated with this organization');
      }
    }

    // Hash password if updated
    if (updateData.password) {
      updateData.password = await AuthHelper.hashPassword(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate('role')
      .populate('organization');

    return updatedUser;
  }

  static async deleteUser(userId, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    await User.findByIdAndDelete(userId);
    return true;
  }

  static async toggleUserStatus(userId, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const { User: UserModel } = await import('../models/user.model.js');
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { status: newStatus },
      { new: true }
    ).populate('role').populate('organization');

    return updatedUser;
  }

  static async assignPermissions(userId, permissions, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    return await UserRepository.updateExtraPermissions(userId, permissions);
  }
}

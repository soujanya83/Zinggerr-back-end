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

    userData.selectedOrganization = orgId;

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

  static async getUsers({ search, gender, status, role, organization, page, limit }, loggedInUserOrgId) {
    const orgId = organization || loggedInUserOrgId;
    if (!orgId) {
      throw new ApiError(400, 'Organization ID is required');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      $or: [
        { selectedOrganization: orgId },
        { organizations: orgId }
      ]
    };

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { firstname: searchRegex },
          { middlename: searchRegex },
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

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('role')
      .populate('selectedOrganization')
      .skip(skip)
      .limit(limitNum);

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  static async getUserById(userId, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId, ['role', 'selectedOrganization']);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.selectedOrganization || user.selectedOrganization.toString() !== loggedInUserOrgId.toString())
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

    const orgId = updateData.organization || user.selectedOrganization || loggedInUserOrgId;
    if (
      loggedInUserOrgId &&
      (!user.selectedOrganization || user.selectedOrganization.toString() !== loggedInUserOrgId.toString())
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

    // Map organization parameter if sent explicitly
    if (updateData.organization) {
      updateData.selectedOrganization = updateData.organization;
      delete updateData.organization;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate('role')
      .populate('selectedOrganization');

    return updatedUser;
  }

  static async deleteUser(userId, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.selectedOrganization || user.selectedOrganization.toString() !== loggedInUserOrgId.toString())
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
      (!user.selectedOrganization || user.selectedOrganization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const { User: UserModel } = await import('../models/user.model.js');
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { status: newStatus },
      { new: true }
    ).populate('role').populate('selectedOrganization');

    return updatedUser;
  }

  static async assignPermissions(userId, permissions, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (
      loggedInUserOrgId &&
      (!user.selectedOrganization || user.selectedOrganization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    return await UserRepository.updateExtraPermissions(userId, permissions);
  }

  static async getMergedPermissions(userId) {
    const user = await User.findById(userId).populate('role');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const rolePermissions = user.role?.permissions || [];
    const extraPermissions = user.extraPermissions || [];
    const permissions = [...new Set([...rolePermissions, ...extraPermissions])];
    return permissions;
  }

  static async getAssociatedOrganizations(userId) {
    const user = await User.findById(userId).populate('organizations');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.organizations || [];
  }
}

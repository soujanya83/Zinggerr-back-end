import { User } from '../models/user.model.js';

export class UserRepository {
  static async findByEmail(email, selectPassword = false) {
    let query = User.findOne({ email });
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query;
  }

  static async findById(id, populateFields = [], selectRefreshToken = false, selectPassword = false) {
    let query = User.findById(id);
    populateFields.forEach((field) => {
      query = query.populate(field);
    });
    if (selectRefreshToken) {
      query = query.select('+refreshToken');
    }
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query;
  }

  static async create(userData) {
    return await User.create(userData);
  }

  static async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  static async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }

  static async associateOrganizationAndRole(userId, organizationId, roleId) {
    const user = await User.findById(userId);
    const hasSelected = !!user?.selectedOrganization;
    const updateObj = {
      organization: organizationId,
      role: roleId,
      $addToSet: { organizations: organizationId }
    };
    if (!hasSelected) {
      updateObj.selectedOrganization = organizationId;
    }
    return await User.findByIdAndUpdate(
      userId,
      updateObj,
      { new: true }
    );
  }

  static async updateExtraPermissions(userId, extraPermissions) {
    return await User.findByIdAndUpdate(
      userId,
      { extraPermissions },
      { new: true }
    ).select('-password -refreshToken');
  }
}

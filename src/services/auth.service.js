import { UserRepository } from '../repositories/user.repository.js';
import { RoleRepository } from '../repositories/role.repository.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';
import { AuthHelper } from '../utils/auth.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  static async signup({ firstname, lastname, email, contactNumber, password, userType, gender }) {
    // Check if email already exists
    const existedUser = await UserRepository.findByEmail(email);
    if (existedUser) {
      throw new ApiError(409, 'User with email already exists');
    }

    // Hash password using AuthHelper
    const hashedPassword = await AuthHelper.hashPassword(password);

    // Find or create global SuperAdmin role
    let superAdminRole = await RoleRepository.findByNameAndOrg('SuperAdmin', null);
    if (!superAdminRole) {
      superAdminRole = await RoleRepository.create({
        name: 'SuperAdmin',
        description: 'Super administrator',
        permissions: [],
        organization: null,
      });
    }

    // Create user
    const user = await UserRepository.create({
      firstname,
      lastname,
      email,
      contactNumber,
      password: hashedPassword,
      userType,
      gender,
      role: superAdminRole._id,
    });

    const createdUser = await UserRepository.findById(user._id);
    if (!createdUser) {
      throw new ApiError(500, 'Something went wrong while registering the user');
    }

    // Generate tokens using AuthHelper
    const accessToken = AuthHelper.generateAccessToken(createdUser);
    const refreshToken = AuthHelper.generateRefreshToken(createdUser);

    // Save refresh token to DB
    await UserRepository.updateRefreshToken(createdUser._id, refreshToken);

    return { user: createdUser, accessToken, refreshToken };
  }

  static async signin({ email, password }) {
    // Find user (selecting password field)
    const user = await UserRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(404, 'User does not exist');
    }

    // Verify password using AuthHelper
    const isPasswordValid = await AuthHelper.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid user credentials');
    }

    // Generate tokens using AuthHelper
    const accessToken = AuthHelper.generateAccessToken(user);
    const refreshToken = AuthHelper.generateRefreshToken(user);

    // Save refresh token to DB
    await UserRepository.updateRefreshToken(user._id, refreshToken);

    const loggedInUser = await UserRepository.findById(user._id, ['role', 'organization']);

    return { user: loggedInUser, accessToken, refreshToken };
  }

  static async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized request');
    }

    try {
      const decodedToken = AuthHelper.verifyRefreshToken(incomingRefreshToken);
      const user = await UserRepository.findById(decodedToken._id);

      if (!user) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, 'Refresh token is expired or used');
      }

      const accessToken = AuthHelper.generateAccessToken(user);
      const newRefreshToken = AuthHelper.generateRefreshToken(user);

      await UserRepository.updateRefreshToken(user._id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
  }

  static async logout(userId) {
    await UserRepository.clearRefreshToken(userId);
  }

  static async onboardOrganization(userId, { name, streetAddress, city, state, postalCode }, logoFilename) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.userType !== 'organization') {
      throw new ApiError(400, 'Only organization type users can onboard an organization');
    }

    if (user.organization) {
      throw new ApiError(400, 'User is already associated with an organization');
    }

    const logoUrl = logoFilename ? `/uploads/${logoFilename}` : '';

    // Create organization
    const organization = await OrganizationRepository.create({
      name,
      logo: logoUrl,
      streetAddress,
      city,
      state,
      postalCode,
    });

    // Create organization-specific SuperAdmin role 
    let orgSuperAdminRole = await RoleRepository.findByNameAndOrg('SuperAdmin', organization._id);
    if (!orgSuperAdminRole) {
      orgSuperAdminRole = await RoleRepository.create({
        name: 'SuperAdmin',
        description: `Super administrator for ${organization.name}`,
        permissions: [],
        organization: organization._id,
      });
    }

    // Associate user with organization and organization-specific role
    await UserRepository.associateOrganizationAndRole(user._id, organization._id, orgSuperAdminRole._id);

    const updatedUser = await UserRepository.findById(user._id, ['role', 'organization']);
    return updatedUser;
  }
}

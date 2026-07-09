import { UserRepository } from '../repositories/user.repository.js';
import { RoleRepository } from '../repositories/role.repository.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';
import { AuthHelper } from '../utils/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { SessionService } from './session.service.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AuditService } from './audit.service.js';
import { User } from '../models/user.model.js';

export class AuthService {
  static async signup({ firstname, lastname, email, contactNumber, password, userType, gender }, clientInfo = {}) {
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

    const createdUser = await UserRepository.findById(user._id, ['role', 'organizations']);
    if (!createdUser) {
      throw new ApiError(500, 'Something went wrong while registering the user');
    }
    console.log("Client Info : ", clientInfo);
    // Create session (by default rememberMe = false for signup, or can be passed)
    const rememberMe = !!clientInfo.rememberMe;
    const { sessionId, accessToken, refreshToken } = await SessionService.createSession(
      createdUser._id,
      rememberMe,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );

    // Log security event
    await AuditService.logEvent(createdUser._id, sessionId, 'LOGIN', clientInfo.ipAddress, clientInfo.userAgent, {
      action: 'SIGNUP_LOGIN',
    });

    return { user: createdUser, accessToken, refreshToken };
  }

  static async signin({ email, password, rememberMe }, clientInfo = {}) {
    // Find user (selecting password field)
    const user = await UserRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(404, 'User does not exist');
    }

    // Verify password using AuthHelper
    const isPasswordValid = await AuthHelper.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed login
      await AuditService.logEvent(user._id, null, 'FAILED_LOGIN', clientInfo.ipAddress, clientInfo.userAgent, {
        email,
      });
      throw new ApiError(401, 'Invalid user credentials');
    }

    // Create session using SessionService
    const { sessionId, accessToken, refreshToken } = await SessionService.createSession(
      user._id,
      !!rememberMe,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );

    // Log success login
    await AuditService.logEvent(user._id, sessionId, 'LOGIN', clientInfo.ipAddress, clientInfo.userAgent);

    const loggedInUser = await UserRepository.findById(user._id, ['role', 'organizations']);

    return { user: loggedInUser, accessToken, refreshToken };
  }

  static async refreshAccessToken(incomingRefreshToken, clientInfo = {}) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized request');
    }

    try {
      const decodedToken = AuthHelper.verifyRefreshToken(incomingRefreshToken);
      // Validate session and rotate refresh token using SessionService
      const { accessToken, refreshToken, rememberMe } = await SessionService.rotateRefreshToken(
        decodedToken.sessionId,
        incomingRefreshToken,
        clientInfo.ipAddress,
        clientInfo.userAgent
      );

      // Log token refresh in audit trail
      await AuditService.logEvent(decodedToken._id, decodedToken.sessionId, 'REFRESH', clientInfo.ipAddress, clientInfo.userAgent);

      return { accessToken, refreshToken, rememberMe };
    } catch (error) {
      throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
  }

  static async logout(incomingRefreshToken, ipAddress, userAgent) {
    if (!incomingRefreshToken) {
      return;
    }
    try {
      const decodedToken = AuthHelper.verifyRefreshToken(incomingRefreshToken);
      // Soft revoke the session
      await SessionRepository.revokeSession(decodedToken.sessionId, 'LOGOUT');
      await AuditService.logEvent(decodedToken._id, decodedToken.sessionId, 'LOGOUT', ipAddress, userAgent);
    } catch (error) {
      console.error('[AuthService] Logout token verification failed:', error.message);
    }
  }

  static async changePassword(userId, currentSessionId, { oldPassword, newPassword, confirmNewPassword }, clientInfo = {}) {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      throw new ApiError(400, 'All fields (oldPassword, newPassword, confirmNewPassword) are required');
    }

    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, 'New password and confirm password do not match');
    }

    // Fetch user selecting password
    const user = await UserRepository.findById(userId, [], false, true);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify old password
    const isPasswordValid = await AuthHelper.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid current password');
    }

    // Prevent reuse of old password
    if (oldPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from current password');
    }

    // Update password
    const hashedPassword = await AuthHelper.hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Handle session revocation policy
    const policy = process.env.PASSWORD_CHANGE_POLICY || 'POLICY_A';
    if (policy === 'POLICY_A') {
      // Revoke all other sessions except current
      await SessionRepository.revokeAllSessions(userId, 'PASSWORD_CHANGED', currentSessionId);
      await AuditService.logEvent(userId, currentSessionId, 'PASSWORD_CHANGED', clientInfo.ipAddress, clientInfo.userAgent, {
        policyUsed: policy,
        action: 'REVOKE_ALL_EXCEPT_CURRENT',
      });
    } else {
      // POLICY_B: Revoke all sessions including current
      await SessionRepository.revokeAllSessions(userId, 'PASSWORD_CHANGED');
      await AuditService.logEvent(userId, currentSessionId, 'PASSWORD_CHANGED', clientInfo.ipAddress, clientInfo.userAgent, {
        policyUsed: policy,
        action: 'REVOKE_ALL',
      });
    }
  }

  static async onboardOrganization(userId, { name, streetAddress, city, state, postalCode }, logoFilename) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.userType !== 'organization') {
      throw new ApiError(400, 'Only organization type users can onboard an organization');
    }

    // if (user.organization) {
    //   throw new ApiError(400, 'User is already associated with an organization');
    // }

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

    const updatedUser = await UserRepository.findById(user._id, ['role', 'organizations', 'selectedOrganization']);
    return updatedUser;
  }

  static async updateProfile(userId, { firstname, lastname, avatar, gender, email, contactNumber, password }) {
    const user = await UserRepository.findById(userId, [], false, true);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await AuthHelper.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid password: password is required to save profile changes');
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await UserRepository.findByEmail(email.toLowerCase());
      if (emailExists) {
        throw new ApiError(409, 'Email is already in use by another user');
      }
      user.email = email.toLowerCase();
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.gender = gender || user.gender;
    user.contactNumber = contactNumber || user.contactNumber;

    await user.save();

    const updatedUser = await UserRepository.findById(userId, ['role', 'organizations', 'selectedOrganization']);
    return updatedUser;
  }
}

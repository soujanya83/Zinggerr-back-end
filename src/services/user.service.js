import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

export class UserService {
  static async assignPermissions(userId, permissions, loggedInUserOrgId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Access check: If the logged-in user belongs to an organization,
    // they can only assign permissions to a user within the same organization.
    if (
      loggedInUserOrgId &&
      (!user.organization || user.organization.toString() !== loggedInUserOrgId.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You do not have access to this user');
    }

    return await UserRepository.updateExtraPermissions(userId, permissions);
  }
}

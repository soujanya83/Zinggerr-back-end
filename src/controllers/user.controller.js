import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class UserController {
  static assignPermissions = async (req, res, next) => {
    try {
      const orgId = req.user.organization;
      const { permissions } = req.body;
      const user = await UserService.assignPermissions(req.params.id, permissions, orgId);
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User permissions updated successfully'));
    } catch (error) {
      next(error);
    }
  };
}

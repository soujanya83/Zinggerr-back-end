import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export class UserController {
  static createUser = async (req, res, next) => {
    try {
      const organizationId = req.body.organization || req.user.selectedOrganization;
      if (!organizationId) {
        throw new ApiError(400, 'Organization ID is required');
      }
      const user = await UserService.createUser(req.body, organizationId);
      return res
        .status(201)
        .json(new ApiResponse(201, { user }, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getUsers = async (req, res, next) => {
    try {
      const organizationId = req.query.organization || req.user.selectedOrganization;
      if (!organizationId) {
        throw new ApiError(400, 'Organization ID is required');
      }
      const { search, gender, status, role, page, limit } = req.query;
      const { users, pagination } = await UserService.getUsers(
        { search, gender, status, role, organization: organizationId, page, limit },
        organizationId
      );
      return res
        .status(200)
        .json(new ApiResponse(200, { users, pagination }, 'Users retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getUserById = async (req, res, next) => {
    try {
      const organizationId = req.query.organization || req.body.organization || req.user.selectedOrganization;
      const user = await UserService.getUserById(req.params.id, organizationId);
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateUser = async (req, res, next) => {
    try {
      const organizationId = req.body.organization || req.user.selectedOrganization;
      const user = await UserService.updateUser(req.params.id, req.body, organizationId);
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteUser = async (req, res, next) => {
    try {
      const organizationId = req.body.organization || req.query.organization || req.user.selectedOrganization;
      await UserService.deleteUser(req.params.id, organizationId);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  static toggleUserStatus = async (req, res, next) => {
    try {
      const organizationId = req.body.organization || req.query.organization || req.user.selectedOrganization;
      const user = await UserService.toggleUserStatus(req.params.id, organizationId);
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User status toggled successfully'));
    } catch (error) {
      next(error);
    }
  };

  static assignPermissions = async (req, res, next) => {
    try {
      const orgId = req.user.selectedOrganization;
      const { permissions } = req.body;
      const user = await UserService.assignPermissions(req.params.id, permissions, orgId);
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User permissions updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getMergedPermissions = async (req, res, next) => {
    try {
      const permissions = await UserService.getMergedPermissions(req.user._id);
      return res
        .status(200)
        .json(new ApiResponse(200, { permissions }, 'User permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getAssociatedOrganizations = async (req, res, next) => {
    try {
      const organizations = await UserService.getAssociatedOrganizations(req.user._id);
      return res
        .status(200)
        .json(new ApiResponse(200, { organizations }, 'User organizations retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}

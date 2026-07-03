import { RoleService } from '../services/role.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class RoleController {
  static createRole = async (req, res, next) => {
    try {
      const role = await RoleService.createRole(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, { role }, 'Role created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getAllRoles = async (req, res, next) => {
    try {
      const roles = await RoleService.getAllRoles();
      return res
        .status(200)
        .json(new ApiResponse(200, { roles }, 'Roles retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getRoleById = async (req, res, next) => {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, { role }, 'Role retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateRole = async (req, res, next) => {
    try {
      const role = await RoleService.updateRole(req.params.id, req.body);
      return res
        .status(200)
        .json(new ApiResponse(200, { role }, 'Role updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteRole = async (req, res, next) => {
    try {
      await RoleService.deleteRole(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Role deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  static assignPermissions = async (req, res, next) => {
    try {
      const { permissions } = req.body;
      const role = await RoleService.assignPermissions(req.params.id, permissions);
      return res
        .status(200)
        .json(new ApiResponse(200, { role }, 'Role permissions updated successfully'));
    } catch (error) {
      next(error);
    }
  };
}

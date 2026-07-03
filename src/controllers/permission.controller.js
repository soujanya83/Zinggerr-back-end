import { PermissionService } from '../services/permission.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class PermissionController {
  static createPermission = async (req, res, next) => {
    try {
      const permission = await PermissionService.createPermission(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, { permission }, 'Permission module created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getAllPermissions = async (req, res, next) => {
    try {
      const permissions = await PermissionService.getAllPermissions();
      return res
        .status(200)
        .json(new ApiResponse(200, { permissions }, 'Permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getPermissionById = async (req, res, next) => {
    try {
      const permission = await PermissionService.getPermissionById(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, { permission }, 'Permission retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updatePermission = async (req, res, next) => {
    try {
      const permission = await PermissionService.updatePermission(req.params.id, req.body);
      return res
        .status(200)
        .json(new ApiResponse(200, { permission }, 'Permission updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deletePermission = async (req, res, next) => {
    try {
      await PermissionService.deletePermission(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Permission deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}

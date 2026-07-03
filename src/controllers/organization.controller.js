import { OrganizationService } from '../services/organization.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class OrganizationController {
  static createOrganization = async (req, res, next) => {
    try {
      const logoFilename = req.file ? req.file.filename : null;
      const organization = await OrganizationService.createOrganization(req.body, logoFilename);
      return res
        .status(201)
        .json(new ApiResponse(201, { organization }, 'Organization created successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getAllOrganizations = async (req, res, next) => {
    try {
      const organizations = await OrganizationService.getAllOrganizations();
      return res
        .status(200)
        .json(new ApiResponse(200, { organizations }, 'Organizations retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static getOrganizationById = async (req, res, next) => {
    try {
      const organization = await OrganizationService.getOrganizationById(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, { organization }, 'Organization retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  static updateOrganization = async (req, res, next) => {
    try {
      const logoFilename = req.file ? req.file.filename : null;
      const organization = await OrganizationService.updateOrganization(req.params.id, req.body, logoFilename);
      return res
        .status(200)
        .json(new ApiResponse(200, { organization }, 'Organization updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  static deleteOrganization = async (req, res, next) => {
    try {
      await OrganizationService.deleteOrganization(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Organization deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}

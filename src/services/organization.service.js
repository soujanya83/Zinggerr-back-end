import { OrganizationRepository } from '../repositories/organization.repository.js';
import { ApiError } from '../utils/ApiError.js';

export class OrganizationService {
  static async createOrganization(orgData, logoFilename) {
    if (logoFilename) {
      orgData.logo = `/uploads/${logoFilename}`;
    }
    return await OrganizationRepository.create(orgData);
  }

  static async getAllOrganizations() {
    return await OrganizationRepository.findAll();
  }

  static async getOrganizationById(id) {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new ApiError(404, 'Organization not found');
    }
    return org;
  }

  static async updateOrganization(id, updateData, logoFilename) {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new ApiError(404, 'Organization not found');
    }

    if (logoFilename) {
      updateData.logo = `/uploads/${logoFilename}`;
    }

    return await OrganizationRepository.update(id, updateData);
  }

  static async deleteOrganization(id) {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new ApiError(404, 'Organization not found');
    }
    return await OrganizationRepository.delete(id);
  }
}

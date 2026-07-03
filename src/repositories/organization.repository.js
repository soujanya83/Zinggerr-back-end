import { Organization } from '../models/organization.model.js';

export class OrganizationRepository {
  static async create(orgData) {
    return await Organization.create(orgData);
  }
}

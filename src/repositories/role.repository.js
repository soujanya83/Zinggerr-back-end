import { Role } from '../models/role.model.js';

export class RoleRepository {
  static async findByNameAndOrg(name, organizationId = null) {
    return await Role.findOne({ name, organization: organizationId });
  }

  static async create(roleData) {
    return await Role.create(roleData);
  }
}

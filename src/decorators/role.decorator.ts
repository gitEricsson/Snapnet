import { SetMetadata } from '@nestjs/common';
import { Role } from '../utils/common/constant/enum.constant';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => {
  // Ensure all roles are valid enum values
  const validRoles = roles.filter(role => Object.values(Role).includes(role));
  return SetMetadata(ROLES_KEY, validRoles);
};

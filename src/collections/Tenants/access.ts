import { Access } from 'payload';

import { getUserTenantIDs } from '@/utilities/get-user-tenant-ids';
import { isSuperAdmin } from '@/utilities/is-super-admin';

// Only super admins can create tenants
export const createAccess: Access = ({ req }) => {
  return isSuperAdmin(req.user);
};

// Anyone with a user can read tenants
export const readAccess: Access = ({ req }) => {
  return Boolean(req.user);
};

// Only super admins and tenant admins can update tenants
export const updateAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  return {
    id: {
      in: getUserTenantIDs(req.user, 'tenant-admin'),
    },
  };
};

// Only super admins and tenant admins can delete tenants
export const deleteAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  return {
    id: {
      in: getUserTenantIDs(req.user, 'tenant-admin'),
    },
  };
};

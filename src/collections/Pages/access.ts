import { Access } from 'payload';

import { getUserTenantIDs } from '@/utilities/get-user-tenant-ids';
import { isSuperAdmin } from '@/utilities/is-super-admin';

// Only super admins and tenant admins can create pages
export const createAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  return {
    tenant: {
      in: getUserTenantIDs(req.user, 'tenant-admin'),
    },
  };
};

// Anyone can read pages
export const readAccess: Access = () => {
  return true;
};

// Only super admins and tenant admins can update pages
export const updateAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  return {
    tenant: {
      in: getUserTenantIDs(req.user, 'tenant-admin'),
    },
  };
};

// Only super admins and tenant admins can delete pages
export const deleteAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  return {
    tenant: {
      in: getUserTenantIDs(req.user, 'tenant-admin'),
    },
  };
};

import type { Access, Where } from 'payload';

import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities';

import type { User } from '@payload-types';

import { getCollectionIDType } from '@/utilities/get-collection-id-type';
import { getUserTenantIDs } from '@/utilities/get-user-tenant-ids';
import { isAccessingSelf } from '@/utilities/is-accessing-self';
import { isSuperAdmin } from '@/utilities/is-super-admin';

// Only super admins and tenant admins can create users
export const createAccess: Access<User> = ({ req }) => {
  if (!req.user) {
    return false;
  }

  if (isSuperAdmin(req.user)) {
    return true;
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin');

  if (adminTenantAccessIDs.length) {
    return true;
  }

  return false;
};

export const readAccess: Access<User> = ({ req, id }) => {
  if (!req?.user) {
    return false;
  }

  if (isAccessingSelf({ id, user: req.user })) {
    return true;
  }

  const superAdmin = isSuperAdmin(req.user);
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' })
  );
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin');

  if (selectedTenant) {
    // If it's a super admin, or they have access to the tenant ID set in cookie
    const hasTenantAccess = adminTenantAccessIDs.some(
      (id) => id === selectedTenant
    );
    if (superAdmin || hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      };
    }
  }

  if (superAdmin) {
    return true;
  }

  return {
    or: [
      {
        id: {
          equals: req.user.id,
        },
      },
      {
        'tenants.tenant': {
          in: adminTenantAccessIDs,
        },
      },
    ],
  } as Where;
};

// Only super admins and tenant admins can update users
// The user can also update their own profile
export const updateAccess: Access = ({ req, id }) => {
  const { user } = req;

  if (!user) {
    return false;
  }

  if (isSuperAdmin(user) || isAccessingSelf({ user, id })) {
    return true;
  }

  /**
   * Constrains update access to users that belong
   * to the same tenant as the tenant-admin making the request
   *
   * You may want to take this a step further with a beforeChange
   * hook to ensure that the a tenant-admin can only remove users
   * from their own tenant in the tenants array.
   */
  return {
    'tenants.tenant': {
      in: getUserTenantIDs(user, 'tenant-admin'),
    },
  };
};

// Only super admins and tenant admins can delete users
// The user can also delete their own profile
export const deleteAccess: Access = ({ req, id }) => {
  const { user } = req;

  if (!user) {
    return false;
  }

  if (isSuperAdmin(user) || isAccessingSelf({ user, id })) {
    return true;
  }

  /**
   * Constrains delete access to users that belong
   * to the same tenant as the tenant-admin making the request
   *
   * You may want to take this a step further with a beforeChange
   * hook to ensure that the a tenant-admin can only remove users
   * from their own tenant in the tenants array.
   */
  return {
    'tenants.tenant': {
      in: getUserTenantIDs(user, 'tenant-admin'),
    },
  };
};

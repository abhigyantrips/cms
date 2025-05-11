import { seed } from '@/seed';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildConfig } from 'payload';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

import type { Config } from '@payload-types';

import { isSuperAdmin } from '@/lib/is-super-admin';

import { getUserTenantIDs } from '@/utilities/getUserTenantIDs';

import { Pages } from '@/collections/Pages';
import { Tenants } from '@/collections/Tenants';
import Users from '@/collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [Pages, Users, Tenants],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  onInit: async (args) => {
    if (process.env.SEED_DB) {
      await seed(args);
    }
  },
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'types', 'payload.ts'),
  },
  plugins: [
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true;
            }
            return getUserTenantIDs(req.user).length > 0;
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
});

import type { CollectionConfig } from 'payload';

import {
  createAccess,
  deleteAccess,
  readAccess,
  updateAccess,
} from '@/collections/pages/access';
import { ensureUniqueSlug } from '@/collections/pages/hooks';

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: createAccess,
    delete: deleteAccess,
    read: readAccess,
    update: updateAccess,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      defaultValue: 'home',
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
      index: true,
    },
  ],
};

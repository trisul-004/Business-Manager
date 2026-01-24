
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const sites = pgTable('sites', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteManagers = pgTable('site_managers', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sites.id).notNull(),
  userId: text('user_id').notNull(), // Clerk User ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').references(() => sites.id).notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // Job title e.g. "Security Guard", "Cleaner"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { pgTable, text, uuid, timestamp, date, uniqueIndex } from 'drizzle-orm/pg-core';

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

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  date: date('date').notNull(), // The day this attendance is for
  status: text('status').notNull(), // e.g., 'present', 'absent'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  onePerDay: uniqueIndex('one_per_day_idx').on(table.employeeId, table.date),
}));

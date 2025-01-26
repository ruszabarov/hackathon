// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hackathon_${name}`);

export const emails = createTable(
  "emails",
  {
    emailId: integer("email_id").primaryKey().generatedByDefaultAsIdentity(),
    sender: varchar("sender", { length: 256 }),
    summary: varchar("summary"),
    priority: integer("priority"),
    title: varchar("title", { length: 256 }),
    email_time: timestamp("email_time", { withTimezone: true }),
    originalContent: varchar("originalContent"),
    replied: varchar("replied", { length: 3 }).default("No"),
  },
  (example) => ({
    priorityIndex: index("priority_idx").on(example.priority),
  }),
);

export const preference = createTable(
  "preference",
  {
    summary: varchar("summary", { length: 256 }),
  },
);


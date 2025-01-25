// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
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
    summary: varchar("summary", { length: 512 }),
    priority: integer("priority"),
    title: varchar("title", { length: 256 }),
    email_time: timestamp("email_time", { withTimezone: true }),
    originalContent: varchar("originalContent", { length: 512 }),
  },
  (example) => ({
    priorityIndex: index("priority_idx").on(example.priority),
  })
);

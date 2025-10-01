import { pgTable, text, char, integer } from "drizzle-orm/pg-core";
import {user, organization} from "./auth-schema";

export const userProfile = pgTable("userProfile", {
  id: text("id").notNull().references(() => user.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("lastName").notNull(),
  bio: text("bio"),
  phoneNumber: text("phoneNumber").unique(),
  timeZone: text("timeZone"),
  language: char({ length: 2 }),
  age: integer(),
});

export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  code: text("code").notNull(),
});

export const rolePermissions = pgTable("rolePermissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
});


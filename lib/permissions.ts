import { db } from "./db"
import { eq, and } from "drizzle-orm"
import { member } from "./db/schemas/auth-schema"
import { roles, rolePermissions, permissions } from "./db/schemas/user-schema"

export const PERMISSIONS = {
  INVITE_MEMBERS: "invite_members",
  MANAGE_MEMBERS: "manage_members",
  MANAGE_ROLES: "manage_roles",
  DELETE_ORGANIZATION: "delete_organization",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Check if a user has a specific permission in an organization
 */
export async function hasPermission(
  userId: string,
  organizationId: string,
  permissionCode: Permission,
): Promise<boolean> {
  try {
    const membership = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
      .limit(1)

    if (!membership.length) {
      return false
    }

    const userRole = membership[0].role

    const roleRecord = await db
      .select()
      .from(roles)
      .where(and(eq(roles.name, userRole), eq(roles.organizationId, organizationId)))
      .limit(1)

    if (!roleRecord.length) {
      return false
    }

    const hasPermissionRecord = await db
      .select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(eq(rolePermissions.roleId, roleRecord[0].id), eq(permissions.code, permissionCode)))
      .limit(1)

    return hasPermissionRecord.length > 0
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * Get all permissions for a user in an organization
 */
export async function getUserPermissions(userId: string, organizationId: string): Promise<string[]> {
  try {
    const membership = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
      .limit(1)

    if (!membership.length) {
      return []
    }

    const userRole = membership[0].role

    const roleRecord = await db
      .select()
      .from(roles)
      .where(and(eq(roles.name, userRole), eq(roles.organizationId, organizationId)))
      .limit(1)

    if (!roleRecord.length) {
      return []
    }

    const userPermissions = await db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleRecord[0].id))

    return userPermissions.map((p) => p.code)
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return []
  }
}

import { db } from "@/db";
import { adminActivities } from "@/db/schema/audit";
import { getCurrentUser } from "@/lib/auth/helpers";
import { isDatabaseConfigured } from "@/lib/utils";

export type LogAdminActivityParams = {
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown>;
  adminId?: string;
};

export async function logAdminActivity(
  actionOrParams: string | LogAdminActivityParams,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
  explicitAdminId?: string
) {
  if (!isDatabaseConfigured()) return;

  try {
    let action: string;
    let finalEntityType: string;
    let finalEntityId: string;
    let finalMetadata: Record<string, unknown>;
    let resolvedAdminId: string | null = null;

    if (typeof actionOrParams === "object") {
      action = actionOrParams.action;
      finalEntityType = actionOrParams.entityType;
      finalEntityId = actionOrParams.entityId;
      finalMetadata = actionOrParams.details || actionOrParams.metadata || {};
      resolvedAdminId = actionOrParams.adminId || null;
    } else {
      action = actionOrParams;
      finalEntityType = entityType || "unknown";
      finalEntityId = entityId || "unknown";
      finalMetadata = metadata;
      resolvedAdminId = explicitAdminId || null;
    }

    const isValidUuid = (val: string | null | undefined): boolean =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    if (!isValidUuid(resolvedAdminId)) {
      try {
        const user = await getCurrentUser();
        if (isValidUuid(user?.id)) {
          resolvedAdminId = user!.id;
        } else {
          resolvedAdminId = null;
        }
      } catch {
        resolvedAdminId = null;
      }
    }

    const id = `act_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    await db.insert(adminActivities).values({
      id,
      adminId: resolvedAdminId,
      action,
      entityType: finalEntityType,
      entityId: finalEntityId,
      metadata: finalMetadata,
    });
  } catch (err) {
    console.warn("Failed to write admin activity log:", err);
  }
}

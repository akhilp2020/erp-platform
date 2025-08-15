import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Request-scoped Prisma client that:
 *  - injects tenantId on writes
 *  - AND-scopes reads/aggregations by tenantId
 *  - guards update/delete-by-unique with tenantId in where
 *
 * Safe for dev; in prod, reuse a singleton and pass tenantId via
 * $transaction contexts or request-local storage.
 */
export function dbForTenant(tenantId: string) {
  const prisma = new PrismaClient();

  prisma.$use(async (params: Prisma.MiddlewareParams, next: Prisma.MiddlewareNext) => {
    // Some actions arrive without args
    // @ts-ignore
    if (params.args == null) params.args = {};

    const SCOPE_ACTIONS = new Set([
      'findFirst', 'findMany', 'updateMany', 'deleteMany',
      'count', 'aggregate', 'groupBy'
    ]);

    // Writes
    if (params.action === 'create') {
      // @ts-ignore
      params.args.data = { ...(params.args?.data ?? {}), tenantId };
    }
    if (params.action === 'createMany') {
      const arr = (params.args as any)?.data ?? [];
      (params.args as any).data = arr.map((d: any) => ({ ...d, tenantId }));
    }

    // Update/Delete by unique
    if (params.action === 'update' || params.action === 'delete') {
      const existing = (params.args as any).where ?? {};
      (params.args as any).where = { AND: [{ tenantId }, existing] };
    }

    // Reads/Aggregations
    if (SCOPE_ACTIONS.has(params.action as any)) {
      const existing = (params.args as any).where ?? {};
      (params.args as any).where = { AND: [{ tenantId }, existing] };
    }

    return next(params);
  });

  return prisma;
}
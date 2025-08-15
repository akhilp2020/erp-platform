import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Returns a Prisma client that is tenant-scoped.
 * Primary path: Prisma middleware via $use.
 * Fallback path: Proxy wrapper for tests/runtimes where $use isn't available.
 */
export function dbForTenant(tenantId: string) {
  const prisma = new PrismaClient() as any;

  // --- Primary: middleware ---
  if (typeof prisma.$use === 'function') {
    prisma.$use(async (params: Prisma.MiddlewareParams, next: Prisma.MiddlewareNext) => {
      if (!params.args) params.args = {};

      const SCOPE = new Set([
        'findFirst', 'findMany', 'updateMany', 'deleteMany', 'count', 'aggregate', 'groupBy',
      ]);

      // Writes
      if (params.action === 'create') {
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
      if (SCOPE.has(params.action as any)) {
        const existing = (params.args as any).where ?? {};
        (params.args as any).where = { AND: [{ tenantId }, existing] };
      }

      return next(params);
    });

    return prisma as PrismaClient;
  }

  // --- Fallback: proxy (for environments where $use is unavailable) ---
  const TENANT_MODELS = new Set([
    'customer','staff','service','appointment','ledger'
  ]);

  function wrapModel(model: any) {
    return new Proxy(model, {
      get(target, prop, receiver) {
        const fn = (target as any)[prop];
        if (typeof fn !== 'function') return Reflect.get(target, prop, receiver);

        return async (args: any = {}) => {
          const clone = { ...(args ?? {}) };

          // writes
          if (prop === 'create') {
            clone.data = { ...(clone.data ?? {}), tenantId };
          } else if (prop === 'createMany') {
            const arr = clone.data ?? [];
            clone.data = arr.map((d: any) => ({ ...d, tenantId }));
          }

          // reads/aggregations/unique ops
          const SCOPE_READ = new Set(['findFirst','findMany','count','aggregate','groupBy']);
          const SCOPE_UNIQUE = new Set(['update','delete']);

          if (SCOPE_READ.has(String(prop))) {
            clone.where = { AND: [{ tenantId }, clone.where ?? {}] };
          } else if (SCOPE_UNIQUE.has(String(prop))) {
            clone.where = { AND: [{ tenantId }, clone.where ?? {}] };
          }

          return (target as any)[prop](clone);
        };
      }
    });
  }

  return new Proxy(prisma, {
    get(target, prop, receiver) {
      if (TENANT_MODELS.has(String(prop))) {
        return wrapModel((target as any)[prop]);
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as PrismaClient;
}

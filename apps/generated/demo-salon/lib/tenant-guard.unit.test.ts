import { dbForTenant } from './db-tenant';

test('dbForTenant scopes reads/writes per tenant', async () => {
  const t1 = dbForTenant('t1');
  const t2 = dbForTenant('t2');
  try {
    await t1.customer.create({ data: { name: 'Alice' } });
    await t2.customer.create({ data: { name: 'Bob' } });

    const a1 = await t1.customer.count();
    const a2 = await t2.customer.count();
    expect(a1).toBeGreaterThan(0);
    expect(a2).toBeGreaterThan(0);

    const list1 = await t1.customer.findMany({ where: { name: 'Bob' } });
    const list2 = await t2.customer.findMany({ where: { name: 'Alice' } });
    expect(list1.length).toBe(0);
    expect(list2.length).toBe(0);
  } finally {
    await (t1 as any).$disconnect?.();
    await (t2 as any).$disconnect?.();
  }
});

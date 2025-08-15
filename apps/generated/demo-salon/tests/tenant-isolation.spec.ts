import { test, expect } from '@playwright/test';
test('customers are isolated by x-tenant-id', async ({ request }) => {
  const createA = await request.post('/api/customer', {
    headers: { 'x-tenant-id': 'tenantA' },
    data: { name: 'Alice A' }
  });
  expect(createA.ok()).toBeTruthy();
  const createB = await request.post('/api/customer', {
    headers: { 'x-tenant-id': 'tenantB' },
    data: { name: 'Bob B' }
  });
  expect(createB.ok()).toBeTruthy();

  const listA = await request.get('/api/customer', { headers: { 'x-tenant-id': 'tenantA' }});
  const arrA = await listA.json();
  expect(arrA.some((r: any) => r.name === 'Alice A')).toBe(true);
  expect(arrA.some((r: any) => r.name === 'Bob B')).toBe(false);

  const listB = await request.get('/api/customer', { headers: { 'x-tenant-id': 'tenantB' }});
  const arrB = await listB.json();
  expect(arrB.some((r: any) => r.name === 'Bob B')).toBe(true);
  expect(arrB.some((r: any) => r.name === 'Alice A')).toBe(false);
});

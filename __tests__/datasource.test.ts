import {expect, test} from '@jest/globals'

import {DataSource} from '../src/duplocloud/datasource'
import {DuploHttpClient} from '../src/duplocloud/httpclient'

test('DataSource: can get system features', async () => {
  const ds = new DataSource(new DuploHttpClient())
  const result = await ds.getSystemFeatures().toPromise()
  expect(result).not.toBeNull()
  expect(result.IsAwsCloudEnabled).toBeTruthy()
})

const tenantId = process.env.duplo_tenant_id
if (!tenantId) {
  console.log('Skipping datasource tests: duplo_tenant_id env var missing or empty')
} else {
  test('DataSource: can list tenants accessible to the user', async () => {
    const ds = new DataSource(new DuploHttpClient())
    const result = await ds.getTenantsForUser().toPromise()
    expect(result).not.toBeNull()
  })

  test('DataSource: can get default tenant', async () => {
    const ds = new DataSource(new DuploHttpClient())
    const result = await ds.getTenantByName('default').toPromise()
    expect(result).not.toBeNull()
  })

  test('DataSource: can get tenant with uppercase', async () => {
    const ds = new DataSource(new DuploHttpClient())
    const result = await ds.getTenantByName('DEFAULT').toPromise()
    expect(result).not.toBeNull()
    expect(result?.AccountName).toBe('default')

    const result2 = await ds.getTenant('DEFAULT').toPromise()
    expect(result2).not.toBeNull()
    expect(result2?.AccountName).toBe('default')
  })

  test('DataSource: can get tenant by name or ID', async () => {
    const ds = new DataSource(new DuploHttpClient())
    const result = await ds.getTenantByName('default').toPromise()
    expect(result?.TenantId).not.toBeNull()

    if (result?.TenantId) {
      const resultByName = await ds.getTenant('default').toPromise()
      expect(resultByName).toEqual(result)
      const resultById = await ds.getTenant(result.TenantId).toPromise()
      expect(resultById).toEqual(result)
    }
  })

  test('DataSource: can get AWS JIT creds for tenant', async () => {
    const ds = new DataSource(new DuploHttpClient())
    const result = await ds.getTenantAwsJitCredentials(tenantId).toPromise()
    expect(result).not.toBeNull()
    expect(result.Region).not.toBeNull()
    expect(result.AccessKeyId).not.toBeNull()
    expect(result.SecretAccessKey).not.toBeNull()
    expect(result.SessionToken).not.toBeNull()
  })
}

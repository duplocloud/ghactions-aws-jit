import {expect, test} from '@jest/globals'

import {DataSource} from '../../src/duplocloud/datasource'
import {DuploHttpClient} from '../../src/duplocloud/httpclient'

describe('DataSource integration', () => {
  // Integration tests.
  const tenantId = process.env.duplo_tenant_id
  const tenantName = process.env.duplo_tenant_name
  if (!tenantId || !tenantName || !process.env.duplo_token) {
    console.log(
      'Skipping integration tests: duplo_token and/or duplo_tenant_id and/or duplo_tenant_name env var missing or empty'
    )
    it('is skipped', () => {})
  } else {
    const ds = new DataSource(new DuploHttpClient())

    describe('getTenantsForUser', () => {
      it('lists tenants accessible to the user', async () => {
        const result = await ds.getTenantsForUser().toPromise()
        expect(result).not.toBeNull()
      })
    })

    describe('getTenantByName', () => {
      it('converts uppercase name', async () => {
        const result = await ds.getTenantByName(tenantName.toUpperCase()).toPromise()
        expect(result).not.toBeNull()
        expect(result?.AccountName).toBe(tenantName)
      })

      it('can get default tenant', async () => {
        const result = await ds.getTenantByName(tenantName).toPromise()
        expect(result).not.toBeNull()
        expect(result?.AccountName).toBe(tenantName)
      })
    })

    describe('getTenant', () => {
      it('converts uppercase name', async () => {
        const result = await ds.getTenant(tenantName.toUpperCase()).toPromise()
        expect(result).not.toBeNull()
        expect(result?.AccountName).toBe(tenantName)
      })

      it('can get tenant by name or ID', async () => {
        const result = await ds.getTenantByName(tenantName).toPromise()
        expect(result?.TenantId).not.toBeNull()

        if (result?.TenantId) {
          const resultByName = await ds.getTenant(tenantName).toPromise()
          expect(resultByName).toEqual(result)
          const resultById = await ds.getTenant(result.TenantId).toPromise()
          expect(resultById).toEqual(result)
        }
      })
    })

    describe('getTenantAwsJitCredentials', () => {
      it('can get AWS JIT creds for tenant', async () => {
        const result = await ds.getTenantAwsJitCredentials(tenantId).toPromise()
        expect(result).not.toBeNull()
        expect(result.Region).not.toBeNull()
        expect(result.AccessKeyId).not.toBeNull()
        expect(result.SecretAccessKey).not.toBeNull()
        expect(result.SessionToken).not.toBeNull()
      })
    })
  }
})

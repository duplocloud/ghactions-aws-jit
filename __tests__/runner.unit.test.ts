import {expect, jest} from '@jest/globals'

import {Runner} from '../src/runner'
import * as core from '@actions/core'
import {DataSource} from '../src/duplocloud/datasource'
import {DuploHttpClient} from '../src/duplocloud/httpclient'
import {of, throwError} from 'rxjs'
import {AwsJitCredentials, SystemFeatures, UserTenant} from '../src/duplocloud/model'

jest.mock('@actions/core')

describe('Runner unit', () => {
  const origEnv = {duplo_host: process.env.duplo_host, duplo_token: process.env.duplo_token}

  const featureFaker = () =>
    new SystemFeatures({
      IsAwsCloudEnabled: true,
      DefaultAwsAccount: 'FAKE_AWS_ACCOUNT'
    })

  let runner = new Runner()

  beforeEach(() => {
    process.env.duplo_host = 'FAKE_DUPLO_HOST'
    process.env.duplo_token = 'FAKE_DUPLO_TOKEN'
    runner = new Runner()
  })

  afterEach(() => {
    Object.assign(process.env, origEnv)
  })

  describe('initialization', () => {
    let mockDuploHttpClient_doFetch: any

    beforeEach(() => {
      mockDuploHttpClient_doFetch = jest
        .spyOn(DuploHttpClient.prototype, 'doFetch' as any)
        .mockImplementation(() => of(featureFaker()))
    })

    it('fails without duplo_token', async () => {
      process.env.duplo_token = ''

      await runner.runAction()
      expect(core.setFailed).toHaveBeenCalled()
    })

    it('fails without duplo_host', async () => {
      process.env.duplo_host = ''

      await runner.runAction()
      expect(core.setFailed).toHaveBeenCalled()
    })

    it('fails if AWS is not enabled', async () => {
      const mockDuploHttpClient_doFetch = jest
        .spyOn(DuploHttpClient.prototype, 'doFetch' as any)
        .mockImplementation(() => of({IsAwsCloudEnabled: false}))

      await runner.runAction()

      expect(mockDuploHttpClient_doFetch).toHaveBeenCalledWith('/v3/features/system', 'GET', null, undefined)
      expect(core.setFailed).toHaveBeenCalledWith(Runner.ERROR_AWS_CLOUD_NOT_SUPPORTED)
    })

    describe('tenant access', () => {
      it('fails without tenant', async () => {
        await runner.runAction()

        expect(core.getInput).toHaveBeenCalledWith('tenant')
        expect(core.setFailed).toHaveBeenCalledWith(Runner.ERROR_NO_TENANT_SPECIFIED)
      })
    })
  })

  // Common tests:  on error
  const ON_ERROR = () => {
    it('fails', async () => {
      await runner.runAction()

      expect(core.getBooleanInput).toHaveBeenCalledWith('admin')
      expect(core.setFailed).toHaveBeenCalledWith(`${Runner.ERROR_FAILED_TO_GET_CREDS}: "failed"`)
    })
  }

  // Common tests:  on success
  const ON_SUCCESS = (responseFaker: () => AwsJitCredentials) => {
    it('outputs the AWS account id', async () => {
      await runner.runAction()

      expect(core.getBooleanInput).toHaveBeenCalledWith('admin')
      expect(core.setFailed).not.toHaveBeenCalled()
      expect(core.setOutput).toHaveBeenCalledWith('aws-account-id', featureFaker().DefaultAwsAccount)
    })

    it('redacts all secrets', async () => {
      await runner.runAction()

      expect(core.getBooleanInput).toHaveBeenCalledWith('admin')
      expect(core.setFailed).not.toHaveBeenCalled()

      const rp = responseFaker()
      expect(core.setSecret).toHaveBeenCalledWith(rp.AccessKeyId)
      expect(core.setSecret).toHaveBeenCalledWith(rp.SecretAccessKey)
      expect(core.setSecret).toHaveBeenCalledWith(rp.ConsoleUrl)
      expect(core.setSecret).toHaveBeenCalledWith(rp.SessionToken)
    })

    it('exports all env vars', async () => {
      await runner.runAction()

      expect(core.getBooleanInput).toHaveBeenCalledWith('admin')
      expect(core.setFailed).not.toHaveBeenCalled()

      const rp = responseFaker()
      expect(core.exportVariable).toHaveBeenCalledWith('AWS_DEFAULT_REGION', rp.Region)
      expect(core.exportVariable).toHaveBeenCalledWith('AWS_REGION', rp.Region)
      expect(core.exportVariable).toHaveBeenCalledWith('AWS_ACCESS_KEY_ID', rp.AccessKeyId)
      expect(core.exportVariable).toHaveBeenCalledWith('AWS_SECRET_ACCESS_KEY', rp.SecretAccessKey)
      expect(core.exportVariable).toHaveBeenCalledWith('AWS_SESSION_TOKEN', rp.SessionToken)
    })
  }

  describe('admin access', () => {
    beforeEach(() => {
      // Mock admin access being turned on
      jest.spyOn(core, 'getBooleanInput').mockImplementation((name: string, options?: core.InputOptions) => {
        if (name === 'admin') return true
        return false
      })
    })

    describe('on error', () => {
      beforeEach(() => {
        // Mock admin AWS JIT failing
        const mockAwsJit = jest
          .spyOn(DataSource.prototype, 'getAdminAwsJitCredentials')
          .mockImplementation(() => throwError('failed'))
      })

      ON_ERROR()
    })

    describe('on success', () => {
      const responseFaker = () =>
        new AwsJitCredentials({
          ConsoleUrl: 'FAKE_CONSOLE_URL',
          AccessKeyId: 'FAKE_ACCESS_KEY_ID',
          SecretAccessKey: 'FAKE_SECRET_ACCESS_KEY',
          Region: 'FAKE_REGION',
          SessionToken: 'FAKE_SESSION_TOKEN'
        })

      beforeEach(() => {
        // Mock admin AWS JIT being returned
        const mockAwsJit = jest
          .spyOn(DataSource.prototype, 'getAdminAwsJitCredentials')
          .mockImplementation(() => of(responseFaker()))
      })

      ON_SUCCESS(responseFaker)
    })
  })

  describe('tenant access', () => {
    beforeEach(() => {
      // Mock admin access being turned off
      jest.spyOn(core, 'getBooleanInput').mockImplementation((name: string, options?: core.InputOptions) => false)

      // Mock tenant ID being passed
      jest.spyOn(core, 'getInput').mockImplementation((name: string, options?: core.InputOptions) => {
        if (name === 'tenant') return 'fake'
        return ''
      })

      // Mock tenant being returneed
      jest.spyOn(DataSource.prototype, 'getTenantsForUser').mockImplementation(() => {
        return of([new UserTenant({TenantId: 'FAKE_TENANT_ID', AccountName: 'fake'})])
      })
    })

    describe('on error', () => {
      beforeEach(() => {
        // Mock tenant AWS JIT failing
        const mockAwsJit = jest
          .spyOn(DataSource.prototype, 'getTenantAwsJitCredentials')
          .mockImplementation(() => throwError('failed'))
      })

      ON_ERROR()
    })

    describe('on success', () => {
      const responseFaker = () =>
        new AwsJitCredentials({
          ConsoleUrl: 'FAKE_CONSOLE_URL',
          AccessKeyId: 'FAKE_ACCESS_KEY_ID',
          SecretAccessKey: 'FAKE_SECRET_ACCESS_KEY',
          Region: 'FAKE_REGION',
          SessionToken: 'FAKE_SESSION_TOKEN'
        })

      beforeEach(() => {
        // Mock tenant AWS JIT being returned
        const mockAwsJit = jest
          .spyOn(DataSource.prototype, 'getTenantAwsJitCredentials')
          .mockImplementation(() => of(responseFaker()))
      })

      ON_SUCCESS(responseFaker)
    })
  })
})

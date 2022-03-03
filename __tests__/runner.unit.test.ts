import {expect, jest} from '@jest/globals'

import {Runner} from '../src/runner'
import * as core from '@actions/core'
import {DuploHttpClient} from '../src/duplocloud/httpclient'
import { of } from 'rxjs'

jest.mock('@actions/core')

describe('Runner unit', () => {
  const origEnv = { duplo_host: process.env.duplo_host, duplo_token: process.env.duplo_token }
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
    let mockDuploHttpClient_doFetch : any

    beforeEach(() => {
      mockDuploHttpClient_doFetch = jest
        .spyOn(DuploHttpClient.prototype, 'doFetch' as any)
        .mockImplementation(() => of({IsAwsCloudEnabled: true}))
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

      expect(mockDuploHttpClient_doFetch).
        toHaveBeenCalledWith('/v3/features/system', 'GET', null, undefined)
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
})

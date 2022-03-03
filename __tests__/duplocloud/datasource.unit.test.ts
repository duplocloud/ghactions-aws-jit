import {expect, jest} from '@jest/globals'
import {EMPTY} from 'rxjs'

import {DataSource} from '../../src/duplocloud/datasource'
import {DuploHttpClient} from '../../src/duplocloud/httpclient'

//jest.mock('../../src/duplocloud/httpclient')

const mockDuploHttpClient_doFetch = jest
  .spyOn(DuploHttpClient.prototype, 'doFetch' as any)
  .mockImplementation(() => EMPTY)

describe('DataSource unit', () => {
  const ds = new DataSource(new DuploHttpClient())

  describe('getSystemFeatures', () => {
    it('does a GET to /v3/features/system', async () => {
      ds.getSystemFeatures()
      expect(mockDuploHttpClient_doFetch).toHaveBeenCalledWith('/v3/features/system', 'GET', null, undefined)
    })
  })
})

import * as core from '@actions/core'
import {EMPTY, Observable} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {AwsJitCredentials} from './duplocloud/model'
import {DataSource} from './duplocloud/datasource'
import {DuploHttpClient} from './duplocloud/httpclient'

export class Runner {
  static readonly ERROR_AWS_CLOUD_NOT_SUPPORTED = 'AWS cloud is not supported on this Duplo instance'
  static readonly ERROR_NO_TENANT_SPECIFIED = 'No tenant specified, and admin credentials were not requested'
  static readonly ERROR_FAILED_TO_GET_CREDS = 'Failed to get AWS JIT credentials'

  async runAction(): Promise<void> {
    try {
      // Connect to Duplo.
      const duploHost = core.getInput('duplo_host')
      const duploToken = core.getInput('duplo_token')
      const ds = new DataSource(new DuploHttpClient(duploHost, duploToken))

      // Confirm that AWS is enabled in this Duplo.
      const features = await ds.getSystemFeatures().toPromise()
      if (!features.IsAwsCloudEnabled) {
        throw new Error(Runner.ERROR_AWS_CLOUD_NOT_SUPPORTED)
      }

      // Determine how to retrieve credentials.
      const isAdmin = core.getBooleanInput('admin')
      const tenantInput = core.getInput('tenant')
      let apiCall: Observable<AwsJitCredentials>
      if (isAdmin) {
        const awsRegion = core.getInput('aws_region')
        core.info(`Got Region ${awsRegion}`)
        apiCall = ds.getAdminAwsJitCredentials(awsRegion)
      } else if (tenantInput?.length) {
        // Get information about the tenant
        const tenant = await ds.getTenant(tenantInput).toPromise()
        if (!tenant) throw new Error(`No such tenant: ${tenantInput}`)

        // Get tenant level credentials.
        apiCall = ds.getTenantAwsJitCredentials(tenant.TenantId)
      } else {
        throw new Error(Runner.ERROR_NO_TENANT_SPECIFIED)
      }

      // Retrieve the credentials.
      return apiCall
        .pipe(
          catchError(err => {
            core.setFailed(`${Runner.ERROR_FAILED_TO_GET_CREDS}: ${JSON.stringify(err)}`)
            return EMPTY
          }),
          map(creds => {
            core.info('Retrieved AWS JIT credentials')

            // Output the account ID
            core.setOutput('aws-account-id', features.DefaultAwsAccount)

            // Mark all secrets so they don't show up in github logs
            core.setSecret(creds.AccessKeyId)
            core.setSecret(creds.SecretAccessKey)
            core.setSecret(creds.ConsoleUrl)
            if (creds.SessionToken) core.setSecret(creds.SessionToken)

            // Export all env variables used for AWS credentials
            core.exportVariable('AWS_DEFAULT_REGION', creds.Region)
            core.exportVariable('AWS_REGION', creds.Region)
            core.exportVariable('AWS_ACCESS_KEY_ID', creds.AccessKeyId)
            core.exportVariable('AWS_SECRET_ACCESS_KEY', creds.SecretAccessKey)
            if (creds.SessionToken) core.exportVariable('AWS_SESSION_TOKEN', creds.SessionToken)
          })
        )
        .toPromise<void>()
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
}

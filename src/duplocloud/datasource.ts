import {AwsJitCredentials, SystemFeatures, UserTenant} from './model'
import {DuploHttpClient} from './httpclient'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import * as core from '@actions/core'

export class DataSource {
  constructor(private api: DuploHttpClient) {}

  getTenantsForUser(): Observable<UserTenant[]> {
    return this.api
      .get<UserTenant[]>('/admin/GetTenantsForUser')
      .pipe(map(list => list.map(item => new UserTenant(item))))
  }

  getTenant(idOrName: string): Observable<UserTenant | undefined> {
    if (idOrName.length >= 32) return this.getTenantById(idOrName)
    return this.getTenantByName(idOrName)
  }

  getTenantById(id: string): Observable<UserTenant | undefined> {
    id = id.toLowerCase()
    return this.getTenantsForUser().pipe(map(list => list.find(tenant => tenant.TenantId.toLowerCase() === id)))
  }

  getTenantByName(name: string): Observable<UserTenant | undefined> {
    name = name.toLowerCase()
    return this.getTenantsForUser().pipe(map(list => list.find(tenant => tenant.AccountName.toLowerCase() === name)))
  }

  getSystemFeatures(): Observable<SystemFeatures> {
    return this.api.get<SystemFeatures>('/v3/features/system').pipe(map(item => new SystemFeatures(item)))
  }

  getAdminAwsJitCredentials(awsRegion: string): Observable<AwsJitCredentials> {
    const api = awsRegion ? `/v3/admin/aws/jitAccess/admin/${awsRegion}` : '/adminproxy/GetJITAwsConsoleAccessUrl'
    core.info(`Going to use api ${api}`)
    return this.api.get<AwsJitCredentials>(api).pipe(map(item => new AwsJitCredentials(item)))
  }

  getTenantAwsJitCredentials(tenantId: string): Observable<AwsJitCredentials> {
    return this.api
      .get<AwsJitCredentials>(`/subscriptions/${tenantId}/GetAwsConsoleTokenUrl`)
      .pipe(map(item => new AwsJitCredentials(item)))
  }
}

/* eslint-disable no-shadow */
// API object:  a key / value pair
export interface KeyStringValue {
  Key: string
  Value: string
}

// API object:  custom data
export class CustomData implements KeyStringValue {
  constructor(properties?: Partial<CustomData>) {
    Object.assign(this, properties || {})
  }

  Key!: string
  Value!: string
}

// API object:  custom data with a type field
export class CustomDataEx extends CustomData {
  constructor(properties?: Partial<CustomDataEx>) {
    super()
    Object.assign(this, properties || {})
  }

  Type!: string
  ComponentId?: string
  State?: string
}

// API enum:  cloud platform
export enum CloudPlatform {
  AWS = 0,
  Oracle = 1,
  Azure = 2,
  Google = 3,
  BYOH = 4,
  Unknown,
  Digital_Ocean
}

export class SystemFeatures {
  constructor(properties?: Partial<SystemFeatures>) {
    Object.assign(this, properties || {})
  }

  IsSignupEnabled: boolean = false
  IsComplianceEnabled: boolean = false
  IsSiemEnabled: boolean = false
  IsBillingEnabled: boolean = false
  IsKatkitEnabled: boolean = false
  IsAwsCloudEnabled: boolean = true
  AwsRegions: string[] = []
  DefaultAwsAccount: string | undefined
  DefaultAwsRegion: string | undefined
  IsAzureCloudEnabled: boolean = false
  AzureRegions: string[] = []
  IsGoogleCloudEnabled: boolean = false
  GoogleRegions: string[] = []
}

// API object: A tenant available to the currently logged-in user.
export class UserTenant {
  constructor(properties?: Partial<UserTenant>) {
    Object.assign(this, properties || {})
  }

  TenantId!: string
  AccountName!: string
  PlanID?: string
  Metadata?: CustomData[]
  InfraOwner?: string
}

// API object: just-in-time AWS credentials from Duplo
export class AwsJitCredentials {
  constructor(properties?: Partial<AwsJitCredentials>) {
    Object.assign(this, properties || {})
  }

  ConsoleUrl!: string
  AccessKeyId!: string
  SecretAccessKey!: string
  Region!: string
  SessionToken!: string
  Validity?: number
}

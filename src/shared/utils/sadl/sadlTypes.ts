export type SADLVersion = 'v1' | 'v2';

export interface IDecodedSADL {
  surname: string;
  initials: string;
  identityNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  licenceCodes: string[];
  licenceNumber: string;
  identityCountryOfIssue: string;
  licenceCountryOfIssue: string;
  vehicleRestrictions: string[];
  identityNumberType: string;
  licenceCodeIssueDates: string[];
  driverRestrictionCodes: string;
  professionalDrivingPermitExpiryDate: string | null;
  licenceIssueNumber: string;
  licenceIssueDate: string;
  licenceExpiryDate: string;
}

export interface IDecodeDriverLicenceRequest {
  barcode_data: string;
}

export interface IDecodeDriverLicenceResponse {
  decoded: IDecodedSADL;
  driver_licence: unknown;
  is_new: boolean;
}

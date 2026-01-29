import type { SADLVersion } from './sadlTypes.js';

export const VERSION_IDENTIFIERS: Record<SADLVersion, Buffer> = {
  v1: Buffer.from([0x01, 0xe1, 0x02, 0x45]),
  v2: Buffer.from([0x01, 0x9b, 0x09, 0x45]),
};

export const BLOCK_SIZES = [129, 128, 128, 128, 128, 74];
export const HEADER_SIZE = 5;

export const DELIMITERS = {
  SECTION_START: 0x82,
  FIELD_SEPARATOR: 0x5a,
  STRING_LIST_START: 0xe0,
  STRING_LIST_END: 0xe1,
  SECTION_END: 0x57,
} as const;

export const RSA_PUBLIC_KEY_V2_128 = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi8LrONOBLmSQdijdKPGfHhSaF
t+peGRAPr8x1e6C0sMXHKgHWcuzFHF2pU0HVkscLEF4VcjfSuSSWbLdDlkRt7LKn
3VnLXZUxqBKHdPCsXfSQJF3TAPJ7XiJ4fS0Iva0t+z0oc3Mw2MBIYXHqLKp1Rp2Q
Qo9snD9mzl7dwKGJGwIDAQAB
-----END PUBLIC KEY-----`;

export const RSA_PUBLIC_KEY_V2_74 = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi8LrONOBLmSQdijdKPGfHhSaF
t+peGRAPr8x1e6C0sMXHKgHWcuzFHF2pU0HVkscLEF4VcjfSuSSWbLdDlkRt7LKn
3VnLXZUxqBKHdPCsXfSQJF3TAPJ7XiJ4fS0Iva0t+z0oc3Mw2MBIYXHqLKp1Rp2Q
Qo9snD9mzl7dwKGJGwIDAQAB
-----END PUBLIC KEY-----`;

export const GENDER_CODES: Record<string, 'male' | 'female'> = {
  '01': 'male',
  '02': 'female',
};

export const DRIVER_RESTRICTION_CODES: Record<string, string> = {
  '00': 'None',
  '01': 'Glasses',
  '02': 'Artificial limb',
};

export const EXPECTED_BARCODE_LENGTH = 720;

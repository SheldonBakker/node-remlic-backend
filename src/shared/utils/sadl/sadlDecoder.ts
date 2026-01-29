import type { IDecodedSADL } from './sadlTypes.js';
import { EXPECTED_BARCODE_LENGTH } from './sadlConstants.js';
import { detectVersion, decryptV2 } from './sadlDecryptor.js';
import { SADLParser } from './sadlParser.js';
import { HttpError } from '../../types/errors/appError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export class SADLDecoder {
  public static decode(base64Data: string): IDecodedSADL {
    let rawData: Buffer;
    try {
      rawData = Buffer.from(base64Data, 'base64');
    } catch {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid barcode data: not valid base64',
      );
    }

    if (rawData.length !== EXPECTED_BARCODE_LENGTH) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid barcode data: expected ${EXPECTED_BARCODE_LENGTH} bytes, got ${rawData.length}`,
      );
    }

    const version = detectVersion(rawData);

    let decryptedData: Buffer;
    if (version === 'v2') {
      decryptedData = decryptV2(rawData);
    } else {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        `Unsupported driver licence version: ${version}`,
      );
    }

    const parser = new SADLParser(decryptedData);
    return parser.parse();
  }
}

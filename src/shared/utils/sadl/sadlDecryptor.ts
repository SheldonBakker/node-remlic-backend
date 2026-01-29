import crypto from 'crypto';
import type { SADLVersion } from './sadlTypes.js';
import {
  VERSION_IDENTIFIERS,
  BLOCK_SIZES,
  HEADER_SIZE,
  RSA_PUBLIC_KEY_V2_128,
  RSA_PUBLIC_KEY_V2_74,
} from './sadlConstants.js';
import { HttpError } from '../../types/errors/appError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export function detectVersion(data: Buffer): SADLVersion {
  const versionBytes = data.subarray(0, 4);

  if (versionBytes.equals(VERSION_IDENTIFIERS.v2)) {
    return 'v2';
  }

  if (versionBytes.equals(VERSION_IDENTIFIERS.v1)) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      'Version 1 driver licence cards are no longer supported',
    );
  }

  throw new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    'Unknown driver licence barcode version',
  );
}

function decryptBlock(encryptedBlock: Buffer, publicKey: string): Buffer {
  try {
    return crypto.publicDecrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      encryptedBlock,
    );
  } catch {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      'Failed to decrypt driver licence barcode data',
    );
  }
}

export function decryptV2(rawData: Buffer): Buffer {
  const encryptedData = rawData.subarray(HEADER_SIZE);

  const blocks: Buffer[] = [];
  let offset = 0;

  for (const size of BLOCK_SIZES) {
    if (offset + size > encryptedData.length) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid barcode data: insufficient length for decryption blocks',
      );
    }
    blocks.push(encryptedData.subarray(offset, offset + size));
    offset += size;
  }

  const decryptedBlocks: Buffer[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as Buffer;
    const key = i === blocks.length - 1 ? RSA_PUBLIC_KEY_V2_74 : RSA_PUBLIC_KEY_V2_128;
    const decrypted = decryptBlock(block, key);
    decryptedBlocks.push(decrypted);
  }

  return Buffer.concat(decryptedBlocks);
}

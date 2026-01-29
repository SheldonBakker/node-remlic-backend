import type { IDecodedSADL } from './sadlTypes.js';
import { DELIMITERS, GENDER_CODES } from './sadlConstants.js';
import { HttpError } from '../../types/errors/appError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export class SADLParser {
  private readonly data: Buffer;
  private position = 0;

  constructor(decryptedData: Buffer) {
    this.data = decryptedData;
  }

  private readByte(): number {
    if (this.position >= this.data.length) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Unexpected end of barcode data');
    }
    return this.data[this.position++] as number;
  }

  private peekByte(): number {
    if (this.position >= this.data.length) {
      return -1;
    }
    return this.data[this.position] as number;
  }

  private skipToMarker(marker: number): boolean {
    while (this.position < this.data.length) {
      if (this.data[this.position] === marker) {
        this.position++;
        return true;
      }
      this.position++;
    }
    return false;
  }

  private readString(): string {
    const bytes: number[] = [];
    while (this.position < this.data.length) {
      const byte = this.peekByte();
      if (
        byte === DELIMITERS.FIELD_SEPARATOR ||
        byte === DELIMITERS.STRING_LIST_START ||
        byte === DELIMITERS.STRING_LIST_END ||
        byte === DELIMITERS.SECTION_END ||
        byte === 0x00
      ) {
        break;
      }
      bytes.push(this.readByte());
    }
    return Buffer.from(bytes).toString('ascii').trim();
  }

  private readStringList(): string[] {
    const items: string[] = [];

    if (this.peekByte() !== DELIMITERS.STRING_LIST_START) {
      return items;
    }
    this.position++;

    while (this.position < this.data.length) {
      const byte = this.peekByte();

      if (byte === DELIMITERS.STRING_LIST_END) {
        this.position++;
        break;
      }

      if (byte === DELIMITERS.FIELD_SEPARATOR) {
        this.position++;
        continue;
      }

      const item = this.readString();
      if (item.length > 0) {
        items.push(item);
      }
    }

    return items;
  }

  private readNibbles(count: number): string {
    const result: string[] = [];
    const bytesToRead = Math.ceil(count / 2);

    for (let i = 0; i < bytesToRead && this.position < this.data.length; i++) {
      const byte = this.readByte();
      const highNibble = (byte >> 4) & 0x0f;
      const lowNibble = byte & 0x0f;

      result.push(highNibble.toString(16).toUpperCase());
      if (result.length < count) {
        result.push(lowNibble.toString(16).toUpperCase());
      }
    }

    return result.join('');
  }

  private parseDate(nibbles: string): string {
    if (nibbles.length < 8) {
      return '';
    }
    const year = nibbles.substring(0, 4);
    const month = nibbles.substring(4, 6);
    const day = nibbles.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  private parseDateList(count: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < count; i++) {
      const nibbles = this.readNibbles(8);
      const date = this.parseDate(nibbles);
      if (date && date !== '0000-00-00') {
        dates.push(date);
      }
    }
    return dates;
  }

  public parse(): IDecodedSADL {
    try {
      if (!this.skipToMarker(DELIMITERS.SECTION_START)) {
        throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Invalid barcode format: section marker not found');
      }

      const surname = this.readString();

      if (this.peekByte() === DELIMITERS.FIELD_SEPARATOR) {
        this.position++;
      }

      const initials = this.readString();

      if (this.peekByte() === DELIMITERS.FIELD_SEPARATOR) {
        this.position++;
      }

      const prDPExpiryNibbles = this.readNibbles(8);
      const professionalDrivingPermitExpiryDate = this.parseDate(prDPExpiryNibbles);

      const identityNumberType = this.readNibbles(2);
      const identityCountryOfIssue = this.readNibbles(2);
      const licenceCountryOfIssue = this.readNibbles(2);
      const licenceIssueNumber = this.readNibbles(2);
      const identityNumber = this.readNibbles(13);

      const licenceCodes = this.readStringList();
      const vehicleRestrictions = this.readStringList();

      const genderCode = this.readNibbles(2);
      const gender = GENDER_CODES[genderCode] ?? 'male';

      const dobNibbles = this.readNibbles(8);
      const dateOfBirth = this.parseDate(dobNibbles);

      const licenceCodeIssueDates = this.parseDateList(4);

      const driverRestrictionCodes = this.readNibbles(2);

      const licenceIssueDateNibbles = this.readNibbles(8);
      const licenceIssueDate = this.parseDate(licenceIssueDateNibbles);

      const licenceExpiryDateNibbles = this.readNibbles(8);
      const licenceExpiryDate = this.parseDate(licenceExpiryDateNibbles);

      const licenceNumber = this.readString();

      return {
        surname,
        initials,
        identityNumber,
        dateOfBirth,
        gender,
        licenceCodes,
        licenceNumber,
        identityCountryOfIssue,
        licenceCountryOfIssue,
        vehicleRestrictions,
        identityNumberType,
        licenceCodeIssueDates,
        driverRestrictionCodes,
        professionalDrivingPermitExpiryDate: professionalDrivingPermitExpiryDate !== '0000-00-00'
          ? professionalDrivingPermitExpiryDate
          : null,
        licenceIssueNumber,
        licenceIssueDate,
        licenceExpiryDate,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Failed to parse driver licence barcode data',
      );
    }
  }
}

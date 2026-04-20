import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

export class CropCompatibilityId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): CropCompatibilityId {
    if (!value || value.trim() === '') {
      throw new Error('CropCompatibilityId cannot be empty');
    }
    return new CropCompatibilityId(value);
  }

  static create_random(): CropCompatibilityId {
    return new CropCompatibilityId(crypto.randomUUID());
  }
}
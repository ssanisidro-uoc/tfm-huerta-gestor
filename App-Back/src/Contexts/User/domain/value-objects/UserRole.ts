import { StringValueObject } from '../../../Shared/domain/value-object/StringValueObject';

export enum UserRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer'
}

export class UserRoleVO extends StringValueObject {
  private static readonly VALID_ROLES = Object.values(UserRole);

  constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(role: string): void {
    if (!UserRoleVO.VALID_ROLES.includes(role as UserRole)) {
      throw new Error(
        `Invalid role: "${role}". Valid roles are: ${UserRoleVO.VALID_ROLES.join(', ')}`
      );
    }
  }

  static owner(): UserRoleVO {
    return new UserRoleVO(UserRole.OWNER);
  }

  static collaborator(): UserRoleVO {
    return new UserRoleVO(UserRole.COLLABORATOR);
  }

  static viewer(): UserRoleVO {
    return new UserRoleVO(UserRole.VIEWER);
  }

  is_owner(): boolean {
    return this.value === UserRole.OWNER;
  }

  is_collaborator(): boolean {
    return this.value === UserRole.COLLABORATOR;
  }

  is_viewer(): boolean {
    return this.value === UserRole.VIEWER;
  }
}

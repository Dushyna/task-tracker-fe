// for login
export interface Credentials {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
}

export type ROLE = "ROLE_USER" | "ROLE_ADMIN";
export type CONFIRM_STATUS = "CONFIRMED" | "UNCONFIRMED" | "BANNED";

export interface AuthSliceState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user?: UserResponseDto;
  loginErrorMessage?: string;
  registerErrorMessage?: string;

}

export interface UserResponseDto {
    email: string;
    role?: ROLE;
    confirmationStatus?: CONFIRM_STATUS;
    nickname?: string;
    avatarUrl?: string;
}

export interface UserCreateResponseDto {
    id: string;
    email: string;
    role: ROLE;
    confirmationResent?: CONFIRM_STATUS;
}
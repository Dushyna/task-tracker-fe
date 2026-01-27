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

export interface User {
  id?: string;
  email: string;
  role: ROLE;
}

export interface AuthSliceState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user?: User;
  loginErrorMessage?: string;
}

export interface UserResponseDto {
    email: string;
    role: ROLE;
    confirmationStatus: CONFIRM_STATUS;
}

export interface UserCreateResponseDto {
    id: string;
    email: string;
    role: ROLE;
    confirmationResent: boolean;
}
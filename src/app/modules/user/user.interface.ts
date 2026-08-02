export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  nidUrl?: string;
  role?: "CUSTOMER" | "PROVIDER";
  image?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  nidUrl?: string;
  role?: "CUSTOMER" | "PROVIDER";
  image?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
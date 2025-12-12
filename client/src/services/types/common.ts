export interface CommonResponse {
  success: boolean;
  data: any | null;
  message: string | null;
}

export enum UserRole {

  CUSTOMER = "customer",
  ADMIN = "admin",
}



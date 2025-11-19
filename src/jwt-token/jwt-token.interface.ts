export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  // sub?: string;
  iat?: number;
  exp?: number;
}

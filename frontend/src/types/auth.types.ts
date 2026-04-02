export interface User { id: string; email: string; name: string; createdAt: string; }
export interface LoginInput { email: string; password: string; }
export interface SignupInput { email: string; password: string; name: string; }
export interface LoginResponse { accessToken: string; expiresIn: number; user: User; }
export interface SignupResponse { id: string; email: string; name: string; createdAt: string; message: string; }

import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {
      id?: string;
      userId?: string;
      tenantId?: string;
      role?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

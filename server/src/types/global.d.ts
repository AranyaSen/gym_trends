declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        gymId: string;
      };
    }
  }
}

export {};

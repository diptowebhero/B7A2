import { UserRole } from '../../types';

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

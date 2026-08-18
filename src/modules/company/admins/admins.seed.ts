export interface AdminRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
  isProtected: boolean;
}

export interface RoleRow {
  id: string;
  name: string;
  userCount: number;
  isActive: boolean;
  isProtected: boolean;
}

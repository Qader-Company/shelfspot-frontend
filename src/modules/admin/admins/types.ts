export type Id = string | number;
export interface Permission { id: Id; name: string }
export interface Role { id: Id; name: string; active?: boolean; is_active?: boolean | number; users_count?: number; admins_count?: number; permissions?: Permission[] }
export interface Admin { id: Id; name: string; email: string; phone?: string; phone_number?: string; active?: boolean; is_active?: boolean | number; role?: string | Role; roles?: Role[] }
export interface ListResult<T> { items: T[] }
export interface AdminPayload { name: string; email: string; password?: string; is_active: 0 | 1; roles: string[] }
export interface RolePayload { name: string; permissions: string[] }

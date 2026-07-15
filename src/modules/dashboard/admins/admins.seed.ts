export type AdminTabKey = "admins" | "roles";

export interface AdminRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface RoleRow {
  id: string;
  name: string;
  userCount: number;
  isActive: boolean;
}

export interface PermissionItem {
  id: string;
  isChecked: boolean;
}

// ─── Admin rows (matches design screenshot) ────────────────────────────────

export const adminRows: AdminRow[] = [
  { id: "admin-1", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: true  },
  { id: "admin-2", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "AM",    isActive: false },
  { id: "admin-3", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "AM",    isActive: true  },
  { id: "admin-4", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: true  },
  { id: "admin-5", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: false },
  { id: "admin-6", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: true  },
  { id: "admin-7", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: false },
  { id: "admin-8", name: "Omar Aly", phone: "+966 23678899", email: "omarali87@gmail.com", role: "Sales", isActive: true  },
];

// ─── Role rows ─────────────────────────────────────────────────────────────

export const roleRows: RoleRow[] = [
  { id: "role-1", name: "Sales", userCount: 3, isActive: true  },
  { id: "role-2", name: "Sales", userCount: 5, isActive: false },
  { id: "role-3", name: "Sales", userCount: 7, isActive: true  },
  { id: "role-4", name: "Sales", userCount: 1, isActive: true  },
  { id: "role-5", name: "Sales", userCount: 6, isActive: false },
  { id: "role-6", name: "Sales", userCount: 7, isActive: true  },
  { id: "role-7", name: "Sales", userCount: 3, isActive: false },
  { id: "role-8", name: "Sales", userCount: 1, isActive: true  },
];

// ─── Available roles (for form dropdowns) ─────────────────────────────────

export const availableRoles = ["sales", "am", "supervisor"] as const;

// ─── Permissions grid (9 rows × 5 = 45 items) ─────────────────────────────
// Checked pattern mirrors the "Create New Role" design screenshot.

const permPattern = [
  false, true, true, false, true,   // row 0
  false, true, false, false, true,  // row 1
  false, true, false, false, true,  // row 2
  true,  true, false, false, true,  // row 3
  true,  true, false, false, true,  // row 4
  true,  true, false, false, true,  // row 5
  true,  true, false, false, true,  // row 6
  true,  true, false, true,  true,  // row 7
  true,  true, true,  true,  true,  // row 8
];

export const permissionItems: PermissionItem[] = permPattern.map(
  (isChecked, i) => ({ id: `perm-${i + 1}`, isChecked }),
);

// ─── Pagination ────────────────────────────────────────────────────────────

export const adminsPagination = {
  pages: ["1", "2", "3", "...", "8", "9", "10"],
  activePage: "1",
};

// ─── Default tab ───────────────────────────────────────────────────────────

export const adminsDefaultTab: AdminTabKey = "admins";

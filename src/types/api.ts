export type Role = 'ADMIN' | 'ADVOCATE';
export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export type Advocate = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isActive?: boolean;
  profileStatus: ProfileStatus;
  barId?: string | null;
  experienceYears?: number | null;
  practiceAreas: string[];
  city?: string | null;
  state?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SettingItem = {
  key: string;
  value: string;
  updatedAt: string;
};


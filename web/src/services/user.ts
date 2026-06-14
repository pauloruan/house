import { api } from "./api";

export interface BillProfile {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface EventProfile {
  id: string;
  name: string;
  event_date: string;
  status: string;
}

export interface HouseProfile {
  id: string;
  name: string;
  role: string;
  joined_at: string;
  bills: BillProfile[];
  invite_code?: string | null;
  residents_count: number;
  residents: UserProfile[];
  events: EventProfile[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture: string;
  pix_key: string | null;
  created_at: string;
  house?: HouseProfile | null;
}

export interface MeResponse {
  user: UserProfile;
}

export async function getProfile(): Promise<MeResponse> {
  const response = await api.get<MeResponse>("/me");
  return response.data;
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put<UserProfile>("/users", data);
  return response.data;
}

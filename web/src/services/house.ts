import { api } from "./api";
import type { HouseProfile } from "./user";

export interface CreateHouseRequest {
  name: string;
}

export interface UpdateHouseRequest {
  name: string;
}

export interface RegenerateInviteCodeResponse {
  invite_code: string;
}

export async function createHouse(data: CreateHouseRequest): Promise<HouseProfile> {
  const response = await api.post<HouseProfile>("/house", data);
  return response.data;
}

export async function getHouse(): Promise<HouseProfile | null> {
  try {
    const response = await api.get<HouseProfile>("/house");
    return response.data;
  } catch (error) {
    // Se o usuário não tem casa, retorna null
    return null;
  }
}

export async function updateHouse(data: UpdateHouseRequest): Promise<HouseProfile> {
  const response = await api.put<HouseProfile>("/house", data);
  return response.data;
}

export async function deleteHouse(): Promise<void> {
  await api.delete("/house");
}

export async function regenerateInviteCode(): Promise<RegenerateInviteCodeResponse> {
  const response = await api.post<RegenerateInviteCodeResponse>("/house/regenerate-invite-code");
  return response.data;
}

export interface JoinHouseRequest {
  invite_code: string;
}

export async function joinHouseWithInviteCode(data: JoinHouseRequest): Promise<HouseProfile> {
	const response = await api.post<HouseProfile>("/house/join-with-invite-code", data);
	return response.data;
}

export async function leaveHouse(): Promise<void> {
	await api.post("/house/leave");
}

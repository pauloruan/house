import { api } from "./api"

export interface ResidentInfo {
  id: string
  name: string
  profile_picture: string
  selected: boolean
}

export interface Bill {
  id: string
  house_id: string
  owner_id: string
  owner_name: string
  owner_pix_key: string | null
  name: string
  total_amount: number
  paid_amount: number
  type: "service" | "purchase"
  status: string
  due_date: string
  created_at: string
  paid_by: string[]
  residents: ResidentInfo[]
}

export async function getBills(): Promise<Bill[]> {
  const response = await api.get<Bill[]>("/bills")
  return response.data
}

export interface CreateBillRequest {
  name: string
  type: string
  total_amount: number
  due_date: string
  resident_ids: string[]
}

export async function createBill(data: CreateBillRequest): Promise<Bill> {
  const response = await api.post<Bill>("/bills", data)
  return response.data
}

export interface UpdateBillRequest {
  id: string
  name: string
  type: string
  total_amount: number
  due_date: string
  status: string
  resident_ids: string[]
}

export async function updateBill(data: UpdateBillRequest): Promise<Bill> {
  const response = await api.put<Bill>("/bills", data)
  return response.data
}

export async function deleteBill(id: string): Promise<void> {
  await api.delete("/bills", { data: { id } })
}

export async function payBill(id: string): Promise<Bill> {
  const response = await api.post<Bill>("/bills/pay", { id })
  return response.data
}

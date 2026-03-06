export type StaffListItem = {
    id: number
    store_id: number
    branch_id: number | null
    branch_name: string | null
    email: string | null
    is_active: boolean
    is_store_master: boolean
    can_access_bf: boolean
    is_working: boolean
    created_at: string
    updated_at: string
}

export type StaffDetailItem = StaffListItem & {
    has_password: boolean
    has_pin: boolean
}

export type CreateStaffPayload = {
    email: string
    password: string
    pin: string
    branch_id: number | null
    is_active: boolean
    can_access_bf: boolean
}

export type UpdateStaffPayload = {
    email?: string
    branch_id?: number | null
    is_active?: boolean
    can_access_bf?: boolean
}

export type ChangePinPayload = {
    new_pin: string
}

export type ChangePasswordPayload = {
    new_password: string
}

export type BranchOption = {
    id: number
    store_id: number
    branch_name: string
}

export type PermissionDTO = {
    id: number
    code: string
    name: string
    description: string | null
    module: string
}

export type PermissionGroupDTO = {
    id: number
    store_id: number
    name: string
    description: string | null
    is_default: boolean
    staff_count: number
    created_at: string
    updated_at: string
}

export type GroupStaffDTO = {
    staff_id: number
    email: string | null
    is_manager: boolean
}

export type PermissionGroupDetail = {
    id: number
    store_id: number
    name: string
    description: string | null
    is_default: boolean
    permissions: PermissionDTO[]
    staff: GroupStaffDTO[]
    created_at: string
    updated_at: string
}

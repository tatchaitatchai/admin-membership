import ApiService from './ApiService'
import type {
    PermissionDTO,
    PermissionGroupDTO,
    PermissionGroupDetail,
    GroupStaffDTO,
} from '@/views/permissions/types'

const API_PREFIX = 'api/v2/permissions'

export async function apiGetAllPermissions() {
    return ApiService.fetchData<PermissionDTO[]>({
        url: `${API_PREFIX}`,
        method: 'get',
    })
}

export async function apiGetGroups() {
    return ApiService.fetchData<PermissionGroupDTO[]>({
        url: `${API_PREFIX}/groups`,
        method: 'get',
    })
}

export async function apiGetGroupDetail(groupId: number) {
    return ApiService.fetchData<PermissionGroupDetail>({
        url: `${API_PREFIX}/groups/${groupId}`,
        method: 'get',
    })
}

export async function apiCreateGroup(data: { name: string; description?: string }) {
    return ApiService.fetchData<{ id: number }>({
        url: `${API_PREFIX}/groups`,
        method: 'post',
        data,
    })
}

export async function apiUpdateGroup(groupId: number, data: { name?: string; description?: string }) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/groups/${groupId}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteGroup(groupId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/groups/${groupId}`,
        method: 'delete',
    })
}

export async function apiSetGroupPermissions(groupId: number, permissionIds: number[]) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/groups/${groupId}/permissions`,
        method: 'put',
        data: { permission_ids: permissionIds },
    })
}

export async function apiAssignStaffToGroup(groupId: number, staffId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/groups/${groupId}/staff`,
        method: 'post',
        data: { staff_id: staffId },
    })
}

export async function apiRemoveStaffFromGroup(groupId: number, staffId: number) {
    return ApiService.fetchData<{ message: string }>({
        url: `${API_PREFIX}/groups/${groupId}/staff/${staffId}`,
        method: 'delete',
    })
}

export async function apiGetStaffByStore() {
    return ApiService.fetchData<GroupStaffDTO[]>({
        url: `${API_PREFIX}/staff`,
        method: 'get',
    })
}

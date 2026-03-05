export type MemberFields = {
    id: string
    name: string
    phone: string
    branch: string
    points: number
    status: 'active' | 'inactive'
}

export type Filter = {
    status: string
}

export type GetMembersResponse = {
    list: MemberFields[]
    total: number
}

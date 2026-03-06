export type MemberFields = {
    id: string
    name: string
    last4?: string
    total_points: number
    milestone_score: number
    points_1_0_liter: number
    points_1_5_liter: number
    branch?: string
    status: string
    membership_number?: string
    registration_receipt_number?: string
    welcome_bonus_claimed: boolean
    registered_by_staff?: string
    created_at: string
    updated_at: string
}

export type Filter = {
    status: string
}

export type MemberListResponse = {
    members: MemberFields[]
    total: number
    page: number
    limit: number
}

export type GetMembersResponse = {
    list: MemberFields[]
    total: number
}

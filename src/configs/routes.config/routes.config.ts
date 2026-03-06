import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/dashboard/Dashboard')),
        authority: [],
    },
    {
        key: 'members',
        path: '/members',
        component: lazy(() => import('@/views/members/MemberList')),
        authority: [],
    },
    {
        key: 'branches',
        path: '/branches',
        component: lazy(() => import('@/views/branches/BranchList')),
        authority: [],
    },
    {
        key: 'products.list',
        path: '/products',
        component: lazy(() => import('@/views/products/ProductList')),
        authority: [],
    },
    {
        key: 'products.create',
        path: '/products/create',
        component: lazy(() => import('@/views/products/ProductCreate')),
        authority: [],
    },
    {
        key: 'products.edit',
        path: '/products/:id/edit',
        component: lazy(() => import('@/views/products/ProductEdit')),
        authority: [],
    },
    {
        key: 'products.categories',
        path: '/products/categories',
        component: lazy(() => import('@/views/products/CategoryList')),
        authority: [],
    },
    {
        key: 'products.branchProducts',
        path: '/products/branch-products',
        component: lazy(() => import('@/views/products/BranchProductList')),
        authority: [],
    },
    {
        key: 'products.branchProducts.create',
        path: '/products/branch-products/create',
        component: lazy(() => import('@/views/products/BranchProductCreate')),
        authority: [],
    },
    {
        key: 'stock.requisition',
        path: '/stock/requisition',
        component: lazy(() => import('@/views/stock/Requisition')),
        authority: [],
    },
    {
        key: 'stock.withdraw',
        path: '/stock/withdraw',
        component: lazy(() => import('@/views/stock/Withdraw')),
        authority: [],
    },
    {
        key: 'stock.receive',
        path: '/stock/receive',
        component: lazy(() => import('@/views/stock/Receive')),
        authority: [],
    },
    {
        key: 'stock.deduction',
        path: '/stock/deduction',
        component: lazy(() => import('@/views/stock/Deduction')),
        authority: [],
    },
    {
        key: 'broadcast',
        path: '/broadcast',
        component: lazy(() => import('@/views/broadcast/Broadcast')),
        authority: [],
    },
    {
        key: 'permissions.groups',
        path: '/permissions/groups',
        component: lazy(() => import('@/views/permissions/PermissionGroupList')),
        authority: [],
    },
    {
        key: 'permissions.groups.detail',
        path: '/permissions/groups/:id',
        component: lazy(() => import('@/views/permissions/PermissionGroupDetail')),
        authority: [],
    },
    {
        key: 'staffManagement',
        path: '/staff-management',
        component: lazy(() => import('@/views/staff-management/StaffList')),
        authority: [],
    },
    {
        key: 'staffManagement.create',
        path: '/staff-management/create',
        component: lazy(() => import('@/views/staff-management/StaffCreate')),
        authority: [],
    },
    {
        key: 'staffManagement.edit',
        path: '/staff-management/:id/edit',
        component: lazy(() => import('@/views/staff-management/StaffEdit')),
        authority: [],
    },
    ...othersRoute,
]

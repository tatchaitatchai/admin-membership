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
        authority: ['dashboard:view'],
    },
    {
        key: 'members',
        path: '/members',
        component: lazy(() => import('@/views/members/MemberList')),
        authority: ['member:view'],
    },
    {
        key: 'branches',
        path: '/branches',
        component: lazy(() => import('@/views/branches/BranchList')),
        authority: ['branch:view'],
    },
    {
        key: 'products.list',
        path: '/products',
        component: lazy(() => import('@/views/products/ProductList')),
        authority: ['product:view'],
    },
    {
        key: 'products.create',
        path: '/products/create',
        component: lazy(() => import('@/views/products/ProductCreate')),
        authority: ['product:create'],
    },
    {
        key: 'products.edit',
        path: '/products/:id/edit',
        component: lazy(() => import('@/views/products/ProductEdit')),
        authority: ['product:edit'],
    },
    {
        key: 'products.categories',
        path: '/products/categories',
        component: lazy(() => import('@/views/products/CategoryList')),
        authority: ['product:view'],
    },
    {
        key: 'products.branchProducts',
        path: '/products/branch-products',
        component: lazy(() => import('@/views/products/BranchProductList')),
        authority: ['product:view'],
    },
    {
        key: 'products.branchProducts.create',
        path: '/products/branch-products/create',
        component: lazy(() => import('@/views/products/BranchProductCreate')),
        authority: ['product:create'],
    },
    {
        key: 'promotions',
        path: '/promotions',
        component: lazy(() => import('@/views/promotions/PromotionList')),
        authority: ['promotion:view'],
    },
    {
        key: 'promotions.create',
        path: '/promotions/create',
        component: lazy(() => import('@/views/promotions/PromotionCreate')),
        authority: ['promotion:create'],
    },
    {
        key: 'promotions.edit',
        path: '/promotions/:id/edit',
        component: lazy(() => import('@/views/promotions/PromotionEdit')),
        authority: ['promotion:edit'],
    },
    {
        key: 'stock.requisition',
        path: '/stock/requisition',
        component: lazy(() => import('@/views/stock/Requisition')),
        authority: ['stock:view'],
    },
    {
        key: 'costCalculation.ingredients',
        path: '/cost/ingredients',
        component: lazy(() => import('@/views/cost/IngredientList')),
        authority: ['ingredient:view'],
    },
    {
        key: 'costCalculation.productCost',
        path: '/cost/product-cost',
        component: lazy(() => import('@/views/cost/ProductCostList')),
        authority: ['cost:view'],
    },
    {
        key: 'points.groups',
        path: '/points/groups',
        component: lazy(() => import('@/views/points/PointGroupList')),
        authority: ['point_group:view'],
    },
    {
        key: 'broadcast',
        path: '/broadcast',
        component: lazy(() => import('@/views/broadcast/Broadcast')),
        authority: ['broadcast:view'],
    },
    {
        key: 'permissions.groups',
        path: '/permissions/groups',
        component: lazy(() => import('@/views/permissions/PermissionGroupList')),
        authority: ['permission:view'],
    },
    {
        key: 'permissions.groups.detail',
        path: '/permissions/groups/:id',
        component: lazy(() => import('@/views/permissions/PermissionGroupDetail')),
        authority: ['permission:view'],
    },
    {
        key: 'staffManagement',
        path: '/staff-management',
        component: lazy(() => import('@/views/staff-management/StaffList')),
        authority: ['staff:view'],
    },
    {
        key: 'staffManagement.create',
        path: '/staff-management/create',
        component: lazy(() => import('@/views/staff-management/StaffCreate')),
        authority: ['staff:create'],
    },
    {
        key: 'staffManagement.edit',
        path: '/staff-management/:id/edit',
        component: lazy(() => import('@/views/staff-management/StaffEdit')),
        authority: ['staff:edit'],
    },
    ...othersRoute,
]

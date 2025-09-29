/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MenuListResponse } from './MenuListResponse';
export type UserDetailResponse = {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    departmentId?: number;
    departmentName?: string;
    roleId?: number;
    roleName?: string;
    token?: string;
    menulist?: Array<MenuListResponse>;
    companyId?: number;
    companyName?: string;
};


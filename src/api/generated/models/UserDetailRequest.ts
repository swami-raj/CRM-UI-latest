/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MenuRequest } from './MenuRequest';
export type UserDetailRequest = {
    id?: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId?: number;
    companyId?: number;
    roleId?: number;
    menuList?: Array<MenuRequest>;
};


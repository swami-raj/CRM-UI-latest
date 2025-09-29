/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseDtoListRoleResponse } from '../models/ResponseDtoListRoleResponse';
import type { ResponseDtoRoleResponse } from '../models/ResponseDtoRoleResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { RoleRequest } from '../models/RoleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoRoleResponse OK
     * @throws ApiError
     */
    public static updateRole(
        requestBody: RoleRequest,
    ): CancelablePromise<ResponseDtoRoleResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/role/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoRoleResponse OK
     * @throws ApiError
     */
    public static addRole(
        requestBody: RoleRequest,
    ): CancelablePromise<ResponseDtoRoleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/role/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoRoleResponse OK
     * @throws ApiError
     */
    public static getById1(
        id: number,
    ): CancelablePromise<ResponseDtoRoleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/role/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListRoleResponse OK
     * @throws ApiError
     */
    public static getAll1(): CancelablePromise<ResponseDtoListRoleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/role/get-all',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteRole(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/role/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

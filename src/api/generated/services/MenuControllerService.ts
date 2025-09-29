/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MenuListRequest } from '../models/MenuListRequest';
import type { ResponseDtoListMenuListResponse } from '../models/ResponseDtoListMenuListResponse';
import type { ResponseDtoMenuListResponse } from '../models/ResponseDtoMenuListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MenuControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoMenuListResponse OK
     * @throws ApiError
     */
    public static editMenu(
        requestBody: MenuListRequest,
    ): CancelablePromise<ResponseDtoMenuListResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/menu/edit/{id}',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoMenuListResponse OK
     * @throws ApiError
     */
    public static addMenu(
        requestBody: MenuListRequest,
    ): CancelablePromise<ResponseDtoMenuListResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/menu/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoMenuListResponse OK
     * @throws ApiError
     */
    public static getMenuById(
        id: number,
    ): CancelablePromise<ResponseDtoMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/menu/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListMenuListResponse OK
     * @throws ApiError
     */
    public static getAllMenus(): CancelablePromise<ResponseDtoListMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/menu/get-all',
        });
    }
    /**
     * @returns ResponseDtoListMenuListResponse OK
     * @throws ApiError
     */
    public static getAllMenusWithSubmenus(): CancelablePromise<ResponseDtoListMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/menu/get-all-menus-with-submenus',
        });
    }
}

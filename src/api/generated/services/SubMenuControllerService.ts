/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseDtoListSubMenuListResponse } from '../models/ResponseDtoListSubMenuListResponse';
import type { ResponseDtoSubMenuListResponse } from '../models/ResponseDtoSubMenuListResponse';
import type { SubMenuListRequest } from '../models/SubMenuListRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubMenuControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoSubMenuListResponse OK
     * @throws ApiError
     */
    public static editSubMenu(
        requestBody: SubMenuListRequest,
    ): CancelablePromise<ResponseDtoSubMenuListResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sub-menu/edit/{id}',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoSubMenuListResponse OK
     * @throws ApiError
     */
    public static addSubMenu(
        requestBody: SubMenuListRequest,
    ): CancelablePromise<ResponseDtoSubMenuListResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sub-menu/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoSubMenuListResponse OK
     * @throws ApiError
     */
    public static getSubMenuById(
        id: number,
    ): CancelablePromise<ResponseDtoSubMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sub-menu/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param menuId
     * @returns ResponseDtoListSubMenuListResponse OK
     * @throws ApiError
     */
    public static getSubmenuByMenu(
        menuId: number,
    ): CancelablePromise<ResponseDtoListSubMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sub-menu/get-subMenu-by-menu',
            query: {
                'menuId': menuId,
            },
        });
    }
    /**
     * @returns ResponseDtoListSubMenuListResponse OK
     * @throws ApiError
     */
    public static getAllSubMenu(): CancelablePromise<ResponseDtoListSubMenuListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sub-menu/get-all',
        });
    }
}

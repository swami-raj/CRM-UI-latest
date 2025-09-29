/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DepartmentRequest } from '../models/DepartmentRequest';
import type { ResponseDtoDepartmentResponse } from '../models/ResponseDtoDepartmentResponse';
import type { ResponseDtoListDepartmentResponse } from '../models/ResponseDtoListDepartmentResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DepartmentControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoDepartmentResponse OK
     * @throws ApiError
     */
    public static updateDepartment(
        requestBody: DepartmentRequest,
    ): CancelablePromise<ResponseDtoDepartmentResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/department/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoDepartmentResponse OK
     * @throws ApiError
     */
    public static addDepartment(
        requestBody: DepartmentRequest,
    ): CancelablePromise<ResponseDtoDepartmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/department/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoDepartmentResponse OK
     * @throws ApiError
     */
    public static getById2(
        id: number,
    ): CancelablePromise<ResponseDtoDepartmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/department/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListDepartmentResponse OK
     * @throws ApiError
     */
    public static getAll2(): CancelablePromise<ResponseDtoListDepartmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/department/get-all',
        });
    }
    /**
     * @returns ResponseDtoListDepartmentResponse OK
     * @throws ApiError
     */
    public static getAllDepartment(): CancelablePromise<ResponseDtoListDepartmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/department/get-all-super-admin',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteDepartment(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/department/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanyRequest } from '../models/CompanyRequest';
import type { ResponseDtoCompanyResponse } from '../models/ResponseDtoCompanyResponse';
import type { ResponseDtoListCompanyResponse } from '../models/ResponseDtoListCompanyResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanyControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoCompanyResponse OK
     * @throws ApiError
     */
    public static updateDepartment2(
        requestBody: CompanyRequest,
    ): CancelablePromise<ResponseDtoCompanyResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/company/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoCompanyResponse OK
     * @throws ApiError
     */
    public static addCompany(
        requestBody: CompanyRequest,
    ): CancelablePromise<ResponseDtoCompanyResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/company/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoCompanyResponse OK
     * @throws ApiError
     */
    public static getById5(
        id: number,
    ): CancelablePromise<ResponseDtoCompanyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/company/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListCompanyResponse OK
     * @throws ApiError
     */
    public static getAll5(): CancelablePromise<ResponseDtoListCompanyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/company/get-all',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteDepartment2(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/company/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountryRequest } from '../models/CountryRequest';
import type { ResponseDtoCountryResponse } from '../models/ResponseDtoCountryResponse';
import type { ResponseDtoListCountryResponse } from '../models/ResponseDtoListCountryResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CountryControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoCountryResponse OK
     * @throws ApiError
     */
    public static updateDepartment1(
        requestBody: CountryRequest,
    ): CancelablePromise<ResponseDtoCountryResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/country/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoCountryResponse OK
     * @throws ApiError
     */
    public static addCountry(
        requestBody: CountryRequest,
    ): CancelablePromise<ResponseDtoCountryResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/country/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoCountryResponse OK
     * @throws ApiError
     */
    public static getById3(
        id: number,
    ): CancelablePromise<ResponseDtoCountryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/country/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListCountryResponse OK
     * @throws ApiError
     */
    public static getAll3(): CancelablePromise<ResponseDtoListCountryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/country/get-all',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteDepartment1(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/country/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

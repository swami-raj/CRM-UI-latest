/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountrySubscriptionRequest } from '../models/CountrySubscriptionRequest';
import type { ResponseDtoCountrySubscriptionResponse } from '../models/ResponseDtoCountrySubscriptionResponse';
import type { ResponseDtoListCountrySubscriptionResponse } from '../models/ResponseDtoListCountrySubscriptionResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CountrySubscriptionControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoCountrySubscriptionResponse OK
     * @throws ApiError
     */
    public static updateCountrySubscription(
        requestBody: CountrySubscriptionRequest,
    ): CancelablePromise<ResponseDtoCountrySubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/country-subscription/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoCountrySubscriptionResponse OK
     * @throws ApiError
     */
    public static addCountrySubscription(
        requestBody: CountrySubscriptionRequest,
    ): CancelablePromise<ResponseDtoCountrySubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/country-subscription/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoCountrySubscriptionResponse OK
     * @throws ApiError
     */
    public static getById4(
        id: number,
    ): CancelablePromise<ResponseDtoCountrySubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/country-subscription/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListCountrySubscriptionResponse OK
     * @throws ApiError
     */
    public static getAll4(): CancelablePromise<ResponseDtoListCountrySubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/country-subscription/get-all',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteCountrySubscription(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/country-subscription/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

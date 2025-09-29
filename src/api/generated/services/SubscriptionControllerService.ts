/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseDtoListSubscriptionResponse } from '../models/ResponseDtoListSubscriptionResponse';
import type { ResponseDtoString } from '../models/ResponseDtoString';
import type { ResponseDtoSubscriptionResponse } from '../models/ResponseDtoSubscriptionResponse';
import type { SubscriptionRequest } from '../models/SubscriptionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoSubscriptionResponse OK
     * @throws ApiError
     */
    public static updateSubscription(
        requestBody: SubscriptionRequest,
    ): CancelablePromise<ResponseDtoSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/subscription/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoSubscriptionResponse OK
     * @throws ApiError
     */
    public static addSubscription(
        requestBody: SubscriptionRequest,
    ): CancelablePromise<ResponseDtoSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscription/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoSubscriptionResponse OK
     * @throws ApiError
     */
    public static getById(
        id: number,
    ): CancelablePromise<ResponseDtoSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscription/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListSubscriptionResponse OK
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<ResponseDtoListSubscriptionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscription/get-all',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoString OK
     * @throws ApiError
     */
    public static deleteSubscription(
        id: number,
    ): CancelablePromise<ResponseDtoString> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/subscription/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}

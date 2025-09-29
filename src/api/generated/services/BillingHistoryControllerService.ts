/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingHistoryRequest } from '../models/BillingHistoryRequest';
import type { ResponseDtoBillingHistoryResponse } from '../models/ResponseDtoBillingHistoryResponse';
import type { ResponseDtoListBillingHistoryResponse } from '../models/ResponseDtoListBillingHistoryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BillingHistoryControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoBillingHistoryResponse OK
     * @throws ApiError
     */
    public static updateBillingHistory(
        requestBody: BillingHistoryRequest,
    ): CancelablePromise<ResponseDtoBillingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/billing-history/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoBillingHistoryResponse OK
     * @throws ApiError
     */
    public static addBillingHistory(
        requestBody: BillingHistoryRequest,
    ): CancelablePromise<ResponseDtoBillingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/billing-history/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ResponseDtoBillingHistoryResponse OK
     * @throws ApiError
     */
    public static getById6(
        id: number,
    ): CancelablePromise<ResponseDtoBillingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/billing-history/get-by-id/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ResponseDtoListBillingHistoryResponse OK
     * @throws ApiError
     */
    public static getAll6(): CancelablePromise<ResponseDtoListBillingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/billing-history/get-all',
        });
    }
}

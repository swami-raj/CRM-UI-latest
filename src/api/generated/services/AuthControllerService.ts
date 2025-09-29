/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseDtoUserDetailResponse } from '../models/ResponseDtoUserDetailResponse';
import type { UserDetailRequest } from '../models/UserDetailRequest';
import type { UserLoginRequest } from '../models/UserLoginRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthControllerService {
    /**
     * @param requestBody
     * @returns ResponseDtoUserDetailResponse OK
     * @throws ApiError
     */
    public static signup(
        requestBody: UserDetailRequest,
    ): CancelablePromise<ResponseDtoUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ResponseDtoUserDetailResponse OK
     * @throws ApiError
     */
    public static login(
        requestBody: UserLoginRequest,
    ): CancelablePromise<ResponseDtoUserDetailResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}

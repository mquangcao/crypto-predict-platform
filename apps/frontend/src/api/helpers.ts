"use client";
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  QueryClient,
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { z, ZodError } from "zod";
import { client } from "./axios";

interface EnhancedMutationParams<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> extends Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn" | "onSuccess" | "onError" | "onSettled"
> {
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext,
    queryClient: QueryClient,
  ) => unknown;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => unknown;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => unknown;
}

/**
 * Create a URL with query parameters and route parameters
 *
 * @param base - The base URL with route parameters
 * @param queryParams - The query parameters
 * @param routeParams - The route parameters
 * @returns The URL with query parameters
 * @example
 * createUrl('/api/users/:id', { page: 1 }, { id: 1 });
 * // => '/api/users/1?page=1'
 */
function createUrl(
  base: string,
  queryParams?: Record<string, string | number | undefined>,
  routeParams?: Record<string, string | number | undefined>,
) {
  const url = Object.entries(routeParams ?? {}).reduce(
    (acc, [key, value]) => acc.replaceAll(`:${key}`, String(value)),
    base,
  );

  if (!queryParams) {
    return url;
  }

  const query = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.append(key, String(value));
  });

  return `${url}?${query.toString()}`;
}

type QueryKey =
  | [string]
  | [string, Record<string, string | number | undefined>];

function getQueryKey(
  queryKey: QueryKey,
  route: Record<string, string | number | undefined> = {},
  query: Record<string, string | number | undefined> = {},
) {
  const [mainKey, otherKeys = {}] = queryKey;

  return [mainKey, { ...otherKeys, ...route, ...query }];
}

/** Handle request errors */
function handleRequestError(error: unknown) {
  if (isAxiosError(error)) {
    throw error.response?.data;
  }

  if (error instanceof ZodError) {
    console.error(error.format());
  }

  console.error(error);

  throw error;
}

/* ----------------------------------- GET ---------------------------------- */

interface CreateGetQueryHookArgs<ResponseSchema extends z.ZodType> {
  /** The endpoint for the GET request */
  endpoint: string;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The query parameters for the react-query hook */
  rQueryParams: Omit<UndefinedInitialDataOptions, "queryFn" | "queryKey"> & {
    queryKey: QueryKey;
  };
}

/**
 * Create a custom hook for performing GET requests with react-query and Zod validation
 *
 * @example
 * const useGetUser = createGetQueryHook<typeof userSchema, { id: string }>({
 *   endpoint: '/api/users/:id',
 *   responseSchema: userSchema,
 *   rQueryParams: { queryKey: ['getUser'] },
 * });
 *
 * const { data, error } = useGetUser({ route: { id: 1 } });
 */
export function createGetQueryHook<
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  responseSchema,
  rQueryParams,
}: CreateGetQueryHookArgs<ResponseSchema>) {
  const queryFn = async (params?: {
    query?: QueryParams;
    route?: RouteParams;
  }) => {
    const url = createUrl(endpoint, params?.query, params?.route);
    return client
      .get(url)
      .then((response) => responseSchema.parse(response.data))
      .catch((error) => {
        console.warn("Error fetching", url);
        handleRequestError(error);
      });
  };

  return (params?: {
    query?: QueryParams;
    route?: RouteParams;
    options?: Omit<UndefinedInitialDataOptions, "queryFn" | "queryKey">;
  }) =>
    useQuery({
      ...rQueryParams,
      ...(params?.options || {}),
      queryKey: getQueryKey(
        rQueryParams.queryKey,
        params?.route,
        params?.query,
      ),
      queryFn: () => queryFn(params),
    }) as UseQueryResult<z.infer<ResponseSchema>>;
}

/* ---------------------------------- POST ---------------------------------- */

interface CreatePostMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the POST request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<
    z.infer<ResponseSchema>,
    Error,
    z.infer<BodySchema>
  >;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing POST requests with react-query and Zod validation
 *
 * @example
 * const useCreateUser = createPostMutationHook({
 *  endpoint: '/api/users',
 *  bodySchema: createUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPostMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: CreatePostMutationHookArgs<BodySchema, ResponseSchema>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    type MutationVariables = {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    };

    const mutationFn = async ({
      variables,
      route,
      query,
    }: MutationVariables) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;

      return client
        .post(url, bodySchema.parse(variables), config)
        .then((response) => responseSchema.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data: any, vars: any, context: any) =>
        rMutationParams?.onSuccess?.(
          data,
          vars.variables,
          context,
          queryClient,
        ),
      onError: (error: any, vars: any, context: any) =>
        rMutationParams?.onError?.(error, vars.variables, context, queryClient),
      onSettled: (data: any, error: any, vars: any, context: any) =>
        rMutationParams?.onSettled?.(
          data,
          error,
          vars.variables,
          context,
          queryClient,
        ),
    } as any);
  };
}

/* ----------------------------------- PUT ---------------------------------- */

interface CreatePutMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the PUT request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<
    z.infer<ResponseSchema>,
    Error,
    z.infer<BodySchema>
  >;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing PUT requests with react-query and Zod validation
 *
 * @example
 * const useUpdateUser = createPutMutationHook<typeof updateUserSchema, typeof userSchema, { id: string }>({
 *  endpoint: '/api/users/:id',
 *  bodySchema: updateUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPutMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: CreatePutMutationHookArgs<BodySchema, ResponseSchema>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    type MutationVariables = {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    };

    const mutationFn = async ({
      variables,
      route,
      query,
    }: MutationVariables) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;

      return client
        .put(url, bodySchema.parse(variables), config)
        .then((response) => responseSchema.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data: any, vars: any, context: any) =>
        rMutationParams?.onSuccess?.(
          data,
          vars.variables,
          context,
          queryClient,
        ),
      onError: (error: any, vars: any, context: any) =>
        rMutationParams?.onError?.(error, vars.variables, context, queryClient),
      onSettled: (data: any, error: any, vars: any, context: any) =>
        rMutationParams?.onSettled?.(
          data,
          error,
          vars.variables,
          context,
          queryClient,
        ),
    } as any);
  };
}

/* ---------------------------------- PATCH --------------------------------- */

interface CreatePatchMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the PATCH request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<
    z.infer<ResponseSchema>,
    Error,
    z.infer<BodySchema>
  >;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing PATCH requests with react-query and Zod validation
 *
 * @example
 * const usePartialUpdateUser = createPatchMutationHook({
 *  endpoint: '/api/users/:id',
 *  bodySchema: updateUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPatchMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: CreatePatchMutationHookArgs<BodySchema, ResponseSchema>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    type MutationVariables = {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    };

    const mutationFn = async ({
      variables,
      route,
      query,
    }: MutationVariables) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;

      return client
        .patch(url, bodySchema.parse(variables), config)
        .then((response) => responseSchema.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data: any, vars: any, context: any) =>
        rMutationParams?.onSuccess?.(
          data,
          vars.variables,
          context,
          queryClient,
        ),
      onError: (error: any, vars: any, context: any) =>
        rMutationParams?.onError?.(error, vars.variables, context, queryClient),
      onSettled: (data: any, error: any, vars: any, context: any) =>
        rMutationParams?.onSettled?.(
          data,
          error,
          vars.variables,
          context,
          queryClient,
        ),
    } as any);
  };
}

/* --------------------------------- DELETE --------------------------------- */

interface CreateDeleteMutationHookArgs<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> {
  /** The endpoint for the DELETE request */
  endpoint: string;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<TData, TError, TVariables, TContext>;
}

/**
 * Create a custom hook for performing DELETE requests with react-query
 *
 * @example
 * const useDeleteUser = createDeleteMutationHook<typeof userSchema, { id: string }>({
 *  endpoint: '/api/users/:id',
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createDeleteMutationHook<
  ModelSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  rMutationParams,
}: CreateDeleteMutationHookArgs<
  z.infer<ModelSchema>,
  Error,
  z.infer<ModelSchema>
>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    type MutationVariables = {
      model: z.infer<ModelSchema>;
      query?: QueryParams;
      route?: RouteParams;
    };

    const mutationFn = async ({ model, route, query }: MutationVariables) => {
      const url = createUrl(baseUrl, query, route);
      return client
        .delete(url)
        .then(() => model)
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data: any, vars: any, context: any) =>
        rMutationParams?.onSuccess?.(data, vars.model, context, queryClient),
      onError: (error: any, vars: any, context: any) =>
        rMutationParams?.onError?.(error, vars.model, context, queryClient),
      onSettled: (data: any, error: any, vars: any, context: any) =>
        rMutationParams?.onSettled?.(
          data,
          error,
          vars.model,
          context,
          queryClient,
        ),
    } as any);
  };
}

import { toast } from "sonner";
import { z } from "zod";
import { BaseResponseSchema } from "@/api/common";
import {
  ChangePasswordDtoSchema,
  UpdateAccountDtoSchema,
} from "@/api/dtos/account";
import { User } from "@/api/entities";
import {
  createGetQueryHook,
  createPostMutationHook,
  createPutMutationHook,
} from "@/api/helpers";

const QUERY_KEY = "account";
const BASE_ENDPOINT = "/user/me";

export const useGetAccountInfo = createGetQueryHook({
  endpoint: `${BASE_ENDPOINT}`,
  responseSchema: BaseResponseSchema(User),
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useUpdateAccount = createPutMutationHook({
  endpoint: `${BASE_ENDPOINT}`,
  bodySchema: UpdateAccountDtoSchema,
  responseSchema: BaseResponseSchema(User),
  rMutationParams: {
    onSuccess: (_data, _variables, _context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  },
});

export const useChangePassword = createPostMutationHook({
  endpoint: `${BASE_ENDPOINT}/change-password`,
  bodySchema: ChangePasswordDtoSchema,
  responseSchema: z.any(),
  rMutationParams: {
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
  },
});

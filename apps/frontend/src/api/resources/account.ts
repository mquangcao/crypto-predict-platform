import { checkClientAccessToken, client } from '../axios';
import { BaseResponseSchema } from '../common';
import { User } from '../entities';

export async function getAccountInfo(): Promise<User> {
  checkClientAccessToken();

  const response = await client.get('account/me');
  const validatedResponse = BaseResponseSchema(User).parse(response.data);
  return validatedResponse.data;
}

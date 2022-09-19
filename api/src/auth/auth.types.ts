import { IAccountTransformed } from "src/account/account.types";

export interface IAuthResponse {
  account: IAccountTransformed;
  token: string;
}
import { AxiosError } from "axios";

export type ApiResponse<T> = {
  data: T;
  error: AxiosError<T, unknown> | null;
};

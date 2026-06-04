import { AxiosError } from "axios";

export type PaginationResponseType = {
  totalPage: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiResponse<T> = {
  data: T;
  error: AxiosError<T, unknown> | null;
};

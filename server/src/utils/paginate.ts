type PaginateInput<T> = {
  items: T[];
  total: number;
  page?: number;
  itemsPerPage?: number;
};

export function paginateResponse<T>({
  items,
  total,
  page = 1,
  itemsPerPage = 10,
}: PaginateInput<T>) {
  const totalItems = total;
  const totalPage = Math.ceil(totalItems / itemsPerPage);
  //   const paginatedData = items?.slice(
  //     (page - 1) * itemsPerPage,
  //     page * itemsPerPage,
  //   );

  return {
    items,
    pagination: {
      totalPage,
      currentPage: page,
      totalItems,
      itemsPerPage,
      hasNextPage: page !== totalPage,
      hasPreviousPage: page !== 1,
    },
  };
}

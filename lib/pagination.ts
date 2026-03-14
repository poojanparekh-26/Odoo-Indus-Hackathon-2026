export async function getPaginatedData<T>(
  model: any,
  page = 1,
  perPage = 20,
  where = {},
  include = {}
) {
  const skip = (page - 1) * perPage;
  const take = perPage;

  const [total, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      include,
      skip,
      take,
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return {
    data: data as T[],
    total,
    page,
    totalPages,
  };
}

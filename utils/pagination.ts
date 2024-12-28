// utils/pagination.ts
type PaginationParams = {
  page?: number;
  limit?: number;
};

type PaginationResult<T> = {
  count: number;
  pages: number;
  currentPage: number;
  data: T[];
};

export async function paginate<T>(
  model: any, // Prisma model
  params: PaginationParams,
  filter: object = {},
  include: object = {}, // Include parameter for related data
  orderBy: object = { createdAt: 'desc' } // Default ordering by createdAt
): Promise<PaginationResult<T>> {
  const { page = 1, limit = 10 } = params;

  const offset = (page - 1) * limit;

  const [data, count] = await Promise.all([
    model.findMany({
      where: filter,
      skip: offset,
      take: limit,
      include, // Include related data
      orderBy,
    }),
    model.count({ where: filter }),
  ]);

  return {
  count,
  pages: Math.ceil(count / limit),
  currentPage: page,
  data,

  };
}
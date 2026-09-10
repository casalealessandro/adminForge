export interface ListQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  order: 'asc' | 'desc';
  offset: number;
}

export function parseListQuery(
  query: Record<string, unknown>,
  allowedSorts: readonly string[],
  defaultSort: string,
): ListQuery {
  const rawPage = Number(query.page ?? 1);
  const rawPageSize = Number(query.pageSize ?? 20);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 100) : 20;
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 200) : '';
  const requestedSort = typeof query.sort === 'string' ? query.sort : defaultSort;
  const sort = allowedSorts.includes(requestedSort) ? requestedSort : defaultSort;
  const order = query.order === 'desc' ? 'desc' : 'asc';

  return { page, pageSize, search, sort, order, offset: (page - 1) * pageSize };
}

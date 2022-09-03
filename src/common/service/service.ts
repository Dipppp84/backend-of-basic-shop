import { sendBadRequest } from '../utils/handler-error';

/**checking and processing values */
export async function commonFindAll(
  limit: number,
  skip: number,
  sortKey: string,
  sortingOrder: number,
): Promise<{ resLimit: number; resSkip: number; sort: any }> {
  if (isNaN((limit = +limit)) || isNaN((skip = +skip)))
    sendBadRequest('limit and skip must be numbers');
  if (limit === 0 || limit > 100)
    sendBadRequest("limit mustn't be 0 or be more 100");

  sortingOrder = +sortingOrder;
  if (!(sortingOrder === 1 || sortingOrder === -1))
    sendBadRequest(`Invalid value sortKey: ${sortingOrder}`);
  const sort = {};
  sort[sortKey] = sortingOrder;
  return { resLimit: limit, resSkip: skip, sort: sort };
}

import productsHandler from '../products';

export default async function handler(req: any, res: any) {
  if (!req.query) req.query = {};
  if (!req.query.id && req.params?.id) {
    req.query.id = req.params.id;
  }
  return productsHandler(req, res);
}

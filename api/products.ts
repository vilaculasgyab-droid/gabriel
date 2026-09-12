import { Request, Response } from 'express';
import { handleGetProducts, handleCreateProduct } from '../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return handleGetProducts(req, res);
  } else if (req.method === 'POST') {
    return handleCreateProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}

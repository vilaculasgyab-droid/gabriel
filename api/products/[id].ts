import { Request, Response } from 'express';
import { handleGetProductById, handleUpdateProduct, handleDeleteProduct } from '../../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return handleGetProductById(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateProduct(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}

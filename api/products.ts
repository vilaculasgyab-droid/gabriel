import { Request, Response } from 'express';
import {
  handleGetProducts,
  handleGetProductById,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
} from '../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  const queryId = req.query?.id as string | undefined;

  if (queryId) {
    if (req.method === 'GET') {
      return handleGetProductById(req, res);
    } else if (req.method === 'PUT') {
      return handleUpdateProduct(req, res);
    } else if (req.method === 'DELETE') {
      return handleDeleteProduct(req, res);
    }
  }

  if (req.method === 'GET') {
    return handleGetProducts(req, res);
  } else if (req.method === 'POST') {
    return handleCreateProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}


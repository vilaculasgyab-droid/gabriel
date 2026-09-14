import { Request, Response } from 'express';
import {
  handleGetProducts,
  handleGetProductById,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
} from '../../server/apiHandlers';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }

  const queryId = req.query?.id as string | undefined;

  if (queryId) {
    if (req.method === 'GET') {
      return await handleGetProductById(req, res);
    } else if (req.method === 'PUT') {
      return await handleUpdateProduct(req, res);
    } else if (req.method === 'DELETE') {
      return await handleDeleteProduct(req, res);
    }
  }

  if (req.method === 'GET') {
    return await handleGetProducts(req, res);
  } else if (req.method === 'POST') {
    return await handleCreateProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}

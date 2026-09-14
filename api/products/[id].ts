import { Request, Response } from 'express';
import { handleGetProductById, handleUpdateProduct, handleDeleteProduct } from '../../server/apiHandlers';

export default async function handler(req: Request, res: Response) {
  // Configurar cabeçalhos CORS e no-cache para a API de produto individual
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  // Normalizar id para compatibilidade com Vercel Serverless Functions
  if (req.query?.id && (!req.params || !req.params.id)) {
    req.params = { ...(req.params || {}), id: req.query.id as string };
  }

  if (req.method === 'GET') {
    return await handleGetProductById(req, res);
  } else if (req.method === 'PUT') {
    return await handleUpdateProduct(req, res);
  } else if (req.method === 'DELETE') {
    return await handleDeleteProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}


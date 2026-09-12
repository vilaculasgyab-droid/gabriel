import { Request, Response } from 'express';
import { handleGetOrders, handleCreateOrder } from '../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return handleGetOrders(req, res);
  } else if (req.method === 'POST') {
    return handleCreateOrder(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}

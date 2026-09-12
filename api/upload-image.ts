import { Request, Response } from 'express';
import { handleUploadImage } from '../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    return handleUploadImage(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}

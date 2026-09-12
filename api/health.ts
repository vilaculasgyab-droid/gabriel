import { Request, Response } from 'express';
import { handleHealthCheck } from '../server/apiHandlers';

export default function handler(req: Request, res: Response) {
  return handleHealthCheck(req, res);
}

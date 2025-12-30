import { Response } from 'express';

export const success = (res: Response, data: any = {}, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const fail = (res: Response, message = 'Request failed', status = 400, data: any = {}) => {
  return res.status(status).json({ success: false, message, data });
};
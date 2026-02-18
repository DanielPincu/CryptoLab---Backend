import type { RequestHandler, Request, Response, NextFunction } from 'express';
import type Joi from 'joi';

export const validateBody = (schema: Joi.ObjectSchema): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details[0].message });
  req.body = value;
  next();
};
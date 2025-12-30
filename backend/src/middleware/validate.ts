import Joi, { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { fail } from '../utils/responses.js';

export type SchemaKey = 'register' | 'login' | 'user' | 'project' | 'task';

const validate = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

export const schemas: Record<SchemaKey, ObjectSchema> = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  user: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'member').required(),
  }),
  project: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
  }),
  task: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('todo', 'in_progress', 'done').required(),
  }),
};

export default validate;

export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 'Validation failed', 400, { errors: errors.array() });
  }
  next();
};

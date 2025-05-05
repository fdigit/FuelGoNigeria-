import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  };
};

// Common validation rules
export const authValidation = {
  register: [
    {
      field: 'name',
      rules: ['required', 'trim', 'isLength({ min: 2 })'],
      message: 'Name must be at least 2 characters long',
    },
    {
      field: 'email',
      rules: ['required', 'trim', 'isEmail'],
      message: 'Please provide a valid email address',
    },
    {
      field: 'password',
      rules: ['required', 'isLength({ min: 6 })'],
      message: 'Password must be at least 6 characters long',
    },
    {
      field: 'phone',
      rules: ['required', 'trim', 'matches(/^[0-9]{11}$/)'],
      message: 'Please provide a valid 11-digit phone number',
    },
  ],
  login: [
    {
      field: 'email',
      rules: ['required', 'trim', 'isEmail'],
      message: 'Please provide a valid email address',
    },
    {
      field: 'password',
      rules: ['required'],
      message: 'Password is required',
    },
  ],
  resetPassword: [
    {
      field: 'password',
      rules: ['required', 'isLength({ min: 6 })'],
      message: 'Password must be at least 6 characters long',
    },
  ],
}; 
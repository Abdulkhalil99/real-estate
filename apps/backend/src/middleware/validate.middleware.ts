import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Validate req.body against a Zod schema
// Usage: router.post('/login', validate(loginSchema), authController.login)
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // parse() throws if validation fails
      // It also transforms the data (e.g. trims whitespace, converts types)
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a clean, readable list
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(422).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}
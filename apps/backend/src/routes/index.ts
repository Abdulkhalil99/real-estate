import { Router } from 'express';
import authRoutes     from './auth.routes';
import propertyRoutes from './property.routes';
import inquiryRoutes  from './inquiry.routes';
import { CONSTANTS }  from '../config/constants';

const router = Router();

router.use('/auth',       authRoutes);
router.use('/properties', propertyRoutes);
router.use('/inquiries',  inquiryRoutes);

router.get('/', (_req, res) => {
  res.json({
    name:    'Real Estate Platform API',
    version: '1.0.0',
    prefix:  CONSTANTS.API_PREFIX,
    endpoints: {
      auth:        `${CONSTANTS.API_PREFIX}/auth`,
      properties:  `${CONSTANTS.API_PREFIX}/properties`,
      inquiries:   `${CONSTANTS.API_PREFIX}/inquiries`,
    },
  });
});

export default router;

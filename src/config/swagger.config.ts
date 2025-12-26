import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import { Express } from 'express';

const swaggerDocument = yaml.load(path.join(__dirname, '../docs/openapi.yaml'));

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('[INFO] Swagger documentation available at /api-docs');
};

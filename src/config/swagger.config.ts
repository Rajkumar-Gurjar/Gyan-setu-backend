import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GyanSetu API',
      version: '1.0.0',
      description: 'API specification for the GyanSetu digital learning platform.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'schoolCode'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            language: { type: 'string', enum: ['pa', 'hi', 'en'], default: 'pa' },
            schoolCode: { type: 'string' },
            class: { type: 'number' },
            section: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
            user: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        Quiz: {
          type: 'object',
          properties: {
            title: { $ref: '#/components/schemas/MultilingualString' },
            subject: { type: 'string' },
            class: { type: 'number' },
            questions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Question' },
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['multiple_choice', 'true_false', 'fill_blank', 'image_choice'],
            },
            question: { $ref: '#/components/schemas/MultilingualString' },
            points: { type: 'integer' },
          },
        },
        MultilingualString: {
          type: 'object',
          properties: {
            pa: { type: 'string' },
            hi: { type: 'string' },
            en: { type: 'string' },
          },
        },
        Lesson: {
          type: 'object',
          required: ['lessonId', 'title', 'subject', 'grade', 'duration', 'instructor'],
          properties: {
            lessonId: { type: 'string' },
            title: { type: 'string' },
            subject: { type: 'string' },
            grade: { type: 'number' },
            duration: { type: 'number' },
            description: { type: 'string' },
            instructor: { type: 'string' },
            content: { $ref: '#/components/schemas/LessonContent' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        LessonContent: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            videoKey: { type: 'string' },
            videoDuration: { type: 'number' },
            body: { type: 'object', additionalProperties: { type: 'string' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/controller/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger Page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('[INFO] Swagger documentation available at http://localhost:3000/api-docs');
};
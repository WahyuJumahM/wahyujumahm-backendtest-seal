import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AdonisJS Swagger API',
      version: '1.0.0',
      description: 'Dokumentasi API Chatbot dengan Swagger + Basic Auth (wahyu-test-seal)',
    },
    servers: [
      {
        url: 'http://localhost:3333/',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
    },
    security: [
      {
        basicAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../Controllers/Http/ChatbotController.ts')],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec

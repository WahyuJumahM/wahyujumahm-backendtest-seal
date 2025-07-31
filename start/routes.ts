import Route from '@ioc:Adonis/Core/Route'
import fs from 'fs'
import path from 'path'
import swaggerSpec from 'App/Services/Swagger'

Route.get('/docs/json', async ({ response }) => {
  return response.header('Content-Type', 'application/json').send(swaggerSpec)
})

Route.get('/docs', async ({ response }) => {
  const html = fs.readFileSync(path.join(__dirname, '../resources/views/swagger.html'), 'utf8')
  return response.header('Content-Type', 'text/html').send(html)
})

// Root endpoint
Route.get('/', async () => {
  return {
    message: 'Chatbot API is running!',
    version: '1.0.0',
    endpoints: {
      'POST /questions': 'Send a question to the chatbot',
      'GET /conversations': 'Get all conversations (requires auth)',
      'GET /conversations/:id': 'Get messages from a conversation (requires auth)',
      'DELETE /conversations/:id': 'Delete a conversation (requires auth)',
      'DELETE /conversations/:conversationId/messages/:messageId': 'Delete a message (requires auth)'

    }
  }
})

// Public routes
Route.post('/questions', 'ChatbotController.sendQuestion')

// Protected routes (require Basic Auth middleware)
Route.group(() => {
  Route.get('/conversations', 'ChatbotController.getConversations')
  Route.get('/conversations/:id', 'ChatbotController.getConversationMessages')
  Route.delete('/conversations/:id', 'ChatbotController.deleteConversation')
  Route.delete('/conversations/:conversationId/messages/:messageId', 'ChatbotController.deleteMessage')
}).middleware('basicAuth')

// Health check
Route.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

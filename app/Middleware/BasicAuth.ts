import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class BasicAuth {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const authHeader = request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return response.status(401).json({
        error: 'Unauthorized',
        message: 'Basic authentication required'
      })
    }

    try {
      const base64Credentials = authHeader.slice(6)
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
      const [username, password] = credentials.split(':')

      const validUsername = Env.get('API_USERNAME')
      const validPassword = Env.get('API_PASSWORD')

      if (username !== validUsername || password !== validPassword) {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials'
        })
      }

      await next()
    } catch (error) {
      return response.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication format'
      })
    }
  }
}

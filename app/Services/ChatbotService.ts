import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ChatbotService {
  private baseUrl: string

  constructor() {
    this.baseUrl = Env.get('EXTERNAL_API_URL')
  }

  public async sendMessage(question: string, sessionId: string, additionalContext?: string): Promise<any> {
    try {
      const payload = {
        question: question,
        session_id: sessionId,
        additional_context: additionalContext || ""
      }

      Logger.info('Sending request to external API:', { url: this.baseUrl, payload })

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      })

      Logger.info('External API Response:', response.data)
      return response.data
    } catch (error) {
      Logger.error('External API Error:', error.message)

      if (error.response) {
        Logger.error('Error Response Status:', error.response.status)
        Logger.error('Error Response Data:', error.response.data)
        throw new Error(`External API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`)
      } else if (error.request) {
        Logger.error('No response received from external API')
        throw new Error('External API is not responding')
      } else {
        Logger.error('Request setup error:', error.message)
        throw new Error(`Request setup error: ${error.message}`)
      }
    }
  }
}

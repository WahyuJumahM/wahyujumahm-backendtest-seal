import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuidv4 } from 'uuid'
import Conversation from 'App/Models/Conversation'
import Message from 'App/Models/Message'
import ChatbotService from 'App/Services/ChatbotService'
import QuestionValidator from 'App/Validators/QuestionValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ChatbotController {
  private chatbotService: ChatbotService

  constructor() {
    this.chatbotService = new ChatbotService()
  }

  /**
   * @openapi
   * /questions:
   *   post:
   *     summary: Kirim pertanyaan ke chatbot
   *     tags:
   *       - Chatbot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - question
   *             properties:
   *               session_id:
   *                 type: string
   *               question:
   *                 type: string
   *               additional_context:
   *                 type: string
   *     responses:
   *       200:
   *         description: Jawaban dari chatbot
   */
  public async sendQuestion({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()

    try {
      const payload = await request.validate(QuestionValidator)
      const sessionId = payload.session_id || uuidv4()

      let conversation = await Conversation.query({ client: trx })
        .where('session_id', sessionId)
        .first()

      if (!conversation) {
        conversation = await Conversation.create(
          {
            sessionId: sessionId,
            lastMessage: payload.question,
          },
          { client: trx }
        )
      } else {
        conversation.lastMessage = payload.question
        await conversation.save()
      }

      const userMessage = await Message.create(
        {
          conversationId: conversation.id,
          senderType: 'user',
          message: payload.question,
        },
        { client: trx }
      )

      const externalResponse = await this.chatbotService.sendMessage(
        payload.question,
        sessionId,
        payload.additional_context
      )

      let botResponseText = 'Sorry, I could not process your request.'

      if (externalResponse?.data?.message && Array.isArray(externalResponse.data.message)) {
        const firstMessage = externalResponse.data.message[0]
        if (firstMessage?.text) {
          botResponseText = firstMessage.text
        }
      } else if (externalResponse?.response) {
        botResponseText = externalResponse.response
      } else if (externalResponse?.message) {
        botResponseText = externalResponse.message
      }

      const botMessage = await Message.create(
        {
          conversationId: conversation.id,
          senderType: 'bot',
          message: botResponseText,
        },
        { client: trx }
      )

      conversation.lastMessage = botResponseText
      await conversation.save()

      await trx.commit()

      return response.status(200).json({
        success: true,
        data: {
          session_id: sessionId,
          conversation_id: conversation.id,
          user_message: userMessage.message,
          bot_response: botMessage.message,
          timestamp: botMessage.createdAt,
        },
      })
    } catch (error) {
      await trx.rollback()

      return response.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }

  /**
   * @openapi
   * /conversations:
   *   get:
   *     summary: Ambil semua conversation
   *     tags:
   *       - Chatbot
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: sort_by
   *         schema:
   *           type: string
   *       - in: query
   *         name: sort_order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *     responses:
   *       200:
   *         description: Daftar conversations
   */
  public async getConversations({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search')
      const sortBy = request.input('sort_by', 'created_at')
      const sortOrder = request.input('sort_order', 'desc')

      let query = Conversation.query().preload('messages', (messagesQuery) => {
        messagesQuery.orderBy('created_at', 'asc')
      })

      if (search) {
        query = query.where((builder) => {
          builder
            .where('session_id', 'ILIKE', `%${search}%`)
            .orWhere('last_message', 'ILIKE', `%${search}%`)
        })
      }

      query = query.orderBy(sortBy, sortOrder)

      const conversations = await query.paginate(page, limit)

      return response.status(200).json({
        success: true,
        data: conversations.toJSON(),
        meta: {
          total: conversations.total,
          per_page: conversations.perPage,
          current_page: conversations.currentPage,
          last_page: conversations.lastPage,
          from: conversations.firstPage,
          to: conversations.lastPage,
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }

  /**
   * @openapi
   * /conversations/{id}:
   *   get:
   *     summary: Ambil messages dari conversation
   *     tags:
   *       - Chatbot
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Detail percakapan dan pesan
   *       404:
   *         description: Percakapan tidak ditemukan
   */
  public async getConversationMessages({ params, response }: HttpContextContract) {
    try {
      const identifier = params.id
      let conversation

      if (identifier.match(/^[0-9a-f-]{36}$/i)) {
        conversation = await Conversation.query()
          .where('session_id', identifier)
          .preload('messages', (q) => q.orderBy('created_at', 'asc'))
          .first()
      } else {
        conversation = await Conversation.query()
          .where('id', identifier)
          .preload('messages', (q) => q.orderBy('created_at', 'asc'))
          .first()
      }

      if (!conversation) {
        return response.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Conversation not found',
        })
      }

      return response.status(200).json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            session_id: conversation.sessionId,
            last_message: conversation.lastMessage,
            created_at: conversation.createdAt,
            updated_at: conversation.updatedAt,
          },
          messages: conversation.messages.map((message) => ({
            id: message.id,
            sender_type: message.senderType,
            message: message.message,
            created_at: message.createdAt,
          })),
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }

  /**
   * @openapi
   * /conversations/{id}:
   *   delete:
   *     summary: Hapus conversation
   *     tags:
   *       - Chatbot
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Conversation berhasil dihapus
   *       404:
   *         description: Conversation tidak ditemukan
   */
  public async deleteConversation({ params, response }: HttpContextContract) {
    try {
      const identifier = params.id
      let conversation

      if (identifier.match(/^[0-9a-f-]{36}$/i)) {
        conversation = await Conversation.query().where('session_id', identifier).first()
      } else {
        conversation = await Conversation.query().where('id', identifier).first()
      }

      if (!conversation) {
        return response.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Conversation not found',
        })
      }

      await conversation.delete()

      return response.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
  /**
   * @openapi
   * /conversations/{conversationId}/messages/{messageId}:
   *   delete:
   *     summary: Hapus message dari conversation
   *     tags:
   *       - Chatbot
   *     parameters:
   *       - in: path
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: messageId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Pesan berhasil dihapus
   *       404:
   *         description: Pesan tidak ditemukan
   *       400:
   *         description: Pesan tidak termasuk dalam conversation yang ditentukan
   */
  public async deleteMessage({ params, response }: HttpContextContract) {
    const trx = await Database.transaction()

    try {
      const conversationIdentifier = params.conversationId
      const messageId = params.messageId

      // Cari conversation terlebih dahulu
      let conversation
      if (conversationIdentifier.match(/^[0-9a-f-]{36}$/i)) {
        // Jika identifier adalah UUID (session_id)
        conversation = await Conversation.query({ client: trx })
          .where('session_id', conversationIdentifier)
          .first()
      } else {
        // Jika identifier adalah ID conversation
        conversation = await Conversation.query({ client: trx })
          .where('id', conversationIdentifier)
          .first()
      }

      if (!conversation) {
        await trx.rollback()
        return response.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Conversation not found',
        })
      }

      // Cari message yang spesifik dalam conversation tersebut
      const message = await Message.query({ client: trx })
        .where('id', messageId)
        .where('conversation_id', conversation.id)
        .first()

      if (!message) {
        await trx.rollback()
        return response.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Message not found in this conversation',
        })
      }

      await message.delete()

      const lastMessage = await Message.query({ client: trx })
        .where('conversation_id', conversation.id)
        .orderBy('created_at', 'desc')
        .first()

      if (lastMessage) {
        conversation.lastMessage = lastMessage.message
      } else {
        conversation.lastMessage = null
      }

      await conversation.save()

      await trx.commit()

      return response.status(200).json({
        success: true,
        message: 'Message deleted successfully',
        data: {
          deleted_message_id: messageId,
          conversation_id: conversation.id,
          updated_last_message: conversation.lastMessage,
        },
      })
    } catch (error) {
      await trx.rollback()

      return response.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}

import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class QuestionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    question: schema.string({ trim: true }, [
      rules.required(),
      rules.minLength(1),
      rules.maxLength(1000)
    ]),
    session_id: schema.string.optional({ trim: true }, [
      rules.uuid()
    ]),
    additional_context: schema.string.optional({ trim: true }, [
      rules.maxLength(2000)
    ])
  })

  public messages: CustomMessages = {
    'question.required': 'Question is required',
    'question.minLength': 'Question must be at least 1 character long',
    'question.maxLength': 'Question cannot exceed 1000 characters',
    'session_id.uuid': 'Session ID must be a valid UUID',
    'additional_context.maxLength': 'Additional context cannot exceed 2000 characters'
  }
}

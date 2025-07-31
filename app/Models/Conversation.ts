import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Message from './Message'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sessionId: string

  @column()
  public lastMessage: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>
}

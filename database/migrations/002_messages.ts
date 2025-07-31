//database/migrations/002_messages.ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('conversation_id').unsigned().references('id').inTable('conversations').onDelete('CASCADE')
      table.enum('sender_type', ['user', 'bot']).notNullable()
      table.text('message').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index(['conversation_id'])
      table.index(['sender_type'])
      table.index(['created_at'])
      table.text('metadata').nullable()

    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

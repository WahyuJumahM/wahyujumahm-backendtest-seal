//database/migrations/001_conversations.ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'conversations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('session_id').notNullable().unique()
      table.text('last_message').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index(['session_id'])
      table.index(['created_at'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

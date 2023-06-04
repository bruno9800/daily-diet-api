import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
      table.uuid('id').primary();
      table.text('name').notNullable();
      table.text('describe');
      table.boolean('is_diet').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.uuid('user_id').notNullable().references('id').inTable('users').index().onDelete("CASCADE").after('id');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}


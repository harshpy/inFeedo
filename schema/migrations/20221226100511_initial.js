'use-strict';

exports.up = async function (knex) {
    await (
        knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.string('email', 255).notNullable();
        table.string('password').notNullable();
        table.string('name', 255);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    }).then(() =>
        knex.schema.createTable('tasks', function (table) {
            table.increments('id').primary();
            table.string('name', 255).notNullable();
            table.string('status').notNullable();

            table.integer('userId').unsigned()
                .notNullable()
                .references('users.id')
                .onDelete('RESTRICT');

            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
    ));
};

exports.down = async function (knex) {
    await knex.schema.dropTable('tasks')
    await knex.schema.dropTable('users')
};

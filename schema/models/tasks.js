'use-strict';

const { bookshelf, knex } = require('../knex');
const Tasks = bookshelf.Model.extend({
  tableName: 'tasks',
  softDelete: false,
  requireFetch: false
});

module.exports = bookshelf.model('tasks', Tasks);
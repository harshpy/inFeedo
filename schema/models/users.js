'use-strict';

const { bookshelf, knex } = require('../knex');
const Users = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],
  softDelete: false,
  requireFetch: false
});

module.exports = bookshelf.model('users', Users);
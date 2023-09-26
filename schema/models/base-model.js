module.exports = function (bookshelf) {
    const Model = bookshelf.Model.extend({
        getAll(options) {
            return this.query(qb => {
                qb.select('*')
                if (this.tableName == 'tasks') {
                    qb.where('userId', '=', options.userId)
                    if (options.limit) qb.limit(options.limit)
                    if (options.offset) qb.offset(options.offset)
                }
                qb.orderBy('id')
            })
        },
        getSingle(options) {
            return this.query(qb => {
                qb.select('*')
                if (this.tableName == 'tasks')
                    qb.where('userId', '=', options.userId)

                qb.where(`${this.tableName}.id`, '=', options.id)
            })
        }
    })
    bookshelf.Model = Model;
};

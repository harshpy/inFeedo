const codes = require('./validation-codes')


module.exports = (ve = []) => {
    if (ve.length) {
        return {
            "message": "Bad Request",
            "code": 400,
            "validationErrors": ve.map(v => {
                return {
                    field: v.field,
                    code: v.code,
                    message: codes.get(v.code)
                }
            })
        }
    } else return {};
}
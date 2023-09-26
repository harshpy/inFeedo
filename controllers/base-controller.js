
const HttpStatusCodes = require('http-status-codes')

module.exports = class BaseController {

    constructor(Model) {
        this.Model = Model;
    }

    static get READ_OP() {
        return 'r';
    }

    static get CREATE_OP() {
        return 'c';
    }

    static get UPDATE_OP() {
        return 'u';
    }

    static get DELETE_OP() {
        return 'd';
    }

    static serveOk(result, res) {
        res.send(result).status(HttpStatusCodes.OK);
    }

    static serveError(err, res) {
        res.status(HttpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }

    static serveValidationErr(result, res) {
        res.status(HttpStatusCodes.StatusCodes.BAD_REQUEST).send(result);
    }

    async getAll(req, res) {
        try {
            const options = this.formatRequest(req);
            options.op = BaseController.READ_OP;
            let dbObjs = await this.Model.forge().getAll(options).fetchAll()
            dbObjs = dbObjs.toJSON()
            const response = this.formatResponse(dbObjs);
            return res.status(HttpStatusCodes.OK).send(dbObjs)
        } catch (e) {
            console.trace(`error while fetching ${this.Model.prototype.tableName}: ${e}`)
            return BaseController.serveError(e, res)
        }
    }

    async update(req, res) {
        try {
            const options = this.formatRequest(req);
            options.op = BaseController.UPDATE_OP;
            if (isNaN(parseInt(options.id, 10))) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json(
                    {
                        messages: ['please provide valid id!']
                    })
            }
            const existingObj = await this.Model.forge().getSingle(options).fetch()
            if (existingObj) {
                const validationResults = await this._validate(options)
                if (validationResults.length)
                    return BaseController.serveValidationErr(validationResults, res)

                options.obj = existingObj
                let obj = await this._mapToDBObj(options)
                await obj.save();
                obj = await this._mapToObj(obj)
                return BaseController.serveOk(obj, res)
            }
            else {
                return res.status(HttpStatusCodes.NOT_FOUND).json({
                    messages: [`${this.Model.prototype.tableName} does not exist!`]
                })
            }
        }
        catch (e) {
            console.trace(`error while updating ${this.Model.prototype.tableName}: ${e}`)
            return BaseController.serveError(e, res)
        }
    }

    async create(req, res) {
        try {
            const options = this.formatRequest(req);
            options.obj = await this._getModel()
            options.op = BaseController.CREATE_OP;
            const validationResults = await this._validate(options)
            if (validationResults.validationErrors?.length)
                return BaseController.serveValidationErr(validationResults, res)

            let obj = await this._mapToDBObj(options)
            await obj.save();
            obj = await this._mapToObj(obj)
            return BaseController.serveOk(obj, res)
        }
        catch (e) {
            console.trace(`error while creating ${this.Model.prototype.tableName}: ${e}`)
            return BaseController.serveError(e, res)
        }
    }

    async _mapToObj(obj) {
        return obj.toJSON()
    }

    async getSingle(req, res, id = null) {
        try {
            const options = this.formatRequest(req);
            if (id)
                options.id = id
            if (isNaN(parseInt(options.id, 10))) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json(
                    {
                        message: 'please provide valid id!'
                    })
            }
            let dbObj = await this.Model.forge().getSingle(options).fetch()
            if (dbObj) {
                dbObj = await this._mapToObj(dbObj)
                return BaseController.serveOk(dbObj, res)
            }
            else
                return res.status(HttpStatusCodes.NOT_FOUND).send(dbObj)
        } catch (e) {
            console.trace(`error while fetching ${this.Model.prototype.tableName}: ${e}`)
            return BaseController.serveError(e, res)
        }
    }

    async delete(req, res, id = null) {
        const options = this.formatRequest(req);
        options.op = BaseController.DELETE_OP
        if (id)
            options.id = id
        if (isNaN(parseInt(options.id, 10))) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json(
                {
                    message: 'please provide valid id!'
                })
        }
        let dbObj = await this.Model.forge().getSingle(options).fetch()
        if (dbObj) {
            await dbObj.destroy();
            return BaseController.serveOk({}, res)
        }
        else
            return res.status(HttpStatusCodes.NOT_FOUND).send(dbObj)
    }

    async _validate(options) {
        return Promise.resolve([]);
    }

    async _getModel() {
        return await this.Model.forge();
    }

    formatRequest(req) {
        return ({
            query: req.query,
            id: req.params.id,
            body: req.body,
            userId: req.user?.id,
            limit: req.query?.['$limit'] ? parseInt( req.query?.['$limit']) : 0,
            offset: req.query?.['$offset'] ? parseInt( req.query?.['$offset']) : 0
        })
    }

    formatResponse(req) {
        return req;
    }
}
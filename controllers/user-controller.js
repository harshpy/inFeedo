const Users = require('../schema/models/users')
const BaseController = require('./base-controller');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const validationHelper = require('../helpers/validation-helper');
const bcrypt = require('bcrypt')
const saltRounds = 10;
const HttpStatusCodes = require('http-status-codes')

module.exports = class UserController extends BaseController {
    constructor() {
        super(Users)
        this.Model = Users;
    }

    async _validate(options) {
        const dto = options.body;
        const ve = [];
        if (!this._validString(dto.name, 255))
            ve.push({ code: 'v001', field: 'name' })

        if (!this._validString(dto.email, 255))
            ve.push({ code: 'v002', field: 'Email' })
        else if (!emailValidator.validate(dto.email))
            ve.push({ code: 'v005', field: 'Email' })

        if (options.op == BaseController.CREATE_OP && !this._validPassword(dto.password, 8))
            ve.push({ code: 'v003', field: 'Password' })
        else if (options.op == BaseController.UPDATE_OP && dto.hasOwnProperty('password') && this._validPassword(dto.password, 8))
            ve.push({ code: 'v003', field: 'Password' })

        if (!ve.length) {
            const existingUser = await this.Model.forge({ email: dto.email }).fetch();
            if (existingUser)
                ve.push({ code: 'v004', field: 'Email' })
        }

        return validationHelper(ve);
    }

    async login(req, res) {
        const options = this.formatRequest(req)
        const body = options.body
        if (body.email && body.password) {
            let user = await this.Model.forge({ email: body.email }).fetch();
            if (user) {
                user = user.toJSON();
                const passwordMatch = await bcrypt.compare(body.password, user.password);
                if (passwordMatch) {
                    const accessToken = await this.generateJWToken(user)
                    if (accessToken) {
                        const dtoUser = {
                            username: user.email,
                            id: user.id,
                            accessToken,
                            issuedAt: new Date()
                        }
                        return res.status(HttpStatusCodes.OK).json({
                            message: 'Login Successful!',
                            statusCode: HttpStatusCodes.OK,
                            dtoUser
                        })
                    }
                }
                else {
                    return res.status(HttpStatusCodes.UNAUTHORIZED).json({
                        message: 'Incorrect password'
                    })
                }
            }
            else {
                return res.status(HttpStatusCodes.NOT_FOUND).json({
                    message: 'user not found'
                })
            }
        }
    }

    async generateJWToken(userInfo) {
        try {
            return await jwt.sign({ userInfo }, process.env.JWT_PRIVATE_KEY, { expiresIn: '8h' });
        } catch (err) {
            console.error("Error while generating token: ", err);
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Internal Server error'
            });
        }
    }

    _validString(data, length) {
        if (!data || typeof data != 'string')
            return false;
        else if (data.length > length)
            return false;
        return true;
    }

    _validPassword(data, length) {
        if (!data || typeof data != 'string' || data?.length < length)
            return false;
        return true;
    }

    async _mapToDBObj(options) {
        const obj = options.obj;
        const dto = options.body;
        if (dto.email)
            obj.set('email', dto.email);
        if (dto.name)
            obj.set('name', dto.name);
        if (dto.password)
            obj.set('password', await bcrypt.hash(dto.password, saltRounds));

        if(options.op == BaseController.UPDATE_OP)
            obj.set('updatedAt', new Date())

        return obj;
    }

    async _mapToObj(obj) {
        obj = obj.toJSON({ omitPivot: true, hidden: ['password'] });
        return obj
    }
}
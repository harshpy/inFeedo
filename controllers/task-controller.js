const Tasks = require('../schema/models/tasks')
const BaseController = require('./base-controller')
const VALIS_TASK_STATUSES = ['inProgress', 'completed', 'open'];
const validationHelper = require('../helpers/validation-helper');
const { knex } = require('../schema/knex');

module.exports = class ProfilePicController extends BaseController {
    constructor() {
        super(Tasks)
        this.Model = Tasks;
    }

    async _validate(options) {
        const dto = options.body;
        const ve = [];
        if (!this._validString(dto.name, 255))
            ve.push({ code: 'v001', field: 'name' })

        if (!VALIS_TASK_STATUSES.includes(dto.status))
            ve.push({ code: 'v006', field: `Task's status` })

        return validationHelper(ve);
    }

    _mapToDBObj(options) {
        const obj = options.obj;
        const dto = options.body;
        obj.set('name', dto.name);
        obj.set('status', dto.status);
        obj.set('userId', options.userId);

        if (options.op == BaseController.UPDATE_OP)
            obj.set('updatedAt', new Date())

        return obj;
    }

    _validString(data, length) {
        if (!data || typeof data != 'string')
            return false;
        else if (data.length > length)
            return false;
        return true;
    }

    async _mapToObj(obj) {
        obj = obj.toJSON();
        return obj
    }

    async metrics(req, res) {
        try {
            const options = this.formatRequest(req)
            let results = await knex.raw(`select
        to_char(date_trunc('day', "createdAt"), 'Month') || ' ' || date_part('Year', date_trunc('day', "createdAt")) as "date",
        json_build_object
        (
            'open_tasks', sum(case when status = 'open' then 1 else 0 end), 
            'inprogress_tasks', sum(case when status = 'inProgress' then 1 else 0 end),
            'completed_tasks', sum(case when status = 'completed' then 1 else 0 end)
        ) as "metrics"
        from
        tasks where "userId" = ${options.userId}
        group by
        to_char(date_trunc('day', "createdAt"), 'Month') || ' ' || date_part('Year', date_trunc('day', "createdAt"))`);

            results = results.rows.map(row => row)

            return BaseController.serveOk(results, res)
        }
        catch (e) {
            BaseController.serveError(e, res)
        }
    }
}
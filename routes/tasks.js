const express = require("express");
const router = express.Router();
const TaskController = require('../controllers/task-controller');
const taskController = new TaskController();
const jwtAuth = require('../middleware/jwt-auth');

router.get("", jwtAuth.verifyUser, async (req, res) => await taskController.getAll(req, res));
router.get("/metrics", jwtAuth.verifyUser, async (req, res) => await taskController.metrics(req, res));
router.post("/", jwtAuth.verifyUser, async (req, res) => await taskController.create(req, res));
router.put("/:id", jwtAuth.verifyUser, async (req, res) => await taskController.update(req, res));
router.delete("/:id", jwtAuth.verifyUser, async (req, res) => await taskController.delete(req, res));

module.exports = router;

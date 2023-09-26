const express = require("express");
const app = express();
const port = 3000;
const logger = require("morgan");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var jsonParser = bodyParser.json({
  limit: '10mb'
});
app.use(logger("dev"));
app.use(jsonParser);

const tasks = require("./routes/tasks");
const users = require("./routes/users")
app.use("/tasks", tasks);
app.use("/users", users);

app.listen(port, () => {
  console.log(`server running on port ${port}!`);
});
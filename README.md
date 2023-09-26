


###### POSTMAN COLLECTION IS INCLUDED IN THE REPO. ######



after creating, you'll need to login using email and password and a JWT token will be generated.
that JWT token must be used with every user's and task's endpoint in headers under "Authorization".
ex: - Bearer ${token}

### requirement to run this project
1. Node.js
2. postgreSQL
3. Postman
all other necessary packages like express.js and required ORM will be installed via package.json


### steps to run this project
1. open integrated terminal in root directory of project
2. run this command "cp .env-example .env"
3. npm i
4. CREATE a PG database.
5. fill .env with required PG database creds
6. "npm run db:migrate" // this will the migration files and create tables. to rollback, please run (npm run db:rollback)
7. npm start

##paginations can be achieved by $limit and $offset params.
ex:- localhost:3000/tasks?$limit=2&$offset=3

### language used, framework used
node.js, postgresql, express.js
ORM - bookshelf and knex. (thought of using sequelize but wanted to create a project with bookshelf and knex too)
query builder - knex.js



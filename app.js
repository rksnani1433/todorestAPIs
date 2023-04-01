const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;
const intialize_server_db = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server running http://localhost/3000");
    });
  } catch (msg) {
    console.log(`DB error ${msg.message}`);
    process.exit(1);
  }
};
intialize_server_db();

///todos/?priority=HIGH&status=IN%20PROGRESS
const has_p_and_s = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

const has_priority = (query) => {
  return query.priority !== undefined;
};
const hasstatus = (query) => {
  return query.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  console.log(priority);
  let data = null;
  let getquery = "";
  switch (true) {
    case has_p_and_s(request.query):
      getquery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}'
        `;

      break;
    case has_priority(request.query):
      getquery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';
        `;
      break;
    case hasstatus(request.query):
      getquery = `
        SELECT
        *
        FROM
        todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
        `;
      break;
    default:
      getquery = `
        SELECT * FROM todo 
        WHERE todo LIKE '%${search_q}%'
        `;
      console.log("defalut");
      break;
  }
  data = await db.all(getquery);
  response.send(data);
  console.log(getquery);
});

//based on todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getquery = `
    SELECT
     *
    FROM 
    todo 
    WHERE 
    id = ${todoId};
    `;
  const data = await db.get(getquery);
  response.send(data);
});

//post

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addquery = `
        INSERT INTO todo (id,todo,priority,status)
        VALUES (${id},'${todo}','${priority}','${status}')
        `;
  const res = await db.run(addquery);
  response.send("Todo Successfully Added");
});

// delete method

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `
    DELETE FROM todo WHERE id = ${todoId}
    `;
  const resp = await db.run(deletequery);
  response.send("Todo Deleted");
});

// put method

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updatedeatils = request.body;

  const { status, priority, todo } = updatedeatils;
  let updatequery = "";

  if (status !== undefined && priority === undefined && todo === undefined) {
    updateQuery = `
     UPDATE 
     todo
     SET
     status = '${status}'
     WHERE id= ${todoId}`;
    const dbresponse = await db.run(updateQuery);
    response.send("Status Updated");
  } else if (
    status === undefined &&
    priority !== undefined &&
    todo === undefined
  ) {
    updateQuery = `
     UPDATE 
     todo
     SET
     priority = '${priority}'
     WHERE id= ${todoId}`;
    const dbresponse = await db.run(updateQuery);
    response.send("Priority Updated");
    console.log("priority");
  } else if (
    todo !== undefined &&
    priority === undefined &&
    status === undefined
  ) {
    updateQuery = `
     UPDATE 
     todo
     SET
     todo = '${todo}'
     WHERE id= ${todoId}`;
  }
  const dbresponse = await db.run(updateQuery);
  response.send("Todo Updated");
  console.log("todo u");
});

module.exports = app;

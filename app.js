const express = require("express");
const app = express();
app.use(express.json());

const dateFormat = require("date-fns");
const parseISO = require("date-fns/parseISO");
var isValid = require("date-fns/isValid");
const { format } = dateFormat;

const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const sqlite3 = require("sqlite3");

let database = null;

const initializeDbWithServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDbWithServer();

const checkingValidStatus = (request, response, next) => {
  const { status = "" } = request.body;

  const correctStatus = ["TO DO", "IN PROGRESS", "DONE"];

  if (status === "") {
    next();
  } else if (correctStatus.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else {
    next();
  }
};

const checkingValidPriority = (request, response, next) => {
  const { priority = "" } = request.body;

  const correctPriority = ["HIGH", "MEDIUM", "LOW"];

  if (priority === "") {
    next();
  } else if (correctPriority.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else {
    next();
  }
};

const checkingValidCategory = (request, response, next) => {
  const { category = "" } = request.body;

  const correctCategory = ["WORK", "HOME", "LEARNING"];

  if (category === "") {
    next();
  } else if (correctCategory.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
};

const checkingStatus = (request, response, next) => {
  const { status = "" } = request.query;

  const correctStatus = ["TO DO", "IN PROGRESS", "DONE"];

  if (status === "") {
    next();
  } else if (correctStatus.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else {
    next();
  }
};

const checkingPriority = (request, response, next) => {
  const { priority = "" } = request.query;

  const correctPriority = ["HIGH", "MEDIUM", "LOW"];

  if (priority === "") {
    next();
  } else if (correctPriority.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else {
    next();
  }
};

const checkingCategory = (request, response, next) => {
  const { category = "" } = request.query;

  const correctCategory = ["WORK", "HOME", "LEARNING"];

  if (category === "") {
    next();
  } else if (correctCategory.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
};

const getInPascalCase = (eachDetail) => {
  return {
    id: eachDetail.id,
    todo: eachDetail.todo,
    priority: eachDetail.priority,
    status: eachDetail.status,
    category: eachDetail.category,
    dueDate: eachDetail.due_date,
  };
};

const firstLetterCapitalize = (word) => {
  const firstLetter = word[0].toUpperCase() + word.slice(1);
  if (word === "dueDate") {
    return "Due Date";
  } else {
    return firstLetter;
  }
};

const checkingValidDueDate = (request, response, next) => {
  const { dueDate = "" } = request.body;
  console.log(dueDate);

  if (dueDate === "") {
    next();
  } else {
    const getDate = isValid(new Date(dueDate), "yyyy-MM-dd");
    if (getDate === true) {
      const formatDate = parseISO(format(new Date(dueDate), "yyyy-MM-dd"));

      const getFullMonth = formatDate.getMonth() + 1;
      const getYear = formatDate.getFullYear();
      const getDate = formatDate.getDate();

      if (getFullMonth < 10) {
        request.variable = `${getYear}-0${getFullMonth}-${getDate}`;
        next();
      } else {
        request.variable = `${getYear}-${getFullMonth}-${getDate}`;
        next();
      }
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

const checkingValidDate = (request, response, next) => {
  const { date = "" } = request.query;
  console.log(date);

  const getDate = isValid(new Date(date), "yyyy-MM-dd");

  if (getDate) {
    const formatDate = parseISO(format(new Date(date), "yyyy-MM-dd"));

    const getFullMonth = formatDate.getMonth() + 1;
    const getYear = formatDate.getFullYear();
    const getDate = formatDate.getDate();

    if (getFullMonth < 10) {
      request.variable = `${getYear}-0${getFullMonth}-${getDate}`;
      next();
    } else {
      request.variable = `${getYear}-${getFullMonth}-${getDate}`;
      next();
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

//GET All VALID VALUES API
app.get(
  "/todos/",
  checkingPriority,
  checkingCategory,
  checkingStatus,
  async (request, response) => {
    const {
      search_q = "",
      limit = 100,
      offset = 0,
      order = "ASC",
      order_by = "id",
      status = "",
      priority = "",
      category = "",
      due_date = "",
    } = request.query;

    const query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND 
  status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND category LIKE '%${category}%'
  ORDER BY ${order_by} ${order} LIMIT ${limit} OFFSET ${offset};`;

    const dbResponse = await database.all(query);
    const getAllResponse = dbResponse.map((each) => getInPascalCase(each));

    response.send(getAllResponse);
  }
);

//GET API todoId
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query = `SELECT * FROM todo WHERE id='${todoId}' ORDER BY id ;`;

  const dbResponse = await database.get(query);

  const getAllResponse = getInPascalCase(dbResponse);

  response.send(getAllResponse);
});

//POST API
app.post(
  "/todos/",
  checkingValidPriority,
  checkingValidCategory,
  checkingValidStatus,
  checkingValidDueDate,
  async (request, response) => {
    const { todo, priority, status, category, dueDate } = request.body;

    const query = `INSERT INTO todo(todo,priority,status,category,due_date) 
  VALUES 
  ('${todo}','${priority}','${status}','${category}','${dueDate}');`;

    const dbResponse = await database.run(query);

    const newId = dbResponse.lastID;
    console.log(`post request newID: ${newId}`);

    response.send("Todo Successfully Added");
  }
);

//PUT API
app.put(
  "/todos/:todoId/",
  checkingValidPriority,
  checkingValidCategory,
  checkingValidStatus,
  checkingValidDueDate,
  async (request, response) => {
    const { status, priority, category, todo, dueDate } = request.body;
    const { todoId } = request.params;
    let getKey = Object.keys(request.body);

    let name = getKey[0];
    let query = null;

    switch (name) {
      case "status":
        query = `UPDATE todo SET status='${status}' WHERE id='${todoId}';`;
        break;
      case "priority":
        query = `UPDATE todo SET priority='${priority}' WHERE id='${todoId}';`;
        break;
      case "category":
        query = `UPDATE todo SET category='${category}' WHERE id='${todoId}';`;
        break;
      case "todo":
        query = `UPDATE todo SET todo='${todo}' WHERE id='${todoId}';`;
        break;
      default:
        query = `UPDATE todo SET due_date='${dueDate}' WHERE id='${todoId}';`;
        break;
    }
    const dbResponse = await database.run(query);
    const getCapitalName = firstLetterCapitalize(name);
    response.send(`${getCapitalName} Updated`);
  }
);

//GET VALID agenda DATE API
app.get("/agenda/", checkingValidDate, async (request, response) => {
  const query = `SELECT * FROM todo WHERE due_date='${request.variable}';`;

  const dbResponse = await database.all(query);
  const result = dbResponse.map((each) => getInPascalCase(each));
  response.send(result);
});

//DELETE API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query = `DELETE FROM todo WHERE id='${todoId}';`;

  const dbResponse = await database.run(query);
  response.send("Todo Deleted");
});

module.exports = app;

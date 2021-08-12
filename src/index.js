const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(userFind => userFind.username === username);

  if (user) {
    request.user = user;
    return next();
  } else {
    return response.status(404).json({ error: 'User not found!' });
  }
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  let todo = user.todos.find(todoFind => todoFind.id === id);

  if (todo) {
    request.todo = todo;
    return next();
  } else {
    return response.status(404).json({ error: 'Todo not found.' });
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(userSome => userSome.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists.' });
  }

  const user = { id: uuidv4(), name, username, todos: [] }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(task);

  return response.status(201).json(task)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  let { todo } = request;
  const { title, deadline } = request.body;

  todo = { ...todo, title, deadline: new Date(deadline) };
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  let { todo } = request;

  todo = { ...todo, done: true };
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex(todoFind => todoFind.id === id);

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
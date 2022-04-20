const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/* 
  User Model 
  {
    id: String,
    username: String,
    name: String,
    todos: Array<Todo>
  }

  Todo Model
  {
    id: String,
    title: String,
    done: Boolean (Default: false),
    deadline: Date,
    created_at: Date
  }
*/

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(400).json({ error: "User not found" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.some((user) => user.username === username)

  if (user) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const addedUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(addedUser)

  return response.status(201).json(addedUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  const { title, deadline } = request.body

  const addedTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(addedTodo)

  return response.status(201).json(addedTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = request.user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist!' })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const todo = request.user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist!' })
  }

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user

  const todo = request.user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo does not exist!' })
  }

  todos.splice(todo, 1)

  return response.sendStatus(204)
});

module.exports = app;
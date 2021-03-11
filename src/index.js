const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user,username === username)

  if (!user) {
    return response.status(404).json({ message: "User doest not exists!"})
  }

  request.user = user

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const findUser = users.find(user => user.username === username)

  if (findUser) return response.status(400).json({ error: "User alerady existis"})

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todoList = user.todos;

  const todoIndex = todoList.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({
      error: "Todo not found!"
    })
  }

  const oldTodo = todoList[todoIndex]

  const todoUpdated = {
    ...oldTodo,
    title,
    deadline: new Date(deadline)
  }

  todoList[todoIndex] = todoUpdated

  return response.json(todoUpdated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { done } = request.body

  const todoList = user.todos;

  const todoIndex = todoList.findIndex(todo => todo.id === id);

  const oldTodo = todoList[todoIndex]

  const updatedTodo = {
    ...oldTodo,
   done
  }

  todoList[todoIndex] = updatedTodo

  return response.json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoList = user.todos

  const todoFounded = todoList.find(todo => todo.id === id)

  todoList.splice(todoFounded, 1)

  return response.json(todoList)
});

module.exports = app;

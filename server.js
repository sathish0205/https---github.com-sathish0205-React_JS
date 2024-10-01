const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(cors()); // Move this line after initializing app
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mern-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the TODO schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

// Create a model from the schema
const Todo = mongoose.model('Todo', todoSchema);

// GET method to retrieve all TODO items
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving todos: ' + err.message });
  }
});

// POST method to create a new TODO item
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;

  // Basic validation
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error creating todo: ' + err.message });
  }
});

// GET method to retrieve a single TODO item by ID
app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving todo: ' + err.message });
  }
});

// PUT method to update a TODO item by ID
app.put('/todos/:id', async (req, res) => {
  const { title, description } = req.body;

  // Basic validation
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Error updating todo: ' + err.message });
  }
});

// DELETE method to delete a TODO item by ID
app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send(); // No content to send back
  } catch (err) {
    res.status(500).json({ error: 'Error deleting todo: ' + err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

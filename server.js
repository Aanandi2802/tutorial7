const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://aanandi28:1111@tutorial7.loxyqs0.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = "tut7";
const collectionName = "users";

app.use(bodyParser.json());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase();

app.get('/users', async (req, res, next) => {
  const collection = client.db(dbName).collection(collectionName);
  try {
    const users = await collection.find({}).toArray();
    res.status(200).json({
      message: "Users retrieved",
      success: true,
      users: users
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.get('/user/:id', async (req, res, next) => {
  const id = req.params.id;
  const collection = client.db(dbName).collection(collectionName);
  try {
    const user = await collection.findOne({ id: id });
    if (user) {
      res.status(200).json({
        success: true,
        user: user
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.post('/add', async (req, res, next) => {
  const user = req.body;
  
  if (!user.email || !user.firstName) {
    res.status(400).json({
      success: false,
      message: "Missing email or firstName in the request body"
    });
    return;
  }

  user.id = generateUniqueId();
  const collection = client.db(dbName).collection(collectionName);
  try {
    await collection.insertOne(user);
    res.status(201).json({
      message: "User added",
      success: true
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.put('/update/:id', async (req, res, next) => {
  const id = req.params.id;
  const updatedUser = req.body;

  if (!updatedUser.email || !updatedUser.firstName) {
    res.status(400).json({
      success: false,
      message: "Missing email or firstName in the request body"
    });
    return;
  }

  const collection = client.db(dbName).collection(collectionName);
  try {
    const user = await collection.findOne({ id: id });
    if (user) {
      await collection.updateOne({ id: id }, { $set: updatedUser });
      res.status(200).json({
        message: "User updated",
        success: true
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

function generateUniqueId() {
  return uuidv4();
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

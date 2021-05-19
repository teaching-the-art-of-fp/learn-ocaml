const express = require('express');
const app = express();
const database = process.env.DB_CONN;
const port = process.env.PORT;
const compile_collection = process.env.COMP_COLLECTION;
const eval_collection = process.env.EVAL_COLLECTION;
const mongoose = require('mongoose');

const Joi = require("joi");

const mongoSolutionSchema = Joi.object({
  student_id: Joi.string(),
  timestamp: Joi.string(),
  collection: Joi.string(),
  student_solution: Joi.string()
}).options({presence: 'required'});

app.use(express.json());

// connect to database
// mongoose.connect('mongodb://172.17.0.1/learn-ocaml-code');
mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true} );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Access Control
app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });

const requestHandler = (req, res) => {
  const { error, value } = mongoSolutionSchema.validate(req.body);
  if (!error) {
    const { student_id, collection, student_solution } = value;
    const solution = {
      studentId: student_id,
      timestamp: new Date().toString(),
      solution: student_solution
    };
    db.collection(collection).insertOne(solution);
    console.log(solution);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}

app.post("/grade", requestHandler);

// receive the POST from the client javascript file
app.post("/compile", requestHandler);  

app.post("/eval", requestHandler);  

app.listen(port, () => {
  console.log(`Server running on port${port}`);
});
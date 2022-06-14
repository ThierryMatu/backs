const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const http = require("http")
const app = express()
const port = process.env.PORT || 3000

// MIDDLEWARES
// use Parser Middleware
app.use(express.json())

// use Logger middleware
app.use(function (req, res, next) {
  console.log('Request IP: ' + req.url)
  console.log('Request date: ' + new Date())
  return next()
})

// use param middleware
app.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName)
  return next()
})

// use static file middleware
app.use(function (req, res, next) {
  const filePath = path.join(__dirname, 'static', req.url)
  fs.stat(filePath, function (err, fileInfo) {
    if (err) return next()
    if (fileInfo.isFile()) res.sendFile(filePath)
    else next()
  })
})

// CORS allows you to configure the web API's security. 
// It has to do with allowing other domains to make requests against your web API.
app.use(cors());


// connect to MongoDB Database
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://Enoch:Matu@cluster0.4b3r7.mongodb.net/test', (err, client) => {
    db = client.db('afterschool')
})


app.get('/', (req, res) => {
  res.send("Welcome to entry point")
})



// Endpoint to get all lessons

app.get('/collection/:collectionName', (req, res) => {
  req.collection.find({}).toArray((err, results) => {
      if (err) return next(err)
      res.send(results)
  })
})



// Endpoint to add an order
app.post('/collection/:collectionName', (req, res) => {
  let doc = req.body
  req.collection.insertOne(doc, (err, result) => {
      if (err) return next(err)
      res.send({msg: "order added successfully"})
  })
})

// Endpoint to update number of available spaces in lesson
app.put('/collection/:collectionName/:id', async function (req, res, next) {
  await req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { space: req.body.space } },
    (e, results) => {
      res.json(results)
      if (e) return next(e)
  })
})

// Endpoint to perform a Full Text Search on lessons
app.get('/collection/:collectionName/search', (req, res) => {
  let search_keyword = req.query.search
  req.collection.find({}).toArray((err, results) => {
      if (err) return next(err)
      let filteredList = results.filter((subject) => {
          return subject.subjectname.toLowerCase().match(search_keyword.toLowerCase()) || subject.location.toLowerCase().match(search_keyword.toLowerCase())
      });  
      res.send(filteredList)
  })
})

// Listen to port
app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});

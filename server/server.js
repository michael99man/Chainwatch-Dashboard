#!/usr/bin/env nodejs
const express = require('express')
const cors = require('cors')
var MongoClient = require('mongodb').MongoClient;
const app = express()
const port = 8080
const url = "mongodb://localhost:27017/";

var mongodb;
MongoClient.connect(url, {  
	poolSize: 5
	// other options can go here
}, function(err, client) {
	mongodb=client.db('chainwatch');
	console.log("Connected to MongoDB");
});


/* Allow ALL requests */
var corsOptions = {
  origin: function (origin, callback) {
      callback(null, true)
  }
}
app.options('*', cors(corsOptions))

app.get('/', function(req, res){
	res.send('Hello World!')
});

app.get('/reorg_events', async function(req, res){
	var network = req.query.network;
	
	var data = await mongodb.collection("reorg_events").find({"network":network}).toArray();
	res.json(data);
});

app.get('/density_events', async function(req, res){
	var network = req.query.network;

	var data = await mongodb.collection("density_events").find({"network":network}).toArray();
	res.json(data);
});

app.get('/statistics', async function(req, res){
	var network = req.query.network;

	// DO AVERAGING?
	
	var data = await mongodb.collection("statistics").find({"network":network}).toArray();
	res.json(data);
});

app.listen(port, () => console.log(`Chainwatch Server listening on port ${port}!`))
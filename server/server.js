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

	var data = await mongodb.collection("statistics").find({"network":network}).toArray();
	res.json(data);
});

app.get('/numForked', async function(req, res){
	var network = req.query.network;

	// calculate number of forked blocks in the last 24 hours
	//var results = await mongodb.collection("reorg_events").find({ $and: [{$where:function () { return Date.now() - this._id.getTimestamp() <   }}, {"network": network}]  }).toArray();
	var results = await mongodb.collection("reorg_events").find({"network":network}).toArray();
	
	var numForked=0;
	var i = results.length-1;
	while(1){
		if(Date.now() - new Date(results[i].detected).getTime() < (24 * 60 * 60 * 1000)){
			numForked += results[i].numBlocks;
		} else {
			break;
		}
		i--;
	}


	
	console.log(results);
	results.forEach(function (doc) {numForked += doc["numBlocks"];})
	res.json({"numForked": numForked});
});

app.listen(port, () => console.log(`Chainwatch Server listening on port ${port}!`))
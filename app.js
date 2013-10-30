/**
 * Module dependencies.
 */

var express = require('express');

var host = "localhost";
var port = "27017";
var database = "linkfeed"
var databaseUrl = host+":"+port+"/"+database; 
var collections = ["users","liens"];
var db = require("mongojs").connect(databaseUrl, collections);


var app = express();
app.use(express.bodyParser());

app.get('/user/:id', function(request, response) {
	db.users.find({"_id":request.params.id},function(err,user){
	//	console.log(request.params.id);
	//	console.log(msg);
		response.redirect('http://127.0.0.1/index.html');
	});
});

app.post("/user/new",function(request, response){
	console.log("J'ai eu un post!");
	console.log(request.body);
	var user = {};
	user = request.body;
	user = db.users.insert(user);
	console.log("Nouvel utilisateur enregistré");
	response.redirect('http://127.0.0.1/linkfeed/index.html');
});

app.post("/lien/new",function(request, response){
	console.log("J'ai eu un post!");
	console.log(request.body);
	var lien = {};
	lien = request.body;
	lien = db.liens.insert(lien);
	console.log("Nouveau lien enregistré");
	response.redirect('http://127.0.0.1/linkfeed/profil.html');
});

app.listen(8080);
console.log('Express server listening on port 8080');
var express=require('express');

var host="localhost";
var port="27017";
var database="Linkfeed";
var databaseUrl = host+":"+port+"/"+database;
var collections = ["links"];
var db = require("mongojs").connect(databaseUrl, collections);

var app=express();
app.use(express.bodyParser());

app.get("/link/:id",function(request,response){
		db.links.find({"_id":request.params.id},function(err,link){
			console.log(request.params.id);
			console.log(link);
			response.send(link);
		});
});
		
app.post("/link",function(request,response) {
		console.log("J'ai reçu un lien");
		console.log(request.body);
		var link={};
		link=request.body;
		link=db.links.insert(link);
		console.log("Nouveau lien enregistré");
		response.redirect('http://localhost:8888/Linkfeed/profil.html');
});

app.listen(8080);
console.log('Express server listening on port 8080');
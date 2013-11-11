var express=require('express');

var host="localhost";
var port="27017";
var database="linkfeed";
var databaseUrl = host+":"+port+"/"+database;
var collections = ["users","liens"];
var db = require("mongojs").connect(databaseUrl, collections);
var app=express();



//Configuration

app.configure(function(){
		app.set('views',__dirname + '/views');
		app.set('view engine','jade');
		app.use(express.bodyParser());
		app.use(express.static(__dirname + '/public'));
});

//users
app.get('/',function(request,response){
		response.render("index.jade");
});

app.post('/user/login', function(request,response){
		db.users.find({_id:request.body.username},function(error,user){
				if(user.length==0 || user[0].mdp != request.body.mdp){
					response.render('index.jade',{messageError:"Mauvais login ou mot de passe"});
				}
				else{
					response.render('profil.jade',request.body);
				}
		});
});
			
app.post('/user/new', function(request,response){
		db.users.find({_id:request.body.username},function(error,user){
				if(user.length==0){
					db.users.insert({_id:request.body.username, mdp:request.body.mdp, email:request.body.email});
					console.log("Nouvel utilisateur enregistré");
					response.render('profil.jade',request.body);
				}
				else{
					response.render('index.jade',{messageError2:"L'utilisateur existe déjà"});
				}
		});
});

//liens
app.post('/lien/new',function(request,response){
		db.liens.insert({_id:request.body.username, url:request.body.url, description:request.body.description, tags:request.body.tags});
		console.log("Nouveau lien enregistré");
		response.render('profil.jade',request.body);
});

app.listen(8080);
console.log('Express server listening on port 8080');
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
		app.use(express.static(__dirname + '/public/assets'));
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
					response.render('index.jade',{messageError:"L'utilisateur existe déjà"});
				}
		});
});

/*app.get('/user/:id', function(request, response) {
        db.users.find({"_id":request.params.id},function(err,user){
        console.log(request.params.id);
        //        console.log(msg);
        response.redirect('http://127.0.0.1:8888/Linkfeed/profil.html');
        });
});

app.post("/user/new",function(request, response){
        console.log("J'ai eu un post!");
        console.log(request.body);
        var user = {};
        user = request.body;
        user = db.users.insert(user);
        console.log("Nouvel utilisateur enregistré");
        response.redirect('http://127.0.0.1:8888/Linkfeed/index.html');
});

app.get("/lien/:auteur", function(request,response){
		db.liens.find({"auteur":request.params.auteur},function(err,liens){
		console.log(request.params.id);
		response.redirect('http://127.0.0.1:8888/Linkfeed/profil.html');
		});
});*/

// liens	
app.post("/lien/new",function(request, response){
        console.log("J'ai eu un post!");
        console.log(request.body);
        var lien = {};
        lien = request.body;
        lien = db.liens.insert(lien);
        console.log("Nouveau lien enregistré");
        response.redirect('http://127.0.0.1:8888/Linkfeed/profil.html');
});

app.listen(8080);
console.log('Express server listening on port 8080');
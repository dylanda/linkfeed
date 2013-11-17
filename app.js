var express=require('express');

var host="localhost";
var port="27017";
var database="linkfeed";
var databaseUrl = host+":"+port+"/"+database;
var collections = ["users","liens"];
var db = require("mongojs").connect(databaseUrl, collections);
var app = express();



//------------------------------
// 			Configuration
//------------------------------

app.configure(function(){
		app.set('views',__dirname + '/views');
		app.set('view engine','jade');
		app.use(express.bodyParser());
		app.use(express.static(__dirname + '/public'));
		app.use(express.cookieParser());
        app.use(express.session({ secret: "mysecret" }));
});


//------------------------------
//			test session
//------------------------------

function requiresLogin(request,response,next) {
    if(request.session.user){
        next();
    } else {
        response.render('index');
    }
};


//------------------------------
//			index
//------------------------------
app.get('/',requiresLogin, function(request,response){
		response.redirect("/feed");
});



//------------------------------
//			Users
//------------------------------

app.post('/user/login', function(request,response){
		db.users.find({_id:request.body.username},function(error,user){
				if(user.length==0 || user[0].mdp != request.body.mdp){
					response.render('index',{messageError:'Mauvais login ou mot de passe'});
				}
				else{
					request.session.user = request.body.username;
					response.redirect('/feed');
				}
		});
});

			
app.post('/user/new', function(request,response){
		db.users.find({_id:request.body.username},function(error,user){
				if(user.length==0){
					db.users.insert({_id:request.body.username, mdp:request.body.mdp, email:request.body.email});
					console.log("Nouvel utilisateur enregistré");
					request.session.user = request.body.username;
					response.redirect('/feed');
				}
				else{
					response.redirect('/');
					response.render('index',{messageError2:"L'utilisateur existe déjà"});
				}
		});
});


//--------------------------------------
// 				partage de liens
//--------------------------------------
app.post('/lien/new',requiresLogin,function(request,response){
		var lien={url:request.body.url, description:request.body.description, tags:request.body.tags, user:request.session.user};
		db.liens.insert(lien);
		console.log("Nouveau lien enregistré");
		response.redirect('/profil');
		//response.render('profil.jade',request.session);
});

//affichage des liens du profil
app.get('/profil',requiresLogin,function(request,response){
		var auteur=request.session.user;
		db.liens.find({user:auteur},function(err,link){
			response.render('profil',{links: link});
		});
});

//afficher tous les liens dans le feed
app.get('/feed',requiresLogin,function(request,response){
		db.liens.find({}, function(err, link){
			response.render('feed', {links: link});
			});
});

//supprimer lien
app.get('/delete/:id',requiresLogin,function(req,res){
	var ObjectID = require('mongodb').ObjectID;
	var idString = req.params.id;
	db.liens.remove({_id: new ObjectID(idString)},function(err,todo){
			res.redirect('/profil');
        });
	
});

//------------------------------------
// 			filtres
//------------------------------------

//filtrage par tags dans le profil
app.post('/profil/search',requiresLogin,function(request,response){
		var tag=request.body.searchfield;
		if (tag != ''){
			db.liens.find({tags:tag},function(err,link){
				response.render('profil',{links:link});
			});
		}
		else{
			response.redirect('/profil');
		}
});

//filtrage par tags dans le feed
app.post('/feed/search',requiresLogin,function(request,response){
		var tag=request.body.searchfield;
		if (tag !=''){
			db.liens.find({tags:tag},function(err,link){
				response.render('feed',{links:link});
			});
		}
		else{
			response.redirect('/feed');
		}
});


//----------------------------------
//			fermeture session
//----------------------------------
app.get("/user/logout", function(request, response){
        if(request.session.user){
                request.session.user=undefined;
        }
        response.redirect('/');
});

app.listen(8080);
console.log('Express server listening on port 8080');


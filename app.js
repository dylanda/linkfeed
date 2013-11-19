var express=require('express');

var environment = process.env.NODE_ENV;

if(environment=='production'){
var databaseUrl=process.env.MONGOHQ_URL; 
console.log("HEROKU");
}
else{
var host="localhost";
var port="27017";
var database="linkfeed";
var databaseUrl = host+":"+port+"/"+database;
console.log("LOCAL");
}

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
//		app.use(express.cookieParser());
//       app.use(express.session({ secret: "mysecret" }));
		app.use(express.cookieParser());
		  app.use(express.cookieSession({
			secret: 'mySecret',
			cookie: { maxAge: 60 * 60 * 1000 }
		  }));
});

app.get('/test', function(request,response){
		console.log(test);
});

//------------------------------
//			 Test session
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
		
			// RECUPERATION TAGS dans DATA
			db.users.find({},function(err,users){
			
				var data = new Array();
				var k = 0;
				for (var i=0; i<link.length; i++) {
					for (var j=0; j<link[i].tags.length; j++) {
						data[k] = "\"#"+link[i].tags[j]+"\"";
						k = k +1;
					}
				}
			// FIN	
				response.render('profil',{links: link, data:data, user:request.session.user});
			});
		});
});

//afficher tous les liens dans le feed
app.get('/feed',requiresLogin,function(request,response){
		db.liens.find({},function(err,link){
		
			// RECUPERATION TAGS et USERS dans DATA
			db.users.find({},function(err,users){
			
				var data = new Array();
				var k = 0;
				for (var i=0; i<link.length; i++) {
					for (var j=0; j<link[i].tags.length; j++) {
						data[k] = "\"#"+link[i].tags[j]+"\"";
						k = k +1;
					}
				}
				for (var i=0; i<users.length; i++) {
					data[k] = "\"@"+users[i]._id+"\"";
					k = k +1;
				}
			// FIN	
				response.render('feed',{links: link, data:data, user:request.session.user});
			});
		});
});

//supprimer lien
app.get('/delete/:id',requiresLogin,function(req,res){
	var ObjectID = require('mongodb').ObjectID;
	var idString = req.params.id;
	db.liens.remove({_id: new ObjectID(idString)});
	res.redirect('/profil');
});

//modifier lien
app.post('/update/:id',requiresLogin,function(req,res){
	var ObjectID = require('mongodb').ObjectID;
	var idString = req.params.id;
	var lien={url:req.body.url, description:req.body.description, tags:req.body.tags, user:req.session.user};
	db.liens.update({_id: new ObjectID(idString)}, lien);
	res.redirect('/profil');
});


//------------------------------------
// 			filtres
//------------------------------------

//filtrage par tags dans le profil
app.post('/profil/search',requiresLogin,function(request,response){
		var tag=request.body.searchfield;
		tag = tag.replace('#','');
		var profil=request.session.user;
		if (tag != ''){
			db.liens.find({tags:tag,user:profil},function(err,link){
				response.render('profil',{links:link, user:request.session.user});
			});
		}
		else{
			response.redirect('/profil');
		}
});

//filtrage par tags dans le feed
app.post('/feed/search',requiresLogin,function(request,response){
		var data=request.body.searchfield;
		if (data !=''){
			if (data.charAt(0)=='#'){
				data = data.replace('#','');
				db.liens.find({tags:data},function(err,link){
					response.render('feed',{links:link});
				});
			}
			else if (data.charAt(0)=='@'){
				data = data.replace('@','');
				db.liens.find({user:data},function(err,link){
					response.render('feed',{links:link});
				});
			}
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

var port_express = process.env.PORT || 5000;
app.listen(port_express);
console.log('Express server listening on port '+port_express);


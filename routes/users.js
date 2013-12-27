var environment = process.env.NODE_ENV;

if(environment=='production'){
//var databaseUrl=process.env.MONGOHQ_URL; 
var databaseUrl="mongodb://dyl2311:feedlink01@paulo.mongohq.com:10000/app18715371";
//console.log("HEROKU");
}
else{
var host="localhost";
var port="27017";
var database="linkfeed";
var databaseUrl = host+":"+port+"/"+database;
//console.log("LOCAL");
}

var collections = ["users","liens"];
var db = require("mongojs").connect(databaseUrl, collections);



exports.login=function(request,response){
		var username = request.body.username.toLowerCase().trim();
		db.users.find({_id:username},function(error,user){
				if(user.length==0 || user[0].mdp != request.body.mdp){
					response.render('index',{messageError:'Mauvais login ou mot de passe'});
				}
				else{
					request.session.user = username;
					response.redirect('/feed');
				}
		});
};

exports.register=function(request,response){
		var username = request.body.username.toLowerCase().trim();
		db.users.find({_id:username},function(error,user){
				if(user.length==0){
					db.users.insert({_id:username, mdp:request.body.mdp, email:request.body.email.toLowerCase().trim()});
					console.log("Nouvel utilisateur enregistré");
					request.session.user = username;
					response.redirect('/feed');
				}
				else{
					response.render('index',{messageError2:"L'utilisateur existe déjà"});
				}
		});
};

exports.profil=function(request,response){
		var userdisp=request.params.id.toLowerCase();
		db.users.find({_id:userdisp},function(error,user){
				if(user.length!=0 && userdisp!=request.session.user){
				
					db.liens.find({user:userdisp},function(err,link){
						console.log("Profil consulté");
						response.render('profildisp',{links: link, userdisp:user});
					});
				}
				else{
					response.redirect('/profil');
				}
		});
};

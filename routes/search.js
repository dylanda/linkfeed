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

//filtrage par tags dans le profil
exports.searchInProfile=function(request,response){

		var filtre=request.body.searchfield;
		var profil=request.session.user;
		if (filtre !=''){
			if (filtre.charAt(0)=='#'){
				filtre = filtre.replace('#','');
				db.liens.find({tags:filtre, user:profil},function(err,link){
					response.render('profil',{links:link, user:profil, data:request.body.data});
				});
			}
			else if (filtre.charAt(0)=='@'){
				filtre = filtre.replace('@','');
				db.users.find({_id:filtre},function(err,user){
					db.liens.find({user:filtre},function(err,link){
						response.render('profildisp',{links: link, userdisp:user});
					});
				});
			}
			else {
				db.liens.find({tags:filtre, user:profil},function(err,link){
					response.render('profil',{links:link, user:profil, data:request.body.data});
				});
			}
		}
		else{
			response.redirect('/profil');
		}
};

//filtrage par tags dans le feed
exports.searchInFeed=function(request,response){
		var filtre=request.body.searchfield;
		var currentuser = request.session.user;
		if (filtre !=''){
			if (filtre.charAt(0)=='#'){
				filtre = filtre.replace('#','');
				db.users.find({_id:currentuser},function(err,user){
					db.liens.find({tags:filtre, user: { $in: user[0].friends }},function(err,link){
						response.render('feed',{links:link, data:request.body.data});
					});
				});
			}
			else if (filtre.charAt(0)=='@'){
				filtre = filtre.replace('@','');
				db.users.find({_id:filtre},function(err,user){
					db.liens.find({user:filtre},function(err,link){
						response.render('profildisp',{links: link, userdisp:user});
					});
				});
			}
			else {
				db.users.find({_id:currentuser},function(err,user){
					db.liens.find({tags:filtre, user: { $in: user[0].friends }},function(err,link){
						response.render('feed',{links:link, data:request.body.data});
					});
				});
			}
		}
		else{
			response.redirect('/feed');
		}
};


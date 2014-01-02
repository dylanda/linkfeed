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
		db.users.find({_id:profil},function(error,user){
			if(filtre){
				var tagsarray = filtre.split(",");
				db.liens.find({tags: {$in: tagsarray}, user:profil},function(err,link){
					response.render('profil',{links:link, user:user, data:request.body.data, filtre:true});
				});
			}
			else{
				response.redirect('/profil');
			}
		});
};

//filtrage le feed
exports.searchInFeed=function(request,response){
		var filtre=request.body.searchfield;
		var currentuser = request.session.user;
		if (filtre){
			var tagsarray = filtre.split(",");
			db.liens.find({tags: {$in: tagsarray}},function(err,link){
				response.render('feed',{links:link, user:currentuser, data:request.body.data, filtre:true});
			});
		}
		else{
			response.redirect('/feed');
		}
};

exports.searchInUsers=function(request,response){
		var filtre=request.body.searchfield;
		var currentuser = request.session.user;
		if (filtre){
			var usersarray = filtre.split(",");
			db.users.find({$and: [{ _id: {$in: usersarray}} , { _id: {$ne: currentuser}}]},function(err,users){
				db.liens.find({},function(err,links){
					response.render('users',{links:links, users:users, currentuser:currentuser, filtre:true});
				});
			});
		}
		else{
			response.redirect('/users');
		}
};

var environment = process.env.NODE_ENV;

if(environment=='production'){
//var databaseUrl=process.env.MONGOHQ_URL; 
var databaseUrl="mongodb://dyl2311:feedlink01@paulo.mongohq.com:10000/app18715371";
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

//filtrage par tags dans le profil
exports.searchInProfile=function(request,response){
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
};

//filtrage par tags dans le feed
exports.searchInFeed=function(request,response){
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
};


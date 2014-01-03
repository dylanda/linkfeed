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
				db.liens.find({ $query: {tags: {$in: tagsarray}, user:profil}, $orderby: { date : -1 } }   ,function(err,link){
					response.render('profil',{links:link, user:user, data:request.body.data, filtre:true,  filtresTab:filtre});
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
		
	db.users.find({_id:currentuser},function(err,user){
		
		if (user[0].friends != undefined){
			var userfriends = user[0].friends;
		}
		else{
			var userfriends = new Array();
		}
		
		var confirmedfriends = new Array();
		var nb = 0;
		for (var i=0; i<userfriends.length; i++) {
			if (userfriends[i].confirmed == true) {
				confirmedfriends[nb]=userfriends[i].user;
				nb++;
			}
		}
		
		if (filtre){
			var dataTab = filtre.split(",");
			var tagsarray = new Array();
			var usersArray = new Array();
			
			var k = 0;
			var j = 0;
			for (var i=0; i<dataTab.length; i++) {
				if (dataTab[i].charAt(0) != "@"){
					tagsarray[k] = dataTab[i];
					k = k +1;
				}
				else {
					usersArray[j] = dataTab[i].slice(1);
					j = j +1;
				}
			}
			

			if ((j!=0) &&  (k!=0)) {
				db.liens.find({ $query: {$and: [{ user: {$in: confirmedfriends}} , { user: {$in: usersArray}}], tags: {$in: tagsarray}  }, $orderby: { date : -1 } }     ,function(err,link){
					response.render('feed',{links:link, user:currentuser, data:request.body.data, filtre:true,  filtresTab:filtre });
				});
			}else if ((j!=0) && (k==0)) {
				db.liens.find({ $query: {$and: [{ user: {$in: confirmedfriends}} , { user: {$in: usersArray}}]  }, $orderby: { date : -1 } },function(err,link){
					response.render('feed',{links:link, user:currentuser, data:request.body.data, filtre:true,  filtresTab:filtre });
				});
			}else if ((j==0) && (k!=0)){
				db.liens.find({ $query: {user: {$in: confirmedfriends}, tags: {$in: tagsarray}  }, $orderby: { date : -1 } },function(err,link){
					response.render('feed',{links:link, user:currentuser, data:request.body.data, filtre:true,  filtresTab:filtre });
				});
			}
		}
		else{
			response.redirect('/feed');
		}
		
	});
};

exports.searchInUsers=function(request,response){
		var filtre=request.body.searchfield;
		var currentuser = request.session.user;
		if (filtre){
			var usersarray = filtre.split(",");
			db.users.find({ $query: {$and: [{ _id: {$in: usersarray}} , { _id: {$ne: currentuser}}]}, $orderby: { date_ins : -1 } },function(err,users){
				db.liens.find({},function(err,links){
					response.render('users',{links:links, users:users, currentuser:currentuser, data:request.body.data, filtre:true,  filtresTab:filtre});
				});
			});
		}
		else{
			response.redirect('/users');
		}
};

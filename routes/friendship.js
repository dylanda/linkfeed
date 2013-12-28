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

exports.addFriend=function(request,response){
		var currentuser=request.session.user;
		var toAdd=request.params.id.toLowerCase();
		db.users.find({_id:currentuser},function(error,user){
			db.users.update({"_id":currentuser},
				{
					"$addToSet":{"friends":{user:toAdd,confirmed:false,demandeur:currentuser}}
				}
			);
			db.users.update({"_id":toAdd},
				{
					"$addToSet":{"friends":{user:currentuser,confirmed:false,demandeur:currentuser}}
				}
			);
			response.redirect('/profil/'+toAdd);
		});
};


exports.friends=function(request,response){
		var currentuser=request.session.user;

		db.users.find({_id: currentuser},function(error,user){
			var amis=new Array;
			var j=0;
			var nbamis=0;
			if (user[0].friends!=undefined)
			{
				for (var i= 0; i<user[0].friends.length; i++)
				{ 
					if (user[0].friends[i].confirmed==true)
					{
						amis[j]=user[0].friends[i].user;
						j++;
					}
				}
				if(amis.length!=0)
				{			
					db.users.find({_id: { $in: amis }},function(error,friends){
							response.render('friends',{user:currentuser, friends:friends});
					});
				}
				else
				{
					response.render('friends',{user:currentuser});
				}
			}
			else
			{
				response.render('friends',{user:currentuser});
			}


		
		});

};

exports.pendingRequests=function(request,response){
		var currentuser=request.session.user;

		db.users.find({_id:currentuser},function(error,user){
			var dde=new Array;
			var j=0;
			var nbddes=0;
			if (user[0].friends!=undefined)
			{	
				for(var i=0;i<user[0].friends.length;i++)
				{
					if (user[0].friends[i].confirmed==false && user[0].friends[i].demandeur!=currentuser) 
					{
						dde[j]=user[0].friends[i].demandeur;
						j++;
					}
				}
				if (dde.length!=0) 
				{
					db.users.find({_id:{$in:dde}},function(error,requests){
						response.render('requests',{user:currentuser,demandes:requests});
					});
				}
				else
				{
					response.render('requests',{user:currentuser});
				}
			}
			else
			{
				response.render('requests',{user:currentuser});
			}
		});
};

exports.confirmRequest=function(request,response){
		var currentuser=request.session.user;
		var demandeur=request.params.id.toLowerCase();

		db.users.find({_id:currentuser},function(error,user){
			db.users.update({"_id":currentuser},
				{
					$pull:{"friends":{user:demandeur,confirmed:false}}
				}
			);
			db.users.update({"_id":currentuser},
				{
					$push:{"friends":{user:demandeur,confirmed:true}}
				}
			);

			db.users.update({"_id":demandeur},
				{
					$pull:{"friends":{user:currentuser,confirmed:false}}
				}
			);
			db.users.update({"_id":demandeur},
				{
					$push:{"friends":{user:currentuser,confirmed:true}}
				}
			);
			response.redirect('/profil/'+demandeur.toString());
		});
};

exports.rejectRequest=function(request,response){
		var currentuser=request.session.user;
		var demandeur=request.params.id.toLowerCase();

		db.users.find({_id:currentuser},function(error,user){
			db.users.update({"_id":currentuser},
				{
					$pull:{"friends":{user:demandeur,confirmed:false}}
				}
			);
			

			db.users.update({"_id":demandeur},
				{
					$pull:{"friends":{user:currentuser,confirmed:false}}
				}
			);
			
			response.redirect('/profil/'+demandeur.toString());
		});
};

exports.deleteFriend=function(request,response){
		var currentuser=request.session.user;
		var toDelete=request.params.id.toLowerCase();

		db.users.find({_id:currentuser},function(error,user){

			db.users.update({"_id":currentuser},
				{
					$pull:{"friends":{user:toDelete,confirmed:true}}
				}
			);

			db.users.update({"_id":toDelete},
				{
					$pull:{"friends":{user:currentuser,confirmed:true}}
				}
			);
			
			response.redirect('/friends');
		});
};


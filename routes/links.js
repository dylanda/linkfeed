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

//dateFormat
var dateFormat = require('dateformat');

//ajout d'un lien

exports.newLink=function(request,response){
		var tagsarray = request.body.tags.split(",");
		var lien={url:request.body.url, title:request.body.titre, description:request.body.description, tags:tagsarray, user:request.session.user, date: dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss")};
		db.liens.insert(lien);
		console.log("Nouveau lien enregistré");
		response.redirect('/profil');
};

//affichage des liens du profil

exports.profileLinks=function(request,response){
                var auteur=request.session.user;
                db.users.find({_id:auteur},function(error,user){
                        var dde=new Array;
                        var j=0;
                        if (user[0].friends != undefined)
                        {        
                                for(var i=0;i<user[0].friends.length;i++)
                                {
                                        if (user[0].friends[i].confirmed==false && user[0].friends[i].demandeur!=auteur) 
                                        {
                                                dde[j]=user[0].friends[i].demandeur;
                                                j++;
                                        }
                                }
                        }

                        db.liens.find({user:auteur},function(err,link){
                        
                                // RECUPERATION TAGS dans DATA
                                db.users.find({},function(err,users){
                                
                                        var data = new Array();
                                        var k = 0;
                                        for (var i=0; i<link.length; i++) {
                                                if(link[i].tags!=null){
                                                        for (var j=0; j<link[i].tags.length; j++) {
                                                                data[k] = "#"+link[i].tags[j];
                                                                k = k +1;
                                                        }
                                                }
                                        }
                                // FIN        
                                        response.render('profil',{links: link, data:data, user:user, nbddes:dde.length});
                                });
                        });
                });
};

// affichage des liens du feed

exports.feedLinks=function(request,response){
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
		
		
		db.liens.find({user: { $in: confirmedfriends }},function(err,link){

				// RECUPERATION TAGS dans DATA
			db.users.find({},function(err,users){
			
				var data = new Array();
				var k = 0;
				for (var i=0; i<link.length; i++) {
					if(link[i].tags!=null && link[i].tags instanceof Array){
						for (var j=0; j<link[i].tags.length; j++) {
							data[k] = "#"+link[i].tags[j];
							k = k +1;
						}
					}
				}
				/*for (var i=0; i<users.length; i++) {
					if (users[i]._id != request.session.user){
						data[k] = "\"@"+users[i]._id+"\"";
						k = k +1;
					}
				}*/
			// FIN	
				response.render('feed',{links: link, data:data, user:request.session.user});
			});
		});
	});
};

//supprimer lien

exports.deleteLink=function(req,res){
	var ObjectID = require('mongodb').ObjectID;
	var idString = req.params.id;
	db.liens.remove({_id: new ObjectID(idString)});
	res.redirect('/profil');
};

//modifier lien

exports.updateLink=function(req,res){
	var ObjectID = require('mongodb').ObjectID;
	var idString = req.params.id;
	var tagsarray = req.body.tags.split(",");
	var lien={ $set: {title:req.body.titre, description:req.body.description, tags:tagsarray, user:req.session.user}};
	db.liens.update({_id: new ObjectID(idString)}, lien);
	res.redirect('/profil');
};


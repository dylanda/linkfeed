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

exports.login=function(request,response){
		var data = request.body.username.toLowerCase().trim();
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(data)){
			db.users.find({email:data},function(error,user){
					if(user.length==0 || user[0].mdp != request.body.mdp){
						response.render('index',{messageError:'Mauvais login ou mot de passe'});
					}
					else{
						request.session.user = user[0]._id;
						response.redirect('/feed');
					}
			});
		}
		else
		{
			db.users.find({_id:data},function(error,user){
					if(user.length==0 || user[0].mdp != request.body.mdp){
						response.render('index',{messageError:'Mauvais login ou mot de passe'});
					}
					else{
						request.session.user = data;
						response.redirect('/feed');
					}
			});
		}
};

exports.register=function(request,response){
		var username = request.body.username.toLowerCase().trim();
		db.users.find({$or :[{_id:username},{email:request.body.email.toLowerCase().trim()}]},function(error,user){
				if(user.length==0){
					db.users.insert({_id:username, mdp:request.body.mdp, date_ins: dateFormat(new Date(), "yyyy-mm-dd"), email:request.body.email.toLowerCase().trim()});
					request.session.user = username;
					response.redirect('/feed');
				}
				else{
					response.render('index',{messageError2:"Le nom d'utilisateur ou l'adresse email est déjà utilisé."});
				}
		});
};

exports.profil=function(request,response){
		var userdisp=request.params.id.toLowerCase();
		db.users.find({_id:userdisp},function(error,user){
				if(user.length!=0 && userdisp!=request.session.user){
					db.liens.find({ $query: {user:userdisp}, $orderby: { date : -1 } },function(err,link){
						response.render('profildisp',{links: link, userdisp:user, currentuser:request.session.user});
					});
				}
				else{
					response.redirect('/profil');
				}
		});
};

exports.usersList=function(request,response){
		var user=request.session.user;
		
		db.users.find({_id: user},function(error,currentuser){
			var amis=new Array;
			var j=0;
			if (currentuser[0].friends!=undefined)
			{
				for (var i= 0; i<currentuser[0].friends.length; i++)
				{ 
					if (currentuser[0].friends[i].confirmed==true)
					{
						amis[j]=currentuser[0].friends[i].user;
						j++;
					}
				}
			}

		
		
			db.users.find({$query: {$and: [{ _id: { $nin: amis } },{_id: {$ne: user} }]}, $orderby: { date_ins : -1 } },function(error,users){
				db.liens.find({ user: { $ne: user } },function(error,liens){
				
						// RECUPERATION USERS dans DATA
					db.users.find({},function(err,datausers){
					
						var data = new Array();
						var k = 0;

						for (var i=0; i<datausers.length; i++) {
							if (datausers[i]._id != request.session.user){
								data[k] = "@"+datausers[i]._id;
								k = k +1;
							}
						}
						
					// FIN	
						response.render('users',{users: users, currentuser:user, links:liens, data:data});
					});
				});
			});
		});
};

exports.updatePass=function(request,response){
	var modif={ $set: {mdp:request.body.mdp}};
	db.users.update({_id:request.session.user}, modif);
	response.redirect('/profil');
};

exports.updateEmail=function(request,response){
	db.users.find({email:request.body.email.toLowerCase().trim()},function(error,user){
				if(user.length==0){
					modif={$set:{email:request.body.email.toLowerCase().trim()}};
					db.users.update({_id:request.session.user},modif);
					response.redirect('/profil');
				}
				else
				{
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

                        db.liens.find( { $query: {user:auteur}, $orderby: { date : -1 } } ,function(err,link){
                        
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
                                        response.render('profil',{links: link, data:data, user:user, nbddes:dde.length,messageError:"L'adresse email est déjà utilisée."});
                                });
                        });
                	});
				}
		});
};

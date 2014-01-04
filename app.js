var express=require('express');

var app = express();

//--------------------------------------
// 			Définition des routes
//--------------------------------------
var connect=require('./routes/connect.js');
var users=require('./routes/users.js');
var links=require('./routes/links.js');
var search=require('./routes/search.js');
var friendship=require('./routes/friendship.js');


//------------------------------
// 			Configuration
//------------------------------

app.configure(function(){
		app.set('views',__dirname + '/views');
		app.set('view engine','jade');
		app.use(express.bodyParser());
		app.use(express.static(__dirname + '/public'));
		app.use(express.cookieParser());
		  app.use(express.cookieSession({
			secret: 'mySecret',
			cookie: { maxAge: 60 * 60 * 1000 }
		  }));
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

app.get('/',requiresLogin, connect.index);

//------------------------------
//			Users
//------------------------------

app.post('/user/login', users.login);
app.post('/user/new', users.register);
app.get('/users',requiresLogin, users.usersList);

//modifier son mot de passe
app.post('/updatePass',requiresLogin,users.updatePass);

//modifier son email
app.post('/updateEmail',requiresLogin,users.updateEmail);

//Supprimer compte
app.post('/deleteAccount',requiresLogin, users.deleteAccount);
//--------------------------------------
// 				Profils & Liens
//--------------------------------------

app.post('/lien/new',requiresLogin, links.newLink);

//affichage des liens du profil
app.get('/profil',requiresLogin, links.profileLinks);

//affichage des liens du profil de qq1
app.get('/profil/:id',requiresLogin, users.profil);

//afficher tous les liens dans le feed
app.get('/feed',requiresLogin, links.feedLinks);

//supprimer lien
app.get('/delete/:id',requiresLogin, links.deleteLink);

//modifier lien
app.post('/update/:id',requiresLogin, links.updateLink);

//ajouter un lien d'un contact dans sa liste de contact
app.get('/reshare/:id',requiresLogin,links.reshare);

//------------------------------------
// 			friendship system
//------------------------------------

//voir amis
app.get('/friends',requiresLogin, friendship.friends);

//ajouter un ami
app.get('/addFriend/:id',requiresLogin,friendship.addFriend);

//consulter ses demandes en attente
app.get('/pendingRequests',requiresLogin,friendship.pendingRequests);

//accepter une requête
app.get('/confirmRequest/:id',requiresLogin,friendship.confirmRequest);

//rejeter une requete
app.get('/rejectRequest/:id',requiresLogin,friendship.rejectRequest);

//supprimer un lien d'amitié
app.get('/deleteFriend/:id',requiresLogin,friendship.deleteFriend);

//------------------------------------
// 			filtres
//------------------------------------

//filtrage par tags dans le profil
app.post('/profil/search',requiresLogin, search.searchInProfile);

//filtrage par tags dans le feed
app.post('/feed/search',requiresLogin, search.searchInFeed);

//filtrage par utilisateurs dans la liste d'utilisateurs
app.post('/users/search',requiresLogin, search.searchInUsers);

//----------------------------------
//			fermeture session
//----------------------------------
app.get("/user/logout", connect.logout);


//----------------------------------
//	PAGE NOT FOUND
//----------------------------------

app.use(function(req, res, next){
    res.status(404).render('404', {title: "Désolé, page introuvable!"});
});




var port_express = process.env.PORT || 5000;
app.listen(port_express);
console.log('Express server listening on port '+port_express);


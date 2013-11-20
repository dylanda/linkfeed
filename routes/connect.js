//index

exports.index=function(request,response){
		response.redirect("/feed");
};

//deconnexion
exports.logout=function(request, response){
        if(request.session.user){
                request.session.user=undefined;
        }
        response.redirect('/');
};
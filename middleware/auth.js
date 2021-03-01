const jwt = require('jsonwebtoken');


var functions={

userAuth : function (req, res, next)  {
   if(req.headers.authorization && req.headers.authorization!==""){
        var bearerHeader = req.headers.authorization;
        if(typeof bearerHeader !== "undefined" ){
            var bearer = bearerHeader.split(" ");
            if(bearer.length>1){
                bearerHeader = bearer[1];
            }
        }  
        var authorization = bearerHeader;

        jwt.verify(authorization,config.jwtToken, async function(err, decoded){
          if(decoded){
               req.id = decoded.id;
               req.phoneNumber = decoded.phoneNumber;

               req.countryCode = decoded.countryCode;
               req.parentCompany = decoded.parentCompany;
               req.token = authorization;
               if(req.headers.companyid && req.headers.companyid!="")
               req.companyId = req.headers.companyid;
              else   req.companyId = "";
               //else  return responseHelper.error(res, appstrings.company_mising);

               req.userType = decoded.userType;
               req.myCompanyId = decoded.myCompanyId;
               var userData=null
               
              if(req.userType==1) 
              { userData = await USER.findOne({
                    where: {
                id: decoded.id,
                status: 1,
          
                    }
                 }) 


               }
               else{

                     userData = await EMPLOYEE.findOne({
                         where: {
                     id: decoded.id,
                     status: 1,
               
                         }
                      }) 
       
               }
               if(userData) {req.userData=userData.dataValues
               next();
               }
               else   return responseHelper.unauthorized(res, appstrings.blocked);

          }else{

               return responseHelper.unauthorized(res, appstrings.invalid_token);

              // return res.json(401,jsonResponses.response(3, appstrings.invalid_token, null));
                 } 
              	});
          } 
          else{
               return responseHelper.unauthorized(res, appstrings.invalid_token);

               //return res.json(401,jsonResponses.response(3, appstrings.invalid_token, null));
          }
   
   
   
   
},
    
restAuth : function (req, res, next)  {
    if(req.headers.authorization && req.headers.authorization!==""){
         var bearerHeader = req.headers.authorization;
         if(typeof bearerHeader !== "undefined" ){
             var bearer = bearerHeader.split(" ");
             if(bearer.length>1){
                 bearerHeader = bearer[1];
             }
         }  
         var authorization = bearerHeader;
 
         jwt.verify(authorization,config.jwtToken, async function(err, decoded){
           if(decoded){
                req.id = decoded.id;
                req.phoneNumber = decoded.phoneNumber;
                req.countryCode = decoded.countryCode;
                req.parentCompany = decoded.parentCompany;

                req.token = authorization;
 
                if(req.headers.companyid && req.headers.companyid!="")
                req.companyId = req.headers.companyid;
               else   req.companyId = "";
 
                //else  return responseHelper.error(res, appstrings.company_mising);
 
                req.userType = decoded.userType;
                req.myCompanyId = decoded.myCompanyId;
                var userData=null
                
               userData = await COMPANY.findOne({
                     where: {
                 id: decoded.id,
                 status: 1,
           
                     }
                  }) 
 
 
                
               
                if(userData) {req.userData=userData.dataValues
                next();
                }
                else   return responseHelper.error(res, appstrings.blocked);
 
           }else{
 
                return responseHelper.unauthorized(res, appstrings.invalid_token);
 
               // return res.json(401,jsonResponses.response(3, appstrings.invalid_token, null));
                  } 
                   });
           } 
           else{
                return responseHelper.unauthorized(res, appstrings.invalid_token);
 
                //return res.json(401,jsonResponses.response(3, appstrings.invalid_token, null));
           }
    
    
    
    
 },
    
adminAuth :async function (req, res, next)  {
    //console.log(req.session)
     if(req.session.userData && (req.session.role==2 || req.session.role==3)){

        
                 req.id = req.session.userId;
                 req.phoneNumber = req.session.phoneNumber;
                 req.countryCode =  req.session.countryCode;
                 req.token =  req.session.token;
                 req.companyId =  req.session.companyId;
                 req.parentCompany = req.session.parentCompany;
                 adminRole = req.session.role;
                 req.role = req.session.role;

                 req.type =  req.session.type;

                var userData = await COMPANY.findOne({
                    where: {
                id: req.session.userId,
                status: 1,
          
                    }
                 }) 


                 if(userData)  next();
                else  return responseHelper.error(res, appstrings.blocked);
     
     }
      else{
         // console.log("HERE>>>>>>>>>>>>>",adminpath)
           req.flash("errorMessage",appstrings.session_expired)
          return res.redirect(adminpath+"login");
          //return res.render('admin/dashboard/login.ejs');

      }

     
  },

superAuth : async  function (req, res, next)  {
    if(req.session.userData && req.session.role==1){

                req.id = req.session.userId;
                req.phoneNumber = req.session.phoneNumber;
                req.countryCode =  req.session.countryCode;
                req.token =  req.session.token;
                req.companyId =  req.session.companyId;
                req.parentCompany = req.session.parentCompany;
                req.role = 1;

                req.type =  req.session.type;
                var userData = await COMPANY.findOne({
                    where: {
                id: req.session.userId,
                status: 1,
          
                    }
                 }) 


                 if(userData)  next();
                else  return responseHelper.error(res, appstrings.blocked);
     }
     else{
          req.flash("errorMessage",appstrings.session_expired)
         return res.redirect(superadminpath+"login");
     }

    
 },

 mainAuth :function (req, res, next)  {
    if(req.session.userData && req.session.role==0){

                req.id = req.session.userId;
                req.phoneNumber = req.session.phoneNumber;
                req.countryCode =  req.session.countryCode;
                req.token =  req.session.token;
                req.companyId =  req.session.companyId;
                req.parentCompany = req.session.parentCompany;
                req.type =  req.session.type;
                next();
     }
     else{
          req.flash("errorMessage",appstrings.session_expired)
         return res.redirect(mainpath+"login");
     }

    
 }


}

module.exports=functions


   
   
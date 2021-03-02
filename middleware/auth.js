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
     if(req.session.userData1 && (req.session.role1==2 || req.session.role1==3)){

        
                 req.id = req.session.userId1;
                 req.phoneNumber = req.session.phoneNumber1;
                 req.countryCode =  req.session.countryCode1;
                 req.token =  req.session.token1;
                 req.companyId =  req.session.companyId1;
                 req.parentCompany = req.session.parentCompany1;
                 adminRole = req.session.role1;
                 req.role = req.session.role1;
                 req.type =  req.session.type1;
                var userData = await COMPANY.findOne({
                    where: {
                id: req.session.userId1,
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
    if(req.session.userDataMain && req.session.roleMain==0){

                req.id = req.session.userIdMain;
                req.phoneNumber = req.session.phoneNumberMain;
                req.countryCode =  req.session.countryCodeMain;
                req.token =  req.session.tokenmain;
                req.companyId =  req.session.companyIdMain;
                req.parentCompany = req.session.parentCompanyMain;
                req.type =  req.session.typeMain;
                next();
     }
     else{
          req.flash("errorMessage",appstrings.session_expired)
         return res.redirect(mainpath+"login");
     }

    
 }


}

module.exports=functions


   
   
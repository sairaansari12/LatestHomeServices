
const express = require('express');
const app     = express();
const bcrypt  = require('bcryptjs');
const v       = require('node-input-validator');
const jwt     = require('jsonwebtoken');
const hashPassword = require('../../helpers/hashPassword');
const Op = require('sequelize').Op;
const COMPANY= db.models.companies;
const STAFFROLE= db.models.staffRoles;
function isAdminAuth(req, res, next) {
    if(req.session.userData){
      return next();
    }
    return res.redirect('/company');
  }
/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/
app.get('/', adminAuth,async (req, res, next) => {
    try {
        const findData = await DOCUMENT.findOne({
          where :{companyId :req.id }
        });

        const compData = await COMPANY.findOne({
          where :{id :req.id }
        });

        return res.render('admin/settings/settings.ejs',{data:findData,compData});
      } catch (e) {
          console.log(e)
        req.flash('errorMessage',e.message)
        return res.redirect(adminpath);
      }
  
});


app.get('/restSettings', adminAuth,async (req, res, next) => {
  try {
     

      const compData = await COMPANY.findOne({
        where :{id :req.id }
      });

      return res.render('admin/settings/restSettings.ejs',{compData});
    } catch (e) {
        console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath);
    }

});


app.post('/update',adminAuth,async(req,res,next) => { 
  
  var params=req.body
    try{

      const findData = await DOCUMENT.findOne({
        where: {
          companyId: req.id
        }
      });
      if(findData)
      {
    
       var response= await DOCUMENT.update({ 
          aboutus: params.aboutus,
          aboutusLink:  params.aboutusLink,
          privacyContent:  params.privacyContent,
          privacyLink:  params.privacyLink,
          termsContent:  params.termsContent,
          termsLink:  params.termsLink,
          websiteLink:  params.websiteLink,
          facebookLink:  params.facebookLink,
          gmailLink:  params.gmailLink,
          linkedinLink:  params.linkedinLink,
          twitterLink:  params.twitterLink,
          instaLink:  params.instaLink,
          currency:  params.currency,
          language:  params.language,
          autoAssign:  params.autoAssign,
          staffPref:  params.staffPref,
          onelPValue:  params.onelPValue,
          loyalityPoints:  params.loyalityPoints,
          lpProMember:params.lpProMember,
          lpOrderPercentage:  params.lpOrderPercentage,
          targetSales:  params.targetSales,
          companyId: req.id,
          cancellationPolicy:params.cancellationPolicy,
          cancellationLink:params.cancellationLink,
          cancellationCharges:params.cancellationCharges,

        },
        {
          where: { 
            id: findData.dataValues.id
          }
        }) ; 
        CURRENCY=params.currency
        return responseHelper.post(res, appstrings.update_success,null,200);
      }
      else{
        var response= await DOCUMENT.create({ 
          aboutus: params.aboutus,
          aboutusLink:  params.aboutusLink,
          privacyContent:  params.privacyContent,
          privacyLink:  params.privacyLink,
          termsContent:  params.termsContent,
          termsLink:  params.termsLink,
          websiteLink:  params.websiteLink,
          facebookLink:  params.facebookLink,
          gmailLink:  params.gmailLink,
          linkedinLink:  params.linkedinLink,
          twitterLink:  params.twitterLink,
          instaLink:  params.instaLink,
          currency:  params.currency,
          language:  params.language,
          autoAssign:  params.autoAssign,
          staffPref:  params.staffPref,
          onelPValue:  params.onelPValue,
          loyalityPoints:  params.loyalityPoints,
          lpProMember:params.lpProMember,
          cancellationPolicy:params.cancellationPolicy,
          cancellationLink:params.cancellationLink,
          lpOrderPercentage:  params.lpOrderPercentage,
          cancellationCharges:params.cancellationCharges,
          companyId: req.id
        }) ; 
        CURRENCY=params.currency
        if(response)return responseHelper.post(res, appstrings.update_success,null,200);

        else  return responseHelper.post(res, appstrings.oops_something,null,200);
      }
    }catch (e) {
      console.log(e)
        return responseHelper.error(res, e.message);
    }
});


app.post('/updateRestSettings',adminAuth,async(req,res,next) => { 
  
  var params=req.body
    try{

       var response= await COMPANY.update({ 
          deliveryType: params.deliveryType,
          itemType:  params.itemType,
          startTime: params.startTime,
          endTime:  params.endTime,
        },
        {
          where: { 
            id: req.id
          }
        }) ; 
        return responseHelper.post(res, appstrings.update_success,null,200);
      
    }catch (e) {
      console.log(e)
        return responseHelper.error(res, e.message);
    }
});

app.get('/changePassword',adminAuth, async (req, res, next) => {
   return res.render(adminfilepath+'dashboard/changePassword.ejs');
});

///////////////////////////////////////////////////////
/////////////////////// Staff Roles ////////////////////////
//////////////////////////////////////////////////////

///////////////////////////////////////////////////////
/////////////////////// User Roles ////////////////////////
//////////////////////////////////////////////////////



app.get('/points', adminAuth, async (req, res, next) => {
  try {
    const findData = await DOCUMENT.findOne({
      where: { companyId: req.id }
    });

    return res.render('admin/settings/points.ejs', { data: findData });
  } catch (e) {
    console.log(e)
    req.flash('errorMessage', e.message)
    return res.redirect(adminpath);
  }

});



app.post('/points', adminAuth, async (req, res) => {
  try {

    var params = req.body
    let responseNull = commonMethods.checkParameterMissing([params.lpReferral1, params.lpReferral2])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

    const findData = await DOCUMENT.findOne({
      where: { companyId: req.id }
    });
    var response = null
    if (findData) {
      response = await DOCUMENT.update({
        aboutus: params.aboutus,
        lpReferral1: params.lpReferral1,
        lpReferral2: params.lpReferral2,
      }, {
        where: { id: params.documentId }
      });

    }
    else {
      response = await DOCUMENT.create({
        aboutus: params.aboutus,
        lpReferral1: params.lpReferral1,
        lpReferral2: params.lpReferral2,
        companyId: req.id

      });

    }
    console.log("RESPOSNE>>>>>>>>>>", response)
    if (response) return responseHelper.post(res, appstrings.update_success, null, 200);
    else return responseHelper.post(res, appstrings.oops_something, null, 400);


  } catch (e) {
    console.log(e)
    return responseHelper.post(res, e.message, null, 400);

  }

});



///////////////////////////////////////////////////////
/////////////////////// Staff Roles ////////////////////////
//////////////////////////////////////////////////////
app.get('/roles', adminAuth, async (req, res, next) => {
  const findData = await STAFFROLE.findAll({
    where: {
      companyId: req.id
    }
  });
  return res.render('admin/settings/roles.ejs', { data: findData });
});
/**
*@role Add New Role
*/
app.post('/role/add', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    const findData = await STAFFROLE.findOne({
      where: {
        companyId: req.id,

        [Op.or]: [{ userType: data.name},{roleId: data.roleId}]
       
      }
    });
    if (findData) {
      return responseHelper.post(res, "Already Exist!", null, 400);
    } else {

      

      const users = await STAFFROLE.create({
        userType: data.name,
        companyId: req.id,
        roleId:data.roleId
      });
    }
    return responseHelper.post(res, appstrings.success, null, 200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/**
*@role Delete Staff Role
*/
app.get('/role/delete/:id', adminAuth, async (req, res, next) => {
  try {
    const numAffectedRows = await STAFFROLE.destroy({
      where: {
        id: req.params.id,
        companyId: req.companyId
      }
    })
    if (numAffectedRows > 0) {
      req.flash('successMessage', appstrings.delete_success)
      return res.redirect(adminpath + "settings/roles");
    }
    else {
      req.flash('errorMessage', appstrings.no_record)
      return res.redirect(adminpath + "settings/roles");
    }
  } catch (e) {
    req.flash('errorMessage', appstrings.no_record)
    return res.redirect(adminpath + "settings/roles");
  }
});

/**
*@role Add New Role
*/
app.post('/role/update', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    const findData = await STAFFROLE.findOne({
      where: {
        companyId: req.companyId,
        userType: data.nameedit,
        id: {
          [Op.ne]: data.istid
        }
      }
    });
    if (findData) {
      return responseHelper.post(res, "Already Exist!", null, 400);
    } else {
      const users = await STAFFROLE.update({
        userType: data.nameedit
      }, {
        where: {
          id: data.istid
        }
      });
    }
    return responseHelper.post(res, appstrings.success, null, 200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

///////////////////////////////////////////////////////
/////////////////////// User Roles ////////////////////////
//////////////////////////////////////////////////////
app.get('/userroles', adminAuth, async (req, res, next) => {
  const findData = await USERTYPE.findAll({
    where: {
      companyId: req.companyId
    }
  });
  return res.render('admin/settings/userroles.ejs', { data: findData });
});
/**
*@role Add New Role
*/
app.post('/userrole/add', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    const findData = await USERTYPE.findOne({
      where: {
        companyId: req.companyId,
        [Op.or]: [
          { userType:data.name},
           { id:data.roleId }
        ]
       
       
        
      }
    });
    if (findData) {
      return responseHelper.post(res, "Already Exist!", null, 400);
    } else {
      const users = await USERTYPE.create({
        userType: data.name,
        companyId: req.companyId,      
        id: data.roleId

      });
    }
    return responseHelper.post(res, appstrings.success, null, 200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


/**
*@role Add New Role
*/
app.post('/userrole/update', adminAuth, async (req, res) => {
  try {
    const data = req.body;
    const findData = await USERTYPE.findOne({
      where: {
        companyId: req.companyId,
        userType: data.nameedit,
        uid: {
          [Op.ne]: data.istid
        }
      }
    });
    if (findData) {
      return responseHelper.post(res, "Already Exist!", null, 400);
    } else {
      const users = await USERTYPE.update({
        userType: data.nameedit
      }, {
        where: {
          id: data.istid
        }
      });
    }
    return responseHelper.post(res, appstrings.success, null, 200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/**
*@role Delete Staff Role
*/
app.get('/userrole/delete/:id', adminAuth, async (req, res, next) => {
  try {
    const numAffectedRows = await USERTYPE.destroy({
      where: {
        uid: req.params.id,
        companyId: req.companyId
      }
    })
    if (numAffectedRows > 0) {
      req.flash('successMessage', appstrings.delete_success)
      return res.redirect(adminpath + "settings/userroles");
    }
    else {
      req.flash('errorMessage', appstrings.no_record)
      return res.redirect(adminpath + "settings/userroles");
    }
  } catch (e) {
    req.flash('errorMessage', appstrings.no_record)
    return res.redirect(adminpath + "settings/userroles");
  }
});


app.get('/charges', adminAuth, async (req, res, next) => {
  const findData = await SHIPMENT.findOne({
    where: {
      companyId: req.id
    }
  });
  return res.render('admin/settings/charges.ejs', { data: findData });
});


app.post('/chargesUpdate', adminAuth, async (req, res) => {
  try {
    const params = req.body;
    var chargesId = params.chargesId
    let responseNull = common.checkParameterMissing([params.extraDistanceCharges, params.freeUptoDistance, params.radius])
    if (responseNull) return responseHelper.error(res, appstrings.required_field, 400);
    var response = null
    if (chargesId != "") {
      response = await SHIPMENT.update(
        {
          radius: params.radius,
          freeUptoDistance: params.freeUptoDistance,
          extraDistanceCharges: params.extraDistanceCharges
        },
        {
          where: {
            companyId: req.id,

          }
        }
      );
    }

    else {
      response = await SHIPMENT.create(
        {
          radius: params.radius,
          freeUptoDistance: params.freeUptoDistance,
          extraDistanceCharges: params.extraDistanceCharges,
          companyId: req.id
        },

      );

    }


    if (response)
      return responseHelper.post(res, appstrings.charge_update_success, null, 200);
    else
      return responseHelper.post(res, appstrings.oops_something, null, 400);


  } catch (e) {
    return responseHelper.error(res, e.message, null, 400);
  }

})





module.exports = app;

//Edit User Profile

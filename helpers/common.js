const config = require('config');
const jwt = require('jsonwebtoken');
const moment = require('moment');


var methods={

 userId :  (token) => {
    const decoded = jwt.verify(token, config.jwtToken);
    return decoded.id;
},
 companyId : (token) => {
    const decoded = jwt.verify(token, config.jwtToken);
    return decoded.companyId;
},

 timestamp : () => {
	return time = moment.utc().format('X');
},

checkParameterMissing :   function(params)
{

for(var k=0;k<params.length;k++)
{

if(params[k]==undefined || params[k]=="")

{
 return true
}

if(k==params.lenth-1)
return false

}

},
uploadFunction:  function(req,res,imageName)
{
    ImageFile = req.files.image;    
    ImageFile.mv(config.mediapath + imageName, function (err) {
        if(err){
            return responseHelper.error(res, 'Unable to upload image', 400);
        }
        console.log('Upload Successfully');
    });
}
}
module.exports=methods

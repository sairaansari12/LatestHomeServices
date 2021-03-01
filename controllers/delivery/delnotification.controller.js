
const express = require('express');
const app     = express();



app.get('/',checkAuth, async (req, res, next) => {
    
    try {
        const findData = await NOTIFICATION.findAll({
        where :{userId :req.id,role:4},
        order: [
          ['createdAt','DESC']
        ],      

        });

        await NOTIFICATION.update({readStatus:1},
         { where :{userId :req.id,role:4}
          });
          if(findData.length>0) return responseHelper.post(res, appstrings.success,findData)
          else
       return responseHelper.post(res, appstrings.no_record,null,204);
      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.delete('/clearAll',checkAuth,async(req,res,next) => { 
   
  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await NOTIFICATION.destroy({
          where: {
            userId: req.id,
            role:4
          }
          })  
            
          if(numAffectedRows>0)
          {
            return responseHelper.post(res, appstrings.success,null);


          }

          else {
            return responseHelper.post(res, appstrings.no_record,null,204);

          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          return responseHelper.error(res, e.message, 400);

        }
});




module.exports = app;

//Edit User Profile

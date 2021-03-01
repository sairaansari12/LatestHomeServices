const fs = require('fs');
var ejs = require('ejs');
var FCM = require('fcm-node');
var apn = require('apn');
var fcm = new FCM(config.NOTIFICATION_KEY);
//   const Op = require('sequelize').Op;

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: 465,
    secure: true, // use SSL
    //service: 'gmail',a
    auth: {
        user: config.EMAIL_KEY,
        pass: config.EMAIL_PASS
    }
});




var methods = {




    insertNotification: async function (params) {

        if (params.default) defaultAdd = params.default
        try {


            // const findData = await NOTIFICATION.findOne({
            //   where: {
            //     userId:params.userId,
            //     role: params.role,
            //     notificationTitle: params.title,

            //   }
            // });

            // if(findData) {
            //   NOTIFICATION.destroy({where:{id:findData.dataValues.id}})
            // }

            NOTIFICATION.create({
                notificationTitle: params.title,
                notificationDescription: params.description,
                userId: params.userId,
                orderId: params.orderId,
                role: params.role,
                createdAt:new Date()
            });
        }
        catch (e) {
            console.log(e)
        }

    },



    sendMail: function (emails, data) {
        var index = fs.readFileSync('html/myFile.html', 'utf8');

        var mailOptions = {
            from: config.REMINDER_MAIL,
            to: emails,
            subject: config.INVOICE_SUBJECT,
            // forceEmbeddedImages: true,
            html: data
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });


    },



    sendPushMail: function (title, emails, data) {

        var mailOptions = {
            from: config.REMINDER_MAIL,
            to: emails,
            subject: title,
            // forceEmbeddedImages: true,
            html: data
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });


    },

    sendForgotPasswordMail: function (emails, data) {
        var index = fs.readFileSync('html/forgot.html', 'utf8');
        var renderedHtml = ejs.render(index,
            data);
        var mailOptions = {
            from: config.REMINDER_MAIL,
            to: emails,
            subject: config.FOROGT_SUBJECT,
            // forceEmbeddedImages: true,
            html: renderedHtml
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });


    },

    sendNotification: function (params) {
        var tokens = [];

        if (typeof params.token == 'string') tokens.push(params.token)
        else tokens = params.token;
        var title = params.title;
        var description = params.description;
        var count = params.count;
        if(tokens)
        for (var k = 0; k < tokens.length; k++) {
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: tokens[k],
                //   collapse_key: 'your_collapse_key',
                "notification": {
                    title: title,
                    body: description
                },
                "priority": "high",
                "data": {
                    notificationType: params.notificationType,
                    message: description,
                    title: title,
                    orderId: params.orderId,
                    body: description,
                    status: params.status,
                    sound: 'default'
                },
            };

            //console.log(JSON.stringify(message))

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("FCM  Error >>>>>>>>>> " + err);

                } else {
                    console.log("FCM  Success >>>>>>>>>> " + response);

                }
            });

        }

    },

    sendEmpNotification: function (params) {
        var fcm = new FCM(config.NOTIFICATION_EMP_KEY);
        //console.log(">>>>>>>>>>>>>>>>>",config.NOTIFICATION_EMP_KEY)

        var tokens = [];

        if (typeof params.token == 'string') tokens.push(params.token)
        else tokens = params.token;
        var title = params.title;
        var description = params.description;
        var count = params.count;

        //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",tokens)
        for (var k = 0; k < tokens.length; k++) {
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: tokens[k],
                //   collapse_key: 'your_collapse_key',
                "notification": {
                    title: title,
                    body: description
                },
                "priority": "high",
                "data": {
                    notificationType: params.notificationType,
                    message: description,
                    title: title,
                    body: description,
                    orderId: params.orderId,
                    status: params.status,
                    sound: 'default'
                },
            };


            //console.log(message)



            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("FCM  Error >>>>>>>>>> " + err);

                } else {
                    console.log("FCM  Success >>>>>>>>>> " + response);

                }
            });

        }

    }

    // //IOS
    // else{

    // var options = {
    //     token: {
    //         key: "ios_apn/AuthKey_NA473VZ29W.p8",
    //         keyId: "C3WZB9V37C",
    //         teamId: "QTPW9SY47V"
    //     },
    //     production: false
    // };


    // var apnProvider = new apn.Provider(options);

    // var note = new apn.Notification();
    // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 1;
    // note.sound = "ping.aiff";
    // note.alert = description //"\uD83D\uDCE7 \u2709 " + message;
    // note.payload = { 'title': title, "body": description};


    //  note.topic = "com.fleetmanagement.seasia";

    // note.badge=count;



    // apnProvider.send(note, tokens).then((result) => {
    //     if (result.sent.length == 0) {
    //         console.log("IOS Error >>>>>>>>>> " + result.failed[0].error);
    //     }
    //     else {
    //         console.log("IOS Success >>>>>>>>>> " + result.sent);

    //     }



    // });
    // }
    // //callback("done",null);


}







module.exports = methods
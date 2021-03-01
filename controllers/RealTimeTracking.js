var waterfall = require('async-waterfall');
var VEHICLE = db.models.vehicle
var ASSIGNED_DRIVER = db.models.assignDrivers
var JOBS = db.models.jobs



var RTController = {

    updateLocation: async function(jobId,empId, lat_long, callback) {
    var currentLat="", currentLong=""


        let responseNull = common.checkParameterMissing([jobId, lat_long])
        if (responseNull) callback("Parameters are missing", null)

        try {
            const dataResponse = await ORDERS.findOne({
                where: {
                    id: jobId
                }
            });


            var latArray = []
            var longtArray = []


            if (dataResponse) {

                if (dataResponse.dataValues.trackingLatitude && dataResponse.dataValues.trackingLatitude != "") {
                    latArray = (dataResponse.dataValues.trackingLatitude).toString().replace(/^\[|\]$/g, "").split(", ");
                    longtArray = dataResponse.dataValues.trackingLongitude.toString().replace(/^\[|\]$/g, "").split(", ");
                }



                //  var stringify=JSON.stringify(lat_long)
                //var new_lat_long=  JSON.parse(JSON.stringify(lat_long))
                // lat_long = lat_long.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
                //lat_long = lat_long.replace(/'/g, '"');

                // console.log(lat_long)
                var new_lat_long = lat_long

                // console.log("SIZE>>>"+new_lat_long.length)

                waterfall([
                    function(callback) {

                        for (var p = 0; p < new_lat_long.length; p++) {
currentLat=  new_lat_long[p].lat
currentLong=  new_lat_long[p].long
                     
 latArray.push(new_lat_long[p].lat)
                            longtArray.push(new_lat_long[p].long)
                            if (p == new_lat_long.length - 1)
                            {
                                callback(null, latArray);
                            }
                        }


                    }

                ], async function(err, result) {


                    latArray = "[" + latArray + "]"
                    longtArray = "[" + longtArray + "]"

                    //var sql =  await pool.format('UPDATE `jobs` SET  `location_latitude`=? ,`location_longitude` = ? WHERE `jobId` = ?',[latArray+'',longtArray+'',jobId]);

                    const updatedResponse = await ORDERS.update({
                        trackingLatitude: latArray,
                        trackingLongitude: longtArray,

                    }, {
                        where: {
                            id: jobId
                        }
                    });





                    const empData = await EMPLOYEE.update({
                        currentLat: currentLat,
                        currentLong: currentLong,

                    }, {
                        where: {
                            id: empId
                        }
                    });




                    callback(null, "success")


                })
            }
        } catch (err) {
            callback(err.message, null)
            console.log(err)

        }


    },

    updateDriverLocation: async function(driver_id, latitude, longitude, callback) {

        let responseNull = common.checkParameterMissing([driver_id, latitude, longitude])
        if (responseNull)
            callback("Parameters are missing", null)



        try {
            const dataResponse = await EMPLOYEE.findOne({
                attributes: ['id'],
                where: {
                    id: driver_id
                }
            });
            if (dataResponse) {

                const updatedResponse = await EMPLOYEE.update({
                    currentLat: latitude,
                    currentLong: longitude
                }, {
                    where: {
                        id: driver_id
                    }
                });


                callback(null, "success")
            } else {
                callback("No driver found", null)
            }

        } catch (err) {
            callback(err.message, null)
            console.log(err)

        }


    },




    getLocation: async function(jobId, driverId, callback) {


        let responseNull = common.checkParameterMissing([jobId])
        if (responseNull) callback("Parameters are missing", null)
        try {

            var dataResponse = await ORDERS.findOne({
                attributes:['id','trackingLatitude','trackingLongitude','orderNo'],
                where: {
                    id: jobId
                }
            });


            dataResponse=JSON.parse(JSON.stringify(dataResponse))

            if (dataResponse)

            {
                if(dataResponse.trackingLatitude)
                {
                var latitudes=dataResponse.trackingLatitude.replace(/^\[|\]$/g, "").split(",");
                var longitudes=dataResponse.trackingLongitude.replace(/^\[|\]$/g, "").split(",");

                dataResponse.trackingLatitude = latitudes
                dataResponse.trackingLongitude = longitudes
                dataResponse.lastLatitude=latitudes[latitudes.length-1]
                dataResponse.lastLongitude=longitudes[longitudes.length-1]
                }
                else{ dataResponse.lastLatitude=""
                dataResponse.lastLongitude=""}
                callback(null, dataResponse)

            } else {
                callback("no Associated Jobs Found", null)

            }
        } catch (err) {
            console.log(err)
            callback(err.message, null)

        }


    }
}



io.on("connection", function(socket) {

    console.log("one client is connected..................................");
    socket.on("socketFromClient", function(msg) {
        console.log(msg);
        RECIEVERSocketID = msg.driverId;
        //socket.join(userSocketID);
        socket.join(RECIEVERSocketID);

        //io.sockets.emit("responseFromServer",msg);
        var responseObj = {
            "result": "0",
            "message": "Success",
            "method": msg.methodName
        };


        console.log(msg.methodName)
        if (msg.methodName && msg.methodName == "updateLocation") {



            self.updateLocation(msg.orderId,msg.empId,msg.latLong, function(err, data) {

                if (data) {
                    responseObj['result'] = 1;
                    responseObj['data'] = data;
                } else {
                    responseObj['message'] = err;
                }
                //console.log(responseObj)
                io.sockets.emit("responseFromServer", responseObj);

            })


        }


        if (msg.methodName && msg.methodName == "updateDriverLocation") {


            self.updateDriverLocation(msg.empId, msg.latitude, msg.longitude, function(err, data) {

                if (data) {
                    responseObj['result'] = 1;
                    responseObj['data'] = data;
                } else {
                    responseObj['message'] = err;
                }
                io.sockets.emit("responseFromServer", responseObj);

            })


        }



        if (msg.methodName && msg.methodName == "getLocation") {
            self.getLocation(msg.orderId, msg.driverId, function(err, data) {


                if (data) {
                    responseObj['result'] = 1;
                    responseObj['data'] = data;
                } else {
                    responseObj['message'] = err;
                }

                io.sockets.emit("responseFromServer", responseObj);

            })
        }


    });
});



var self = module.exports = RTController
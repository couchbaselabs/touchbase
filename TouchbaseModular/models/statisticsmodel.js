var uuid                = require("uuid");
var forge               = require("node-forge");
var moment              = require("moment");
var async               = require("async");
var publishBucket       = require("../app").publishBucket;
var publishBucketName   = require("../config").couchbase.publishBucket;
var userBucket          = require("../app").userBucket;
var userBucketName      = require("../config").couchbase.userBucket;
var pictureBucket       = require("../app").pictureBucket;
var pictureBucketName   = require("../config").couchbase.pictureBucket;
var N1qlQuery           = require('couchbase').N1qlQuery;

function Statistics() { };

/*
Statistics.graph = function(callback) {
    // time unit is either days(for a week), or 'hours' (for a day)
    var graphObj = {'xWeek':[], 'weekTotal':[], 'weekDistinct':[], 'xDay':[], 'dayTotal':[], 'dayDistinct':[]};
    var currentTime = moment(new Date().toISOString());
    var week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var days = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
    var graphQuery = N1qlQuery.fromString("SELECT timeTracker.loginTimes AS logins FROM "+userBucketName);
    console.log(graphQuery);
    userBucket.query(graphQuery, function (error, result) {
        if (error) {
            console.log(error);
            return callback(error, null);
        }
        console.log(result);
        for (i=0; i<result.length; i++) {
            var dayDistinctBuffer = [];
            var weekDistinctBuffer = [];
            if (result[i].logins) {
                for (j=0; j<result[i].logins.length; j++) {
                    var logTime = moment(result[i].logins[j]);
                    var daysDifference = currentTime.diff(logTime, 'days');
                    if (daysDifference>=0 && daysDifference <7) {
                        if (!graphObj.weekTotal[daysDifference]) {
                            graphObj.weekTotal[daysDifference] = 1;
                        }
                        else {
                            graphObj.weekTotal[daysDifference]++; 
                        } 
                        weekDistinctBuffer[daysDifference] = 1;
                    }
                    var hoursDifference = currentTime.diff(logTime, 'hours');
                    if (hoursDifference>=0 && hoursDifference <24) {
                        if (!graphObj.dayTotal[hoursDifference]) {
                            graphObj.dayTotal[hoursDifference] = 1;
                        }
                        else {
                            graphObj.dayTotal[hoursDifference]++; 
                        }
                        dayDistinctBuffer[hoursDifference] = 1;
                    }
                }
                if (dayDistinctBuffer) {
                    for (x=0; x<dayDistinctBuffer.length; x++) {
                        if (dayDistinctBuffer[x]) {
                            if (!graphObj.dayDistinct[x]) {
                                graphObj.dayDistinct[x] = 1;
                            }
                            else {
                                graphObj.dayDistinct[x]++; 
                            }
                        }
                    }
                }
                if (weekDistinctBuffer) {
                    for (y=0; y<weekDistinctBuffer.length; y++) {
                        if (weekDistinctBuffer[y]) {
                            if (!graphObj.weekDistinct[y]) {
                                graphObj.weekDistinct[y] = 1;
                            }
                            else {
                                graphObj.weekDistinct[y]++; 
                            }
                        }
                    }
                }
                var day = moment().isoWeekday();
                var dayCounter = 0;
                while (dayCounter<7) {
                    var index = day+dayCounter-1;
                    if (index >=7) {
                        index = index-7;
                    }
                    graphObj.xWeek[dayCounter] = week[index];
                    dayCounter ++;
                }
                var currentHour = moment().hour();
                var hourCounter = 0;
                while (hourCounter<24) {
                    // console.log("currentHour: "+ currentHour+ "hourCounter: "+hourCounter);
                    var indi = currentHour+hourCounter;
                    if (indi >=24) {
                        indi -=24;
                    }
                    graphObj.xDay[hourCounter] = days[indi];
                    hourCounter ++;
                }

            }
            else {
                console.log('user has no logins');
            }
            //graphObj.xWeek.reverse();
            //graphObj.weekTotal.reverse();
            //graphObj.weekDistinct.reverse();
            //graphObj.xDay.reverse();
            graphObj.dayTotal.reverse();
            graphObj.dayDistinct.reverse();
        }
        callback(null, graphObj);
    });
};
*/

Statistics.newGraph = function (timeUnit, callback) {
    var graphObj = {};
    var dayQuery = N1qlQuery.fromString("SELECT DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"hour\") AS deltaTime, COUNT(*) AS countTime from "+userBucketName+" UNNEST timeTracker.loginTimes AS time GROUP BY DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"hour\") HAVING DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"hour\") < 24 ORDER BY deltaTime");
    var weekQuery = N1qlQuery.fromString("SELECT DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"day\") AS deltaTime, COUNT(*) AS countTime from "+userBucketName+" UNNEST timeTracker.loginTimes AS time GROUP BY DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"day\") HAVING DATE_DIFF_STR(STR_TO_UTC(NOW_STR()), time, \"day\") < 7 ORDER BY deltaTime");
    if (timeUnit === 'day') {
        userBucket.query(dayQuery, function (error, result) {
            if (error) {
                console.log(error);
                return callback(error, null);
            }
            graphObj.logins = Array.apply(null, Array(24)).map(Number.prototype.valueOf,0);
            graphObj.x = Array.apply(null, Array(24)).map(Number.prototype.valueOf,0);
            var hoursX = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
            var counter = 0;
            var starter = moment().hour();
            console.log(starter);
            while (counter < 24) {
                var index = 0;
                if ((starter-counter) < 0) {
                    index = (starter-counter) + 24;
                }
                else {
                    index = starter-counter;
                }
                graphObj.x[23-counter] = hoursX[index];
                counter++;
            }
            for (i=0; i<result.length; i++) {
                graphObj.logins[23-result[i].deltaTime] = result[i].countTime;
            }
            return callback(null, graphObj);
        });
    }
    else if (timeUnit === 'week') {
        userBucket.query(weekQuery, function (error, result) {
            if (error) {
                console.log(error);
                return callback(error, null);
            }
            graphObj.logins = Array.apply(null, Array(7)).map(Number.prototype.valueOf,0);
            graphObj.x = Array.apply(null, Array(7)).map(Number.prototype.valueOf,0);
            var weekX = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var counter = 0;
            var starter = moment().day();
            while (counter < 7) {
                var index = 0;
                if ((starter-counter) < 0) {
                    index = (starter-counter) + 7;
                }
                else {
                    index = starter-counter;
                }
                graphObj.x[6-counter] = weekX[index];
                counter++;
            }
            for (i=0; i<result.length; i++) {
                graphObj.logins[6-result[i].deltaTime] = result[i].countTime;
            }
            return callback(null, graphObj);
        });
    }
    else {
        return callback('please enter a valid timeUnit', null);
    }
};

module.exports = Statistics;
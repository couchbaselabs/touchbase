var User        = require("../models/usermodel");
var Picture     = require("../models/picturemodel");
var Publish     = require("../models/publishmodel");
var Session     = require("../models/sessionmodel");
var Statistics  = require("../models/statisticsmodel");
var configData  = require("../config.json").dataModel;
var uuid        = require("uuid");
var multer      = require("multer");
var async       = require("async");

var primaryAttribute    = configData.primaryAttribute;

var appRouter = function(app) {

    app.get("/api/graphData", Session.auth, function(req, res, next) {
        Statistics.newGraph(req.query.timeUnit, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            res.json(result);
        });
    });

    app.get("/api/verify/:verificationID", function(req, res) {
        Session.verify(req.params.verificationID, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            console.log(result); 
            res.redirect('../../../index.html');
        });
    });

    app.get("/api/createPrimaryIndexes", function(req, res) {
        User.createPrimaryIndexes(function (error, result) {
            if(error) {
                return res.status(400).send(error);
            }
            res.send(result);
        });
    });

    app.get("/api/getConfig", function(req, res) {
        res.json(configData); 
    });
    
    app.post("/api/loginAuth", function(req, res, next) {
        if(!req.body.email) {
            return next(JSON.stringify({"status": "error", "message": "A username must be provided"}));
        }
        if(!req.body.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        req.body.loginAuth = true;
        User.advancedSearch(req.body, function(error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            console.log('user: ' +  JSON.stringify(user));
            var x = [];
            x = user;
            if (x.length === 0) {
                return res.status(400).send('The username entered does not exist');   
            }
            if(!User.validatePassword(req.body.password, user[0].password)) {
                return res.status(400).send("The password entered is invalid");
            }
            if (!user[0].login.emailVerified) {
                return res.status(400).send("The username (email) entered is not yet verified, please verify before logging in.");
            }
            User.addLoginTime(user[0].uuid, function(error, result) {
                if(error) {
                    return res.status(400).send(error);
                }
                Session.create(user[0].uuid, function(error, result) {
                    if(error) {
                    return res.status(400).send(error);
                    }
                    res.send({sessionID: result.sessionID, expiry: result.expiry});
                });
            });
        });
    });

    app.post("/api/publishPost", Session.auth, function (req, res, next) {
        var randomObj= {};
        randomObj.userID = req.userID;
        User.advancedSearch(randomObj, function(error, userDocs) {
            if (error) {
                return res.status(400).send(error);
            }
            console.log(userDocs[0]);
            req.body.authorID = userDocs[0].uuid;
            console.log(req.body);
            Publish.create(req.body, function(err, result) {
                if (err) {
                    return res.status(400).send(error);
                }
                console.log(result);
            });
        });
    });

    app.get("/api/postSearch", Session.auth, function (req, res, next) {
        if (req.query.myProfile) {
            req.query.authorID = req.userID;
        }
        Publish.search(req.query, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            async.each(result, function (person, callback) {
                var someObj = {userID: person.authorID};
                User.advancedSearch(someObj, function (error, result) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        console.log('PERSON INIT : ' + person);
                        console.log(result);
                        if (!result[0]) {
                            console.log('user deleted, post ignored');
                            callback();
                        }
                        else {
                            console.log('result : ' + JSON.stringify(result[0]));
                            person.author = result[0][primaryAttribute];
                            console.log(person);
                            callback();
                        }
                    }
                });
            }, function(err) {
                if (err) {
                    console.log(error);
                }
                else {
                    console.log('final result: ' + JSON.stringify(result));
                    res.json(result);
                }
            });
            //console.log(result);
            //res.json(result);
        });
    });

    app.delete("/api/deletePost", Session.auth, function (req, res, next) {
        Publish.remove(req.query, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            console.log(result);
            res.json(result);
        });
    });

    app.post("/api/uploadAttempt", Session.auth, function (req, res, next) {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req.files));
        /*Session.findUser(req.body.sessionID, function (error, userID) {
            if (error) {
                return res.status(400).send(error);
            }*/
        console.log(req.userID);
        Picture.attempt (req.userID, req.body, req.files.userPhoto, function (error, result) {
            if (error) {
                return res.status(400).send(error);
            }
            console.log(result);
            res.redirect('../nav.html');
        });
    });

    app.post("/api/registerUser", function(req, res, next) {
        console.log(req.body);
        if(!req.body.login.email) {
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
        }
        var endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }
        if (!endsWith(req.body.login.email, 'couchbase.com')) {
            return next(JSON.stringify({"status": "error", "message": "Email must end with \"couchbase.com\""}));   
        }
        if(!req.body[primaryAttribute]) {
            return next(JSON.stringify({"status": "error", "message": "A " + primaryAttribute + " must be provided"}));
        }
        if(!req.body.login.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        if(!req.body.login.confPassword) {
            return next(JSON.stringify({"status": "error", "message": "A password confirmation must be provided"}));
        }
        var passCheck = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!passCheck.test(req.body.login.password)) {
            return next(JSON.stringify({"status": "error", "message": "Password must contain 1 lower case character, 1 upper case character, 1 number and at least 6 total characters"}));
        }
        if (req.body.login.password !== req.body.login.confPassword) {
            return next(JSON.stringify({"status": "error", "message": "Password did not match confirmation password"}));
        }
        // replace with advancedSearch
        User.advancedSearch(req.body.login, function (error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            if (user.length === 1) {
                return res.send({"status": "error", "message": "This email is already in use. Login, or create an account with a different email address."});
            }
            User.create(req.body, function (error, result) {
                if (error) {
                    return res.status(400).send(error);
                }
                var pathInfo = {};
                pathInfo.protocol = req.protocol;
                pathInfo.host = req.headers.host;
                Session.makeVerification(pathInfo, result.userDoc, function (err, resp) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    res.json(resp);
                });
            });
        });
    });

    app.post("/api/updateUser", Session.auth, function (req, res, next) {
        console.log(req.body);
        if(!req.body[primaryAttribute]) {
            return next(JSON.stringify({"status": "error", "message": "A name must be provided"}));
        }
        if(!req.body.login.email) {
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
        }
        var endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };
        if (!endsWith(req.body.login.email, 'couchbase.com')) {
            return next(JSON.stringify({"status": "error", "message": "Email must end with \"couchbase.com\""}));   
        }
        if(!req.body.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        User.newUpdate(req.body, function(error, result) {
            if(error) {
                return res.status(400).send(error);
            }
            console.log('update worked!');
            res.json(result);
        });
    });

    app.get("/api/emailSearch", function (req, res, next) {
        console.log("in emailSearch Node");
        if (!req.query.email) {
            console.log("no req.query.email recognized");
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
        }
        console.log("req.query.email recognized");
        User.searchByEmail(req.query, function (error, userDocs) {
            if(error) {
                return res.status(400).send(error);
            }
            res.json(userDocs);
        });
    });

    app.get("/api/intelligentCount", Session.auth, function (req, res, next) {
        console.log("in intelligentSearch");

        /*if (!req.query.searchTerm) {
            console.log("no req.query.searchTerm recognized");
            return next(JSON.stringify({"status": "error", "message": "A search term must be provided"}));
        }*/
        User.intelligentCount(req.query, function (error, counts) {
            if(error) {
                return res.status(400).send(error);
            }
            /*if(counts.length === 0) {
                return (JSON.stringify({"status": "error", "message": "Sorry, there are no results for your search."}));
            }*/
            console.log(counts);
            res.json(counts);
        });
    });

    app.get("/api/advancedSearch", Session.auth, function (req, res, next) {
        console.log("in advancedSearch");
        if (!req.query) {
            console.log("no search term recognized");
            return next(JSON.stringify({"status": "error", "message": "A search term must be provided"}));
        }
        if (req.query.myProfile) {
            req.query.userID = req.userID;
        }
        User.advancedSearch(req.query, function (error, result) {
            if(error) {
                return res.status(400).send(error);
            }
            /*if(result.length === 0) {
                return (JSON.stringify({"status": "error", "message": "Sorry, there are no results for your search."}));
            }*/
            async.each(result, function(person, callback) {
                Picture.receive(person, function (err, resp) {
                    if (error) {
                        callback(error);
                    }
                    else  {
                        person.picSRC = resp.value;
                        callback();
                    }
                });
            }, function(err) {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err);
                }
                res.json(result);
            });
        });
    });

    app.get('/', function(req, res) {
            console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('index.html');
    });

};

module.exports = appRouter;


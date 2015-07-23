var User        = require("../models/usermodel");
var Picture     = require("../models/picturemodel");
var Publish     = require("../models/publishmodel");
var Session     = require("../models/sessionmodel");
var uuid        = require("uuid");
var multer      = require('multer');

var appRouter = function(app) {

    app.get("/api/createPrimaryIndexes", function(req, res) {
        User.createPrimaryIndexes(function(error, result) {
            if(error) {
                return res.status(400).send(error);
            }
            res.json(result);
        });
    });
    
    app.get("/api/loginAuth", function(req, res, next) {
        if(!req.query.email) {
            return next(JSON.stringify({"status": "error", "message": "A username must be provided"}));
        }
        if(!req.query.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        User.advancedSearch(req.query, function(error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            console.log('user: ' +  JSON.stringify(user));
            var x = [];
            x = user;
            if (x.length === 0) {
                return res.status(400).send('The username entered does not exist');   
            }
            if(!User.validatePassword(req.query.password, user[0].users.login.password)) {
                return res.status(400).send("The password entered is invalid");
            }
            User.addLoginTime(user[0].users.uuid, function(error, result) {
                if(error) {
                    return res.status(400).send(error);
                }
                Session.create(user[0].users.uuid, function(error, result) {
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
            console.log(userDocs.data[0]);
            req.body.author = userDocs.data[0].users.name;
            req.body.authorID = userDocs.data[0].users.uuid;
            console.log(req.body);
            Publish.create(req.body, function(err, result) {
                if (err) {
                    return res.status(400).send(error);
                }
                console.log(result);
            });
        });
    });

    app.post("/api/uploadAttempt", function(req, res) {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req.files));
        Session.findUser(req.body.sessionID, function (error, userID) {
            if (error) {
                return res.status(400).send(error);
            }
            Picture.attempt (userID, req.body, req.files.userPhoto, function(error, result) {
                if (error) {
                    return res.status(400).send(error);
                }
                console.log(result);
            });
        });
    });

    app.post("/api/registerUser", function(req, res, next) {
        console.log(req.body);
        if(!req.body.email) {
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
        }
        var endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }
        if (!endsWith(req.body.email, 'couchbase.com')) {
            return next(JSON.stringify({"status": "error", "message": "Email must end with \"couchbase.com\""}));   
        }
        if(!req.body.name) {
            return next(JSON.stringify({"status": "error", "message": "A name must be provided"}));
        }
        if(!req.body.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        if(!req.body.confPassword) {
            return next(JSON.stringify({"status": "error", "message": "A password confirmation must be provided"}));
        }
        var passCheck = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!passCheck.test(req.body.password)) {
            return next(JSON.stringify({"status": "error", "message": "Password must contain 1 lower case character, 1 upper case character, 1 number and at least 6 total characters"}));
        }
        if (req.body.password !== req.body.confPassword) {
            return next(JSON.stringify({"status": "error", "message": "Password did not match confirmation password"}));
        }
        // replace with advancedSearch
        User.searchByEmail(req.body, function(error, user) {
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
                Session.create(result.userID, function(err, resp) {
                    if (error) {
                        return res.status(400).send(err);
                    }
                    res.json(resp);
                });
            });
        });
    });

    app.get("/api/nameSearch", Session.auth, function (req, res, next) {
        console.log("in nameSearch Node");
        if (!req.query.name) {
            console.log("no req.query.name recognized");
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
        }
        console.log("req.query.name recognized");
        User.advancedSearch(req.query, function (error, userDocs) {
            if(error) {
                return res.status(400).send(error);
            }
            var userString = "";
            if (userDocs.data.length > 0) {
                for (i=0; i<userDocs.data.length; i++) {
                    userString+=(JSON.stringify(userDocs.data[i].users) + " ");
                }
                console.log("userString " + userString);
            }
            else {
                userString = "Sorry, there are no results for your search.";
            }
            res.json(userString);
        });
    });

    app.get("/api/intelligentCount", Session.auth, function (req, res, next) {
        console.log("in intelligentSearch");
        if (!req.query.searchTerm) {
            console.log("no req.query.searchTerm recognized");
            return next(JSON.stringify({"status": "error", "message": "A search term must be provided"}));
        }
        User.intelligentCount(req.query, function (error, counts) {
            if(error) {
                return res.status(400).send(error);
            }
            if(counts.length === 0) {
                return (JSON.stringify({"status": "error", "message": "Sorry, there are no results for your search."}));
            }
            res.json(counts);
        });
    });

    app.get("/api/advancedSearch", Session.auth, function (req, res, next) {
        console.log("in advancedSearch");
        if (!req.query) {
            console.log("no search term recognized");
            return next(JSON.stringify({"status": "error", "message": "A search term must be provided"}));
        }
        User.advancedSearch(req.query, function (error, result) {
            if(error) {
                return res.status(400).send(error);
            }
            if(result.length === 0) {
                return (JSON.stringify({"status": "error", "message": "Sorry, there are no results for your search."}));
            }
            var picFinish = false;
            for(y=0; y<result.length; y++) {
                (function(y) {
                    Picture.receive(result[y].users, function (err, resp) {
                        if (error) {
                            console.log(err);
                            return res.status(400).send(err);
                        }
                        else {
                            console.log('RESULT : ' + result[y]);
                            // console.log('RESULT0 : ' + result[0]);
                            console.log(y);
                            result[y].users.picSRC = resp.value;
                            console.log(typeof resp.value);
                            console.log('resp.value: ' + resp.value);
                            if (y === (result.length-1)) {
                                var picFinish = true;
                            }
                            if (picFinish) {
                                res.json(result);
                            }
                        }
                    });
                })(y);
            }
        });
    });

    app.get('/', function(req, res) {
            console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('index.html');
    });

};

module.exports = appRouter;


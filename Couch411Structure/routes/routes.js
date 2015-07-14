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
            console.log(user);
            if(!User.validatePassword(req.query.password, user.data[0].users.login.password)) {
                return res.send({"status": "error", "message": "The password entered is invalid"});
            }
            User.addLoginTime(user.data[0].users.uuid, function(error, result) {
                if(error) {
                    return res.status(400).send(error);
                }
                Session.create(user.data[0].users.uuid, function(error, result) {
                    if(error) {
                    return res.status(400).send(error);
                    }
                    res.send({sessionID: result});
                });
            });
        });
    });

    app.post("/api/uploadAttempt", function(req, res) {
        console.log(JSON.stringify(req.body));
        console.log(JSON.stringify(req.files));
        Picture.attempt (req.body.cookieID, req.files.userPhoto, function(error, result) {
            if (error) {
                return res.status(400).send(error);
            }
        console.log(result);
        });
    });

    app.post("/api/registerUser", function(req, res, next) {
        var newID = uuid.v4();
        console.log(req.body);
        if(!req.body.email) {
            return next(JSON.stringify({"status": "error", "message": "An email must be provided"}));
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
        User.searchByEmail(req.body, function(error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            if (user.length === 1) {
                return res.send({"status": "error", "message": "This email is already in use. Login, or create an account with a different email address."});
            }
            Picture.upload (newID, req.body, function (error, picResult) {
                if (error) {
                    return res.status(400).send(error);
                }
                User.create(newID, req.body, function (error, result) {
                    if (error) {
                    return res.status(400).send(error);
                    }
                    res.json(result);
                });
            });
        });
    });

    app.get("/api/nameSearch", /*Session.auth,*/ function (req, res, next) {
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

    app.get('/', function(req, res) {
            console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('index.html');
    });

};

module.exports = appRouter;


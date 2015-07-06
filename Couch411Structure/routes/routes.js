var User        = require("../models/usermodel");
var Picture     = require("../models/picturemodel");

var appRouter = function(app) {
    
    app.get('*', function(req, res) {
            console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('index.html');
    });
    
    app.get("/api/loginAuth", function(req, res, next) {
        if(!req.query.email) {
            return next(JSON.stringify({"status": "error", "message": "A username must be provided"}));
        }
        if(!req.query.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        User.searchByEmail(req.query, function(error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            if(!User.validatePassword(req.query.password, user[0].password)) {
                return res.send({"status": "error", "message": "The password entered is invalid"});
            }
            User.addLoginTime(user[0].uuid, function(error, result) {
                if(error) {
                    return res.status(400).send(error);
                }
                res.setHeader("Authorization", "Bearer " + result);
                res.send(user);
            });
        });
    });

    app.post("/api/registerUser", function(req, res, next) {
        if(!req.query.email) {
            return next(JSON.stringify({"status": "error", "message": "A username must be provided"}));
        }
        if(!req.query.name) {
            return next(JSON.stringify({"status": "error", "message": "A name must be provided"}));
        }
        if(!req.query.password) {
            return next(JSON.stringify({"status": "error", "message": "A password must be provided"}));
        }
        if(!req.query.password) {
            return next(JSON.stringify({"status": "error", "message": "A password confirmation must be provided"}));
        }
        var passCheck = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!passCheck.test(req.query.password)) {
            return next(JSON.stringify({"status": "error", "message": "Password must contain 1 lower case character, 1 upper case character, 1 number and at least 6 total characters"}));
        }
        if (req.query.password !== req.query.confPassword) {
            return next(JSON.stringify({"status": "error", "message": "Password did not match confirmation password"}));
        }
        User.searchByEmail(req.query, function(error, user) {
            if(error) {
                return res.status(400).send(error);
            }
            if (user.length === 1) {
                return res.send({"status": "error", "message": "This email is already in use. Login, or create an account with a different email address."});
            }
            User.create(req.query, function (error, result) {
                if (error) {
                    return res.status(400).send(error);
                }
                res.json(result);
            });
        });
    });

};

module.exports = appRouter;


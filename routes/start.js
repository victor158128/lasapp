var express = require('express');
var router = express.Router();
var lin = '<li role="presentation"><a id="login" href="/users/login">Login</a></li>';
var lout = '<li role="presentation"><a id="logout" href="/users/Logout">Logout</a></li>';
/* GET home page. */

router.get('/', function (req, res) {
  res.clearCookie('userid');
  res.clearCookie('username');

  var cookie = req.cookies.userid;

    if (req.user || typeof cookie !== 'undefined' ) {
        res.render('login', { logout:lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>' , layout: 'layout2'});
    }

    else {
        res.render('login', { login: lin , layout: 'layout2' });
    }

    });


    router.get('/Description', function (req, res) {

        var cookie = req.cookies.userid;

        if (req.user || typeof cookie !== 'undefined' ) {
            res.render('description', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>'});

        }
        else {
            res.render('description', { login: lin });
        }

        });



        router.get('/Contact', function (req, res) {
            var cookie = req.cookies.userid;

            if (req.user || typeof cookie !== 'undefined' ) {
                res.render('contact', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>' });

            }
            else {
                res.render('contact', { login: lin });
            }

            });


module.exports = router;

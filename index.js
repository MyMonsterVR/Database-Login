const con = require('./lib/connection.js'),
  express = require('express'),
  isReachable = require('is-reachable'),
  sess = require('express-session'),
  bodyParser = require('body-parser'),
  cookieParser = require("cookie-parser"),
  encoder = bodyParser.urlencoded({ extended: true }),
  path = require('path'),
  redis = require('redis'),
  redisStore = require('connect-redis')(sess),
  client = redis.createClient();


const {
  body,
  validationResult
} = require('express-validator')

//Hosting Port
const PORT = 3000

// Network Display bool
var status = "net1"
var net1 = false
var net2 = false
// login security
var verificationStep = false
var verificationFailed = false

// NIX PILLE
loadSite()
setInterval(loadSite, 600000) // 600000ms, website live reloads every 10 minutes

const app = express()
var personList = []

app.use(sess({
  secret: 'WeNeedARaise',
  store: new redisStore({
    host: 'localhost',
    port: 6379,
    client: client,
    ttl: 260
  }),
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 100000
  }
}))

// Database connection
var db = con.getConnection()

async function loadSite() {
    var titleText = con.getNewsTitle()
    var bodyText = con.getNewsBody()
    // Network Check
    net1 = await isReachable('217.116.222.48') // LAV FLERE HVIS I FÅR FLERE IP'ER
    // view engine + public folder
    app.set("views", "frontend")
    app.set('view engine', 'pug')
    app.use('/Admin', express.static('/Admin'));
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/Admin', express.static('Admin'));
    app.use('/images', express.static('images'));
    // net2 = await isReachable('217.116.222.48') // an extra connection

    // Index site
    app.get('/', function(req, res) {
      res.render('index.pug', {
        // sends net1 bool into the variable netstatus on index.pug
        netstatus: net1,
        getNewsTitle: titleText,
        getNewsBody: bodyText
      })
    })

    //Login site
    app.get("/login.pug", function(req, res) {
      res.render('login.pug', {
        verifyFail: req.session.verificationFailed // Transfer check over to pug file
      })
    })

    // Login system authentication
    app.post("/authenticate", encoder, function(req, res) {
      var Id = req.body.id
      var password = req.body.password
      db.query('SELECT * FROM users', (err, rows) => {
        db.query("select * from users where Id = ? and password = ?", [Id, password], function(error, results, fields) {
          if (err) throw err;
          if (results.length > 0 && rows[Id].status == "superuser") {
            req.session.key = Id;
            res.redirect("Admin/dashboard.pug")
          } else {
            req.session.verificationFailed = true // Check to make sure fail message is shown
            res.redirect("/login.pug")
          }
        })
      });

    })

    // admin panel
    app.get('/Admin/dashboard.pug', function(req, res) {
      let session = req.session
      if (session.key) {
        res.render('Admin/dashboard.pug'), {
          userID: session.key
        }
      } else {
        req.session.verificationFailed = true // Check to make sure fail message is shown
        res.redirect("/login.pug")
      }
    })

    app.get('/Admin/database.pug', function(req, res) {
      let session = req.session
      if (session.key) {
        res.render('Admin/database.pug'), {
          userID: session.key
        }
      } else {
        req.session.verificationFailed = true // Check to make sure fail message is shown
        res.redirect("/login.pug")
      }
    })

    // admin panel
    app.get('/Admin/messagemanager.pug', function(req, res) {
      let session = req.session
      if (session.key) {
        res.render('Admin/messagemanager.pug'), {

        }
      } else {
        req.session.verificationFailed = true // Check to make sure fail message is shown
        res.redirect("/login.pug")
      }
    })

    app.post('/postnews', function(req, res) {
      var title = req.body.title
      var body = req.body.msg
      con.addNews(title.toString(), body.toString(), null, null)
      res.redirect("Admin/dashboard.pug")
    })

    app.get('/Admin/users.pug', function(req, res) {
      let session = req.session
      if (session.key) {
        res.render('Admin/users.pug'), {
          userID: session.key
        }
      } else {
        req.session.verificationFailed = true // Check to make sure fail message is shown
        res.redirect("/login.pug")
      }
    })

    app.post("/logout", function(req, res) {
      console.log("logged out")
      req.session.destroy(function(err) {
        res.redirect('/'); //Inside a callback… bulletproof!
      });
    })

    app.post("/createUser", function(req, res) {
      fname = req.body.fornavn
      mname = req.body.mellemnavn
      sname = req.body.efternavn
      rname = req.body.role

      if (mname == "")
        mname = null
      if (rname != "user" || rname != "superuser")
        rname = "user"

      con.addUser(fname, mname, sname, rname, null)

      res.redirect("Admin/users.pug?added=true")
    })
}
app.listen(PORT)

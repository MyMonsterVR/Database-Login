const con = require('./lib/connection.js'),
	express = require('express'),
	isReachable = require('is-reachable'),
	sess = require('express-session'),
	bodyParser = require('body-parser'),
	cookieParser = require("cookie-parser"),
	encoder = bodyParser.urlencoded(),
	path = require('path'),
	redis = require('redis'),
	redisStore = require('connect-redis')(sess),
	client = redis.createClient();


const {
	body,
	validationResult
} = require('express-validator')

//Hosting Port
const PORT = 80

// Network Display bool
var status = "net1"
var net1 = false
var net2 = false
// login security
var verificationStep = false
var verificationFailed = false

// NIX PILLE
loadSite()
setInterval(loadSite, 10000) // 10000ms, website live reloads every 10 minutes

const app = express()
var personList = []

app.use(sess({
	secret: 'Weneedaraise',
	store: new redisStore({
		host: 'localhost',
		port: 6379,
		client: client,
		ttl: 260
	}),
	resave: false,
	saveUninitialized: false,
}))

function loadSite() {
	(async () => {
		// Network Check
		net1 = await isReachable('217.116.222.48') // LAV FLERE HVIS I FÅR FLERE IP'ER

		// Database connection
		var db = con.getConnection()

		// view engine + public folder
		app.set("views", "frontend")
		app.set('view engine', 'pug')
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use('/images', express.static('images'));
		// net2 = await isReachable('217.116.222.48') // HUSK AT RET I INDEX.PUG
		// Index site
		app.get('/', function(req, res) {
			res.render('index.pug', {
				// sends net1 bool into the variable netstatus on index.pug
				netstatus: net1
			})
		})


		app.get("/login.pug", function(req, res) {
			res.render('login.pug', {
				verifyFail: verificationFailed
			})
		})

		// Login system
		app.post("/authenticate", encoder, function(req, res) {
			var Id = req.body.id
			var password = req.body.password
			db.query('SELECT * FROM users', (err, rows) => {
				if (err) throw err;

				db.query("select * from users where Id = ? and password = ?", [Id, password], function(error, results, fields) {
					if (results.length > 0 && rows[Id - 2].status == "superuser") {
						req.session.key = Id;
						console.log(req.session.key)
						res.redirect("/users.pug")
						//verificationStep = true
						//res.app.set('verification', true)
					} else {
						//verificationFailed = true
						res.redirect("/login.pug")
					}
					res.end()
				})
			});

		})
		// admin panel
		app.get('/users.pug', function(req, res) {
			let session = req.session
			console.log(req.session.key)
			console.log("user info: " + JSON.stringify(req.session))
			if (session.key) {
				console.log("DSAUIHD")
				res.render('users.pug', {
					loggedIn: res.app.get('verification'),
					userID: "68"
				})
			} else {
				console.log("error")
				res.redirect("/login.pug")
			}
			//verificationStep = false
		})
	})()
}

app.listen(PORT)
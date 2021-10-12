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
	cookie: {
		maxAge: 20000
	}
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
		// net2 = await isReachable('217.116.222.48') // an extra connection

		// Index site
		app.get('/', function(req, res) {
			res.render('index.pug', {
				// sends net1 bool into the variable netstatus on index.pug
				netstatus: net1
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
						console.log(req.session.key)
						res.redirect("/admin.pug")
					} else {
						req.session.verificationFailed = true // Check to make sure fail message is shown
						res.redirect("/login.pug")
					}
				})
			});

		})

		// admin panel
		app.get('/admin.pug', function(req, res) {
			let session = req.session
			if (session.key) {
				res.render('admin.pug', {
					userID: session.key
				})
			} else {
				req.session.verificationFailed = true // Check to make sure fail message is shown
				res.redirect("/login.pug")
			}
		})

		db.query('SELECT * from users', function(err, rows, fields) {
			for (var i = 0; i < rows.length; i++) {

				// Create an object to save current row's data
				var person = {
					'fornavn': rows[i].Fornavn,
					'mellemnavn': rows[i].mellemnavn,
					'efternavn': rows[i].Efternavn,
					'id': rows[i].Id
				}
				// Add object into array
				personList.push(person);
			}
		})

		function getPerson() {
			db.query('SELECT * from users', function(err, rows, fields) {
				if (err) res.status(500).json({
					"status_code": 500,
					"status_message": "Internal server error"
				})
				else {
					for (var i = 0; i < rows.length; i++) {

						personList[i].id
					}
				}
			})
		}

		getPerson()


		app.get('/users.pug', function(req, res) {
			res.render('users.pug', {
				users: personList
			})
		})

		app.post("/logout", encoder, function(req, res) {
			console.log("logged out")
			req.session.destroy(function(err) {
				res.redirect('/'); //Inside a callback… bulletproof!
			});
		})


	})()

}

app.listen(PORT)
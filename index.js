const con = require('./lib/connection.js'),
	express = require('express'),
	isReachable = require('is-reachable'),
	sess = require('express-session'),
	bodyParser = require('body-parser'),
	encoder = bodyParser.urlencoded()
Store = require('express-session').Store

var BetterMemoryStore = require('session-memory-store')(sess)

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

function loadSite() {
	(async () => {
		// Network Check
		net1 = await isReachable('217.116.222.48') // LAV FLERE HVIS I FÅR FLERE IP'ER

		// Database connection
		var db = con.getConnection()

		// view engine + public folder
		app.set("views", "frontend")
		app.set('view engine', 'pug')

		//net2 = await isReachable('217.116.222.48') // HUSK AT RET I INDEX.PUG
		// Index site
		app.get('/', function(req, res) {

			res.render('index.pug', {
				// sends net1 bool into the variable netstatus on index.pug
				netstatus: net1,
				verifyFail: verificationFailed
			})
		})

		// admin panel
		app.get('/users.pug', function(req, res) {
			//Users ID starts at 2
			res.render('users.pug', {
				loggedIn: verificationStep,
				userID: req.app.get('userId')
			})
			verificationStep = false
		})

		// Login system
		app.post("/", encoder, function(req, res) {
			var Id = req.body.id
			var password = req.body.password
			db.query('SELECT * FROM users', (err, rows) => {
				if (err) throw err;

				db.query("select * from users where Id = ? and password = ?", [Id, password], function(error, results, fields) {
					if (results.length > 0 && rows[Id - 3].status == "superuser") {
						verificationStep = true
						req.app.set('userId', Id)
						res.redirect("/users.pug")
					} else {
						verificationFailed = true
						res.redirect("/")
					}
					res.end()
				})
			});
		})
	})()
}
app.listen(PORT)
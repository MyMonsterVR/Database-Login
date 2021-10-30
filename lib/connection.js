const mysql = require('mysql')
var fname = ""
var mellemUser = ""
var lname = ""
var allDetails = ""
var store = []
var allIds = [];
var userInfoID = []
var userInfo = ""

function getConnection() {
	return mysql.createConnection({
		host: 'localhost',
		user: 'admin',
		password: 'admin',
		database: 'infoscreendb'
	});
}

// Get connection to the database

const con = getConnection()

con.connect((err) => {
	if (err) {
		console.log('Error connecting to DB');
		console.log(err)
		return;
	}
});

// Get all users in the system
function getAllUsers() {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) throw err;

		userInfo = rows
		return userInfo
	});
}

// Get all details about a person from their ID
function getUser(i) {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) throw err;
		if (rows[i].mellemnavn == null)
			allDetails = "ID: " + i + ", Navn: " + rows[i].Fornavn + " " + rows[i].Efternavn + ", Role: " + rows[i].status + ", Birthday:" + rows[i].birthday
		else if (rows[i].mellemnavn != null)
			allDetails = "ID: " + i + ", Navn: " + rows[i].Fornavn + " " + rows[i].mellemnavn + " " + rows[i].Efternavn + ", Role: " + rows[i].status + ", Birthday:" + rows[i].birthday
	});
	return allDetails
}

// Get users first name from their ID
function getUserFirst(i) {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) console.log(err)

		fname = rows[i].Fornavn
	})
	return fname
}

// Get users middle name from their ID
function getUserMellem(i) {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) throw err;
		mellemUser = rows[i].mellemnavn;
	});
	return mellemUser
}

// Get users surname from their ID
function getUserLast(i) {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) throw err;
		lname = rows[i].Efternavn;
	});
	return lname
}



function removeDuplicates(data) {
	return [...new Set(data)]
}

function getUserID(i) {
	con.query('SELECT Id FROM users WHERE Fornavn ="' + i + '"', (err, rows) => {
		if (err) throw err;

		con.query('SELECT * FROM users', (err, student) => {
			if (err) throw err;
			for (var d = 0; d < student.length; d++) {
				var data = ""
				rows.forEach(function(getDataID) {
					if (student.Fornavn = i) {
						data = JSON.stringify(getDataID).replace(`{"Id":`, "").replace("}", "")
						if (student[d].Fornavn == i)
							store.push("ID: " + parseInt(data) + ", Navn: " + i + " " + student[parseInt(data)].Efternavn + ", Role: " + student[parseInt(data)].status)
					}
				})
			}
			if (store.length == 0) return console.log("ERROR: Fornavn ikke fundet i databasen")
			return userInfoID.push(removeDuplicates(store))

		})
	});

}

// Få alle IDs
function getAllUserIDs() {
	con.query('SELECT * FROM users', (err, rows) => {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			allIds[i] = rows[i].Id
		}
	});
	return allIds
}


// Tilføj bruger til databasen
function addUser(finame, mlmnavn, sname, stat, pswd) {

	if (mlmnavn != null) {
		if (pswd == null)
			var sql = `INSERT INTO users(Fornavn, mellemnavn, Efternavn, status, password) VALUES ('${finame}', '${mlmnavn}', '${sname}', '${stat}', ${pswd})`;
		if (pswd != null)
			var sql = `INSERT INTO users(Fornavn, mellemnavn, Efternavn, status, password) VALUES ('${finame}', '${mlmnavn}', '${sname}', '${stat}', '${pswd}')`;
	}
	if (mlmnavn == null) {
		if (pswd == null)
			var sql = `INSERT INTO users(Fornavn, mellemnavn, Efternavn, status, password) VALUES ('${finame}', ${mlmnavn}, '${sname}', '${stat}', ${pswd})`;
		if (pswd != null)
			var sql = `INSERT INTO users(Fornavn, mellemnavn, Efternavn, status, password) VALUES ('${finame}', ${mlmnavn}, '${sname}', '${stat}', '${pswd}')`;
	}
	con.query(sql, function(err, result) {
		if (err) throw err;
		console.log("1 user added");
	});
}

function addNews(title, body, startdato, slutdato) {
	var sql = `INSERT INTO news(Header, Body, Startdate, Enddate) VALUES ('${title}', '${body}', ${startdato}, ${slutdato})`;
	con.query(sql, function(err, result) {
		if (err) throw err;
		console.log("1 news information added");
	});
}

function getNewsTitle(){
	var news = []
	con.query("SELECT * FROM news", (err, rows) => {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			news.push(rows[i].Header + ":-:")
		}
	})
	console.log(news)
	return news
}

function getNewsBody(){
	var news = []
	con.query("SELECT * FROM news", (err, rows) => {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			news.push(rows[i].Body + ":-:")
		}
	})
	console.log(news)
	return news
}

module.exports = {
	getUser,
	getUserFirst,
	getUserMellem,
	getUserLast,
	getAllUsers,
	getUserID,
	getAllUserIDs,
	getConnection,
	addUser,
	addNews,
	getNewsTitle,
	getNewsBody
}

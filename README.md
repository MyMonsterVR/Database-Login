# Database-Login
Made in NodeJS &amp; ExpressJS

# Requirements
```js
NodeJS 14.18.0+
A way to show the database
Redis-Server

```
To use this project, you need to open your `Terminal` and write `npm i` then it can download all dependencies needed to use it

# Functions
**Database funktioner**
```JS
getAllUserIDs() // Get a list of all ids in the system
getUserID("name") // Get a users id from their first name
getUserFirst(id) // Get a person first name from their id
getUserMellem(id) // Get persons middle name from their id
getUserLast(id) // Get a users surname from their id
getUser(id) // To get all details about a user
addUser(firstname, middlename, surname, role, pswd, birth) // Add a user to the database
```
# Database
You need to make a database, a table called users and edit the code to use the table names. (there are already premade once, just remove those and replace it with whatever info you need)

Disclaimer:
Only things included is the things that I have made in the project

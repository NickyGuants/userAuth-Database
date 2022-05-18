const mysql = require('mysql');
const config = require('./config');

//establish connection to the db and pass in the configuration details
exports.connection = mysql.createConnection(config);

exports.connectDb = (db) =>
{
    db.connect((err) => {
    if (err) {
        return console.log(err.message);
    }
});
}

exports.closeConnection = (db) =>
{
    db.destroy( () =>
    {
        return console.log("connection closed")
    })
}
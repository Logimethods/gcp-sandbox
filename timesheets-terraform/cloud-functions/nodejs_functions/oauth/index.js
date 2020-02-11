'use strict';

const fs = require('fs');
const mysql = require('promise-mysql');
const {google} = require('googleapis');

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

// [START cloud_sql_mysql_mysql_create]
let pool;
const createPool = async () => {
  pool = await mysql.createPool({
      user: 'dbuser',
      password: 'dbuser',
      database: 'timesheets',
    // user: process.env.DB_USER, // e.g. 'my-db-user'
    // password: process.env.DB_PASS, // e.g. 'my-db-password'
    // database: process.env.DB_NAME, // e.g. 'my-database'

    // If connecting via unix domain socket, specify the path
    //socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    socketPath: `/cloudsql/gcp-sandbox-266014:us-east4:mysql-s-sandbox-us-east4-master`,

    // If connecting via TCP, enter the IP and port instead
    // host: 'localhost',
    // port: 3306,

    //[START_EXCLUDE]

    // [START cloud_sql_mysql_mysql_limit]
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 5,
    // [END cloud_sql_mysql_mysql_limit]

    // [START cloud_sql_mysql_mysql_timeout]
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
    // [END cloud_sql_mysql_mysql_timeout]

    // [START cloud_sql_mysql_mysql_backoff]
    // The mysql module automatically uses exponential delays between failed
    // connection attempts.
    // [END cloud_sql_mysql_mysql_backoff]

    //[END_EXCLUDE]
  });
//   fun();
};
createPool();

// [END cloud_sql_mysql_mysql_create]

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.updateAcessToken = async (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(res, JSON.parse(content));
    });
};

function authorize(res,credentials){
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    var stmt = 'SELECT token FROM token;';
    pool.query(stmt, function (err, result) {
        if (err) throw err;
        const proto_this_token = JSON.parse(JSON.parse(JSON.stringify(result))[0].token);
        const this_token = JSON.parse(JSON.stringify(proto_this_token.token));
        var oAuth2Client = new google.auth.OAuth2(
            proto_this_token.client_id, proto_this_token.client_secret, proto_this_token.redirectUri);
        oAuth2Client.setCredentials(this_token);
        refreshAccessToken(oAuth2Client, this_token.refresh_token, () => {
                pool.query('TRUNCATE TABLE token', function(err1, result1){
                    if (err1) throw err1;
                    var stmt = 'INSERT INTO token (token) VALUES (?)'; 
                    var stmr_para = '{ "token":' + JSON.stringify(oAuth2Client.credentials) + ', "client_id": "' 
                        + oAuth2Client._clientId + '",  "client_secret": "' + oAuth2Client._clientSecret + '",  "redirectUri": "' 
                        + oAuth2Client.redirectUri + '"}';
                    pool.query(stmt, [stmr_para], function (err2, result2) {
                        if (err2) throw err2;
                        res.status(200).send(stmr_para);
                    });
                });     
        });
    });
}
async function refreshAccessToken (oAuth2Client, refresh_string, callback) {
    oAuth2Client = await oAuth2Client.refreshToken(refresh_string);
    callback();
}
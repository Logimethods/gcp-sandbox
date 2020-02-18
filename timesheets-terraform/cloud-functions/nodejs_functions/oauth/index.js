'use strict';

const fs = require('fs');
const mysql = require('promise-mysql');
const {google} = require('googleapis');
const promise = require('promise');


function createPool() {
    var pool;
    var options = {
        user: 'dbuser',
        password: 'dbuser',
        database: 'timesheets',
        socketPath: `/cloudsql/gcp-sandbox-266014:us-east4:mysql-s-sandbox-us-east4-master`,
		// host:	'35.245.9.72',
		// port:	'3306',
        connectionLimit: 5,
        connectTimeout: 10000, // 10 seconds
        acquireTimeout: 10000, // 10 seconds
        waitForConnections: true, // Default: true
        queueLimit: 0, // Default: 0
    };
    return new Promise((resolve, reject) => {
        try{
            pool = mysql.createPool(options);
            resolve(pool);
        } catch (err){
            console.log(err)
            reject(err);
        }
    });
}

function createAuth(client_id, client_secret, redirectUri, token){
	return new Promise((resolve, reject) => {
		try{
            var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
			oAuth2Client.setCredentials(token);
            resolve(oAuth2Client);
        } catch (err){
            console.log(err)
            reject(err);
        }
	});
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.updateAcessToken = async (req, res) => {
//  trypool();
//  function trypool(){
    var initCreatePoolPromise = createPool();
    initCreatePoolPromise.then((pool) => {
        var stmt = 'SELECT token FROM token;';
        pool.query(stmt, function (err, result) {
            if (err) throw err;
            console.log(result);
			const proto_this_token = JSON.parse(JSON.parse(JSON.stringify(result))[0].token);
			const this_token = JSON.parse(JSON.stringify(proto_this_token.token));
			var createAuthPromise = createAuth(proto_this_token.client_id, proto_this_token.client_secret, proto_this_token.redirectUri, this_token);
			createAuthPromise.then(((oAuth2Client) => {
				console.log(oAuth2Client.credentials);
				oAuth2Client.getAccessToken().then((value) => {
					if(value.res != null){
						//console.log(value.res.data);
						pool.query('TRUNCATE TABLE token', function(err1, result1){
							if (err1) throw err1;
							var stmt = 'INSERT INTO token (token) VALUES (?)';
							console.log('value: ' + JSON.stringify(value));						
							var stmr_para = '{ "token":' + JSON.stringify(value.res.data) + ', "client_id": "' 
								+ oAuth2Client._clientId + '",  "client_secret": "' + oAuth2Client._clientSecret + '",  "redirectUri": "' 
								+ oAuth2Client.redirectUri + '"}';
							pool.query(stmt, [stmr_para], function (err2, result2) {
								if (err2) throw err2;
								res.status(200).send(stmr_para);
							});
						});  
					}else {
						res.status(200).send('{ "token":' + JSON.stringify(this_token) + ', "client_id": "' 
								+ oAuth2Client._clientId + '",  "client_secret": "' + oAuth2Client._clientSecret + '",  "redirectUri": "' 
								+ oAuth2Client.redirectUri + '"}');
                    }			
				});
			}));
        });
    })
}
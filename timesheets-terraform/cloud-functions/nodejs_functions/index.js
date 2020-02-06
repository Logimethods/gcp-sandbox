const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/spreadsheets'];

const TOKEN_PATH = 'token.json';

var authentication;

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

fs.readFile('credentials.json', (err, content) => {
    console.log('begin read file crentials');
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  var oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    const token_json = JSON.parse(token);
    // console.log(token_json);
    oAuth2Client.setCredentials(token_json);
    console.log('before refresh');
    console.log(oAuth2Client);
    // if(oAuth2Client.isTokenExpiring()){
    if(true){
        console.log('WHY ARE YOU REFRESHING');
        refreshAccessToken(oAuth2Client, token_json.refresh_token, () => {
            var token_String = JSON.parse(JSON.stringify(oAuth2Client)).credentials;
            fs.writeFile(TOKEN_PATH, JSON.stringify(token_String), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            authentication = oAuth2Client;
        });

    }else{
        authentication = oAuth2Client;
    }
  });
}

async function refreshAccessToken (oAuth2Client, refresh_string, callback) {
    oAuth2Client = await oAuth2Client.refreshToken(refresh_string);
    callback();
}

function getAccessToken(oAuth2Client) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });  
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}



/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
exports.listFiles = (req, response) => {
// function listFiles() {
  const drive = google.drive({version: 'v3', auth: authentication});
  var message = 'WELL SWEET JESUS';
  drive.files.list({
    pageSize: 10,
    // q: "'0B-JcBSgOuP2nTjFlS01qSEhqX0U' in parents and trashed = false",
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) {
        logger.error('The API returned an error: ' + err);
        response.status(500).send('I"M LIKE STRAIGHT UP NOT HAVING A GOOD TIME');
    }
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        message += `${file.name} (${file.id})`;
        console.log(`${file.name} (${file.id})`);
      });
      response.status(200).send(message);
    } else {
       response.status(200).send('No files found.');
    }
  });
}

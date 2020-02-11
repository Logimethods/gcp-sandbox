const fs = require('fs');
const readline = require('readline');
const request = require('request');
const {google} = require('googleapis');
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub();
var targetTopic;
var invokeDate;

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

function getToken(callback){
    request('https://us-east4-gcp-sandbox-266014.cloudfunctions.net/updateAccessToken', {json: true}, (err, res, body) => {
        if (err) return console.log(err);
        var oAuth2Client = new google.auth.OAuth2(
            body.client_id, body.client_secret, body.redirectUri);
        oAuth2Client.setCredentials(JSON.parse(JSON.stringify(body.token)));
        callback(oAuth2Client);
    });
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.fetchDriveFiles = (event, context) => {    
// function newPara(){
    // targetTopic  = "montly-topic";
    // invokeDate    = "01-01-2020";
    // console.log('event: ' + JSON.stringify(event));
    // var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":null,"data":"eyJkYXRhIjogewogICJ0b3BpYyI6ICJtb250bHktdG9waWMiLAogICJkYXRlIjogIjAxLTAxLTIwMjAiCn19"}');
    var data_string = Buffer.from(event.data, 'base64').toString();
    var data = JSON.parse(data_string).data;
    console.log(data);
    targetTopic     = data.topic;
    invokeDate      = data.date;
    // console.log(Buffer.from(event.data, 'base64').toString());
    console.log(`target: ${targetTopic}`);
    console.log(`invokeDate: ${invokeDate}`);
    console.log('Received request for topic: ' + targetTopic + ' and source date: ' + invokeDate);
    console.log('Fetching files..');
    getToken(fetchFiles);
}
// newPara();
function fetchFiles(authen){
    const drive = google.drive({version: 'v3', auth: authen});
    drive.files.list({
        pageSize: 1000,
        q: "'0B-JcBSgOuP2nTjFlS01qSEhqX0U' in parents and trashed = false",
        // fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) {
            return console.error('The API returned an error: ' + err);
        }
        const files = res.data.files;
        if(files.length){
            fileForName(files, '2020', function(aFile){
                console.log(aFile);
                drive.files.list({
                    pageSize: 1000,
                    q: "'" + aFile.id + "' in parents and trashed = false",
                }, (err1, res1) => {
                    if (err1) {
                        return console.error('The API returned an error: ' + err1);
                    }
                    const files1 = res1.data.files;
                    if(files1.length){
                        fileForName(files1, 'Logimethods', function(bFile){
                            console.log("bFile " + bFile.name);
                            drive.files.list({
                                pageSize: 1000,
                                q: "'" + bFile.id + "' in parents and trashed = false",
                            }, (err2, res2) => {
                                if (err2) {
                                    return console.error('The API returned an error: ' + err2);
                                }
                                const files2 = res2.data.files;
                                console.log(files2.length);
                                sendFileForProcessing(files2, 'Logimethods', invokeDate, targetTopic);
                            });
                        });
                        fileForName(files1, 'Logi-Labs', function(bFile){
                            console.log("bFile " + bFile.name);
                            drive.files.list({
                                pageSize: 1000,
                                q: "'" + bFile.id + "' in parents and trashed = false",
                            }, (err2, res2) => {
                                if (err2) {
                                    return console.error('The API returned an error: ' + err2);
                                }
                                const files2 = res2.data.files;
                                console.log(files2.length);
                                sendFileForProcessing(files2, 'Logi-Labs', invokeDate, targetTopic);
                            });
                        });
                    }
                });
            });
        }
    }
  );
}


async function sendFileForProcessing(files, org, date, targetTopic){
    // var messageBody = `{file_name: "${file.name}", file_id: "${file.id}", org: "${org}", date: "${date}", topic: "${targetTopic}"}`;
    console.log(files);
    if(files.length){
        files.map(async (file) => {
            const messageObject = {
                data:   {
                    file_name:  file.name,
                    file_id:    file.id,
                    org:        org,
                    date:       date, 
                    topic:      targetTopic,
                }
            };
            // console.log("targetTopic");
            // console.log(targetTopic);
            const topic = pubsub.topic(targetTopic);
            const messageBuffer = Buffer.from(JSON.stringify(messageObject), 'utf8');
            try {
                await topic.publish(messageBuffer);
            }catch (err){
                console.error(err);
            }
        });
    }
}

function fileForName(files, fileName, callback) {
    console.log('looking for ' + fileName);
    if(files.length){
        files.map((file) => {
            if(file.name === fileName){
                console.log('found for ' + fileName);
                callback(file);
                console.log('pre resturn for ' + fileName);
                return;
            }
        });
    }
}
ohhi();
/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 **/
// exports.monthlyProcess = (event, context) => {
function ohhi() {
    var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":null,"data":"eyJkYXRhIjp7ImZpbGVfbmFtZSI6IlRpbWVzaGVldCBKYW1lcyBHZXJiZXIiLCJmaWxlX2lkIjoiMW9xSFA0WF9SWl95T1hJbWdxc09wRkdmc01BRnpTeXVWRG5MV1E0LS1mOEEiLCJvcmciOiJMb2dpbWV0aG9kcyIsImRhdGUiOiIwMS0wMS0yMDIwIiwidG9waWMiOiJtb250bHktdG9waWMifX0="}');
    console.log('event: ' + JSON.stringify(event));
    var data_string = Buffer.from(event.data, 'base64').toString();
    var data = JSON.parse(data_string).data;
    console.log(data);
    var file_name     = data.file_name;
    var file_id     = data.file_id;
    var org     = data.org;
    var date     = data.date;
    var topic     = data.topic;
    curr_data = data;
    getToken(checkMonth);
}
var curr_data;
function checkMonth(authen){
    const sheets = google.sheets({version: 'v4', auth: authen});
    sheets.spreadsheets.values.get({
        spreadsheetId: curr_data.file_id,
        range:  sheetNameForDate(curr_data.date),
    }, (err, res)=>{
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        console.log(rows[7][4]);
    });
}
// "date": "01-01-2020"
// mm-dd-yyyy
function sheetNameForDate(date){
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
    var split = date.split('-');
    //select prior month to current date
    var month = parseInt(split[0]) - 2;
    var year = split[2];
    return monthNames[month] + ' ' + year;
}
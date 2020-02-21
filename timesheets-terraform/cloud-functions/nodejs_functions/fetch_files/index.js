const {google} = require('googleapis');
const {PubSub} = require('@google-cloud/pubsub');
const mysql = require('promise-mysql');
const request =require('request');

const pubsub = new PubSub();


function getToken() {
    var options = {
        url: 'https://us-east4-gcp-sandbox-266014.cloudfunctions.net/updateAccessToken',
        json: true
    };
    
    return new Promise((resolve, reject) => {
        request.get(options, (err, res, body) => {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                var oAuth2Client = new google.auth.OAuth2(
                    body.client_id, body.client_secret, body.redirectUri);
                    console.log(body);
                    // console.log(res);
                try{
                    oAuth2Client.setCredentials(JSON.parse(JSON.stringify(body.token)));
                    resolve(oAuth2Client);
                }catch(err1){
                    console.log(err)
                    reject(err);
                }
                
            }
        });
    });
}

function getFiles(options, authen){
    return new Promise((resolve, reject) => {
        const drive = google.drive({version: 'v3', auth: authen});
        drive.files.list(options, (err, res) => {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve(res.data.files);
            }
        });
    });
}
// newPara();
/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.fetchDriveFiles = (event, context, callback) => {  
    console.log('event: ' + JSON.stringify(event));  
// function newPara(){
//     //weekly
    // var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":null,"data":"e1wiZGF0YVwiOiB7XCJ0b3BpY1wiOiBcIm1vbnRobHktdG9waWNcIn19"}');
//     //mothly
//     var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":null,"data":"ewogICJkYXRhIjogewogICAgInRvcGljIjogIm1vbnRobHktdG9waWMiLAogICAgImRhdGUiOiAiMDEtMDEtMjAyMCIKICB9Cn0="}');
    var data_string = Buffer.from(event.data, 'base64').toString();
    var data = JSON.parse(data_string).data;
    var targetTopic     = data.topic;
    var this_date       = new Date();
    var invokeDate      = (this_date.getMonth() + 1) + "-" + this_date.getDate() + "-" + this_date.getFullYear();
    console.log(`target: ${targetTopic}`);
    console.log(`invokeDate: ${invokeDate}`);
    console.log('Received request for topic: ' + targetTopic + ' and source date: ' + invokeDate);
    console.log('Fetching files..');
    var initGetTokenPromise = getToken();
    initGetTokenPromise.then((authen) => {
        var getFilesOptions = {
            pageSize: 1000,
            q: "'0B-JcBSgOuP2nTjFlS01qSEhqX0U' in parents and trashed = false",
        };
        var initGetFilesPromise = getFiles(getFilesOptions, authen);
        initGetFilesPromise.then((files) => {
            if(files.length){
                var isMonthly = targetTopic.includes('month');
                var targetYear = yearFolderForDate(invokeDate, isMonthly);
                var yearFolderFile = fileForName(files, targetYear);
                var getYearFilesOptions = {
                    pageSize: 1000,
                    q: "'" + yearFolderFile.id + "' in parents and trashed = false",
                };
                var initGetYearFilesPromise = getFiles(getYearFilesOptions, authen);
                initGetYearFilesPromise.then((files1) => {
                    var LogimethodsFolderFile = fileForName(files1, 'Logimethods');
                    var getLogimethodsFilesOptions = {
                        pageSize: 1000,
                        q: "'" + LogimethodsFolderFile.id + "' in parents and trashed = false",
                    };
                    var initGetLogimethodsFilesPromise = getFiles(getLogimethodsFilesOptions, authen);
                    
                    var LogiLabsFolderFile = fileForName(files1, 'Logi-Labs');
                    var getLogiLabsFilesOptions = {
                        pageSize: 1000,
                        q: "'" + LogiLabsFolderFile.id + "' in parents and trashed = false",
                    };
                    var initGetLogiLabsFilesPromise = getFiles(getLogiLabsFilesOptions, authen);
                    initGetLogiLabsFilesPromise.then((files2) => {
                        sendFileForProcessing(files2, 'Logi-Labs', invokeDate, targetTopic).then((value) => {
                            console.log(JSON.stringify(value));
                            initGetLogimethodsFilesPromise.then((files2) => {
                                sendFileForProcessing(files2, 'Logimethods', invokeDate, targetTopic).then((value) => {
                                    console.log(JSON.stringify(value));
                                    callback(null, 'All files sent for processing.');
                                });
                            });
                        });
                    });
                });
            }
        });
    });
}

function sendFileForProcessing(files, org, date, targetTopic){
    console.log(`sending ${files.length} to topic ${targetTopic}`);
    var lastFile = files.pop();
    var lastFileAttributes = {isLast: 'true'};
    return Promise.all(files.map((file) => {publishMessage(file, org, date, targetTopic)})
        .concat([publishMessage(lastFile, org, date, targetTopic, lastFileAttributes)]));
}
function publishMessage(file, org, date, targetTopic, attributes) {
    const attr = attributes || { 
        isLast: 'false'
    };
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
        console.log(`sending to topic ${targetTopic} data: ${JSON.stringify(messageObject)}`);                
        return topic.publish(messageBuffer, attr);
    }catch (err){
        console.log('An error occured publishing to ' + targetTopic + ' with error ' + JSON.stringify(err));
        console.error(err);
    }
        
}

function fileForName(files, fileName) {
    console.log('looking for ' + fileName);
    var returnFile;
    if(files.length){
        files.map((file) => {
            if(file.name == fileName){
                console.log('found for ' + JSON.stringify(file));
                returnFile = file;
            }
        });
    }
    return returnFile;
}

// ohhi();
/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 **/
exports.weeklyProcess = (event, context, callback) => {
// function ohhi() {
    console.log('event: ' + JSON.stringify(event));
    console.log('context: ' + JSON.stringify(context));
    
    // var context = JSON.parse('{"eventId":"443129627133141","timestamp":"2020-02-17T15:59:53.291Z","eventType":"google.pubsub.topic.publish","resource":{"service":"pubsub.googleapis.com","name":"projects/gcp-sandbox-266014/topics/montly-topic","type":"type.googleapis.com/google.pubsub.v1.PubsubMessage"}}');
    // var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":{"isLast":"false"},"data":"eyJkYXRhIjp7ImZpbGVfbmFtZSI6IlRpbWVzaGVldCBXYWxkZXMgTWFjaGFkbyIsImZpbGVfaWQiOiIxRktmMExVdDJENDI1dXUwNktkLVBCem5hQlNVU0s2LWtDTjBwNWVDYm1jUSIsIm9yZyI6IkxvZ2ltZXRob2RzIiwiZGF0ZSI6IjAyLTExLTIwMjAiLCJ0b3BpYyI6IndlZWtseS10b3BpYyJ9fQ=="}');
    var isLast;
    try{
        isLast = event.attributes.isLast;
    }catch (err){
        isLast = 'false';
    }
    isLast = isLast == 'true';
    var data_string = Buffer.from(event.data, 'base64').toString();
    var data = JSON.parse(data_string).data;
    console.log(data);
    var initGetTokenPromise = getToken();
    initGetTokenPromise.then((authen) => {
        const sheets = google.sheets({version: 'v4', auth: authen});
        sheets.spreadsheets.values.get({
            spreadsheetId: data.file_id,
            range:  sheetNameForDate(data.date),
        }, (err, res)=>{
            if (err) throw err;
            const rows = res.data.values;
            var weekly_status = getWeekStatus(rows, data.date);
            console.log(weekly_status);
            var initCreatePoolPromise = createPool();
            initCreatePoolPromise.then((pool) => {
                var existsStmt = 'SELECT id FROM status WHERE id = ?';
                pool.query(existsStmt, [data.file_id], (err, res) => {
                    if (err) {console.log(err);throw err;}
                    var stmt;
                    var params;
                    var date_split = data.date.split('-');
                    if(res.length > 0){
                        stmt = 'UPDATE status SET week_check_date = ?, week_status = ? WHERE id = ?';
                        params = [new Date(date_split[2], date_split[0] - 1, date_split[1]), weekly_status, data.file_id];
                    }else {
                        stmt = 'INSERT INTO status (id, name, org, week_check_date, week_status) VALUES (?, ?, ?, ?, ?)';
                        params = [data.file_id, data.file_name, data.org, new Date(date_split[2], date_split[0] - 1, date_split[1]), weekly_status];
                    }
                    console.log('pool query for: ' + stmt + ' \nparams: ' + params)
                    pool.query(stmt, params, (err1, res1) => {
                        if (err1) throw err1;
                    });
                });
            });
        });
    }).finally(() => {
        console.log(isLast);
        if(isLast){
            // const topic = pubsub.topic(UPDATE_WEB_VIEW_TOPIC);
            // const messageBuffer = Buffer.from('update webview', 'utf8');
            // topic.publish(messageBuffer);
        }
        pool.end();
        callback(null, "weekly process end.")
    });
}




const UPDATE_WEB_VIEW_TOPIC = 'update-timesheets-status-webview';

// ohhi();
/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 **/
exports.monthlyProcess = (event, context, callback) => {
// function ohhi() {
    console.log('event: ' + JSON.stringify(event));
    console.log('context: ' + JSON.stringify(context));
    
    // var context = JSON.parse('{"eventId":"443129627133141","timestamp":"2020-02-17T15:59:53.291Z","eventType":"google.pubsub.topic.publish","resource":{"service":"pubsub.googleapis.com","name":"projects/gcp-sandbox-266014/topics/montly-topic","type":"type.googleapis.com/google.pubsub.v1.PubsubMessage"}}');
    // var event = JSON.parse('{"@type":"type.googleapis.com/google.pubsub.v1.PubsubMessage","attributes":{"isLast":"false"},"data":"eyJkYXRhIjp7ImZpbGVfbmFtZSI6IlRpbWVzaGVldCBQYXNjYWwgR2F1dGhpZXIiLCJmaWxlX2lkIjoiMXVrMG1WNVh1Y1JRd3drVGVmNDlwOW9KX3NNOVRyS3BZX1BLZ3VlNWxGZ1UiLCJvcmciOiJMb2dpbWV0aG9kcyIsImRhdGUiOiIyLTIxLTIwMjAiLCJ0b3BpYyI6Im1vbnRobHktdG9waWMifX0="}');
    var isLast;
    try{
        isLast = event.attributes.isLast;
    }catch (err){
        isLast = 'false';
    }
    isLast = isLast == 'true';
    var data_string = Buffer.from(event.data, 'base64').toString();
    var data = JSON.parse(data_string).data;
    console.log(data);
    var initGetTokenPromise = getToken();
    initGetTokenPromise.then((authen) => {
        const sheets = google.sheets({version: 'v4', auth: authen});
        sheets.spreadsheets.values.get({
            spreadsheetId: data.file_id,
            //monthly set date to month - 1
            range:  sheetNameForDate(dateStringLessMonth(data.date)),
        }, (err, res)=>{
            if (err) throw err;
            const rows = res.data.values;
            console.log(rows[7][4]);
            var monthly_status = 'N/A'; 
            if(rows[7][4] === 'Yes'){
                monthly_status = 'Y';
            }else{
                monthly_status = 'N';
            }
            console.log(`month status ${monthly_status}`);
            var initCreatePoolPromise = createPool();
            initCreatePoolPromise.then((pool) => {
                var existsStmt = 'SELECT id FROM status WHERE id = ?';
                pool.query(existsStmt, [data.file_id], (err, res) => {
                    if (err) throw err;
                    var stmt;
                    var params;
                    var date_split = data.date.split('-');
                    if(res.length > 0){
                        stmt = 'UPDATE status SET month_check_date = ?, month_status = ? WHERE id = ?';
                        params = [new Date(date_split[2], date_split[0] - 1, date_split[1]), monthly_status, data.file_id];
                    }else {
                        stmt = 'INSERT INTO status (id, name, org, month_check_date, month_status) VALUES (?, ?, ?, ?, ?)';
                        params = [data.file_id, data.file_name, data.org, new Date(date_split[2], date_split[0]  - 1, date_split[1]), monthly_status];
                    }
                    console.log('pool query for: ' + stmt + ' \nparams: ' + params)
                    pool.query(stmt, params, (err1, res1) => {
                        if (err1) throw err1;
                    });
                });
            });
        });
    }).finally(() => {
        if(isLast){
            // const topic = pubsub.topic(UPDATE_WEB_VIEW_TOPIC);
            // const messageBuffer = Buffer.from('update webview', 'utf8');
            // topic.publish(messageBuffer);
        }
        callback(null, "monthly process end.")
    });
}
function dateStringLessMonth(date){
    var date_split = date.split('-');
    var m = date_split[0] - 1;
    return m + '-' + date_split[1] + '-' + date_split[2];
}
//[][]
// mm-dd-yyyy
function getWeekStatus(rows, date){
    const initCol = 4;
    const initRow = 9;
    var status = false;
    rows.slice(initRow).forEach((row) => {
        if(row[1] == 'Total'){
            
            status = checkWeekForRow(row.slice(initCol), date);
        }
    });
    return status;
}
//[]
// mm-dd-yyyy
function checkWeekForRow(row, date){
    console.log(row);
    console.log(date);
    var monday = mondayDateForDate(date);
    var dayIndex = monday.getDate() - 1;
    var checkRange = 5;
    var daysInM = daysInMonth(monday.getMonth() + 1, monday.getFullYear());

    if((daysInM - dayIndex) < 5){
        checkRange = daysInM - dayIndex;
    }
    // console.log(row.slice(dayIndex, dayIndex + checkRange));
    var ok = 'Y';
    row.slice(dayIndex, dayIndex + checkRange).forEach((value) => {
        if(ok){
            try{
                intval = parseInt(value)
                if(intval < 8){
                    ok = 'N';
                }
            }catch(err){
                ok = 'N';
            }
        }
    });
    return ok;
}
function daysInMonth (month, year) { 
    // console.log(`building something ${month}   ${year}`);
    return new Date(year, month, 0).getDate(); 
} 

// "date": "01-01-2020"
// mm-dd-yyyy
function sheetNameForDate(date){
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
    var split = date.split('-');
    var month = parseInt(split[0]) - 1;
    var year = split[2];
    if(month < 0) {
        month = 11;
        year = parseInt(year) - 1;
    }
    return monthNames[month] + ' ' + year;
}

function yearFolderForDate(date, isMonthly){
    if(isMonthly){
        var split = date.split('-');
        var month = parseInt(split[0])
        var year = split[2];
        if(month === 1){
            return parseInt(year) - 1;
        } 
        return year;
    }else {
        return mondayDateForDate(date).getFullYear();
    }
    
}
// mondayDateForDate("01-22-2020");
function mondayDateForDate(date){
    var split = date.split('-');
    var d = new Date(split[2], split[0] - 1, split[1]);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d;
}

function getTotalRow(values){
    return values[1];
}

function createPool() {
    var pool;
    var options = {
        user: 'dbuser',
        password: 'dbuser',
        database: 'timesheets',
        socketPath: `/cloudsql/gcp-sandbox-266014:us-east4:mysql-s-sandbox-us-east4-master`,
		// host:	'35.245.9.72',
		// port:	'3306',
        connectionLimit: 100,
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
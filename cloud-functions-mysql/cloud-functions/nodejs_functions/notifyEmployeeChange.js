'use strict';

const express = require('express');
const mysql = require('promise-mysql');


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
      database: 'employees',
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
};
createPool();
// [END cloud_sql_mysql_mysql_create]

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.getDeptForEmployeeNum = async (req, res) => {
    var emp_no;
    emp_no = req.headers['employee-number'] || -1;
    if(emp_no < 0){
        res.status(400).send('header \'employee-number\' required.');
    } 
    emp_no = parseInt(emp_no);
    if(isNaN(emp_no)){
        res.status(400).send('header \'employee-number\' must be a number value.');
    } else {
        var stmt = 'SELECT * FROM employees WHERE emp_no = ?';
        const employeeNumbers =  pool.query(stmt, [emp_no]);
        const employeeNumbersResult = await employeeNumbers;
        if(employeeNumbersResult.length <= 0){
            res.status(404).send('No employee found for employee number: ' + emp_no + '.');
        }
            stmt = 'SELECT * FROM dept_emp WHERE emp_no = ?';
            const deptEmployee =  pool.query(stmt, [emp_no]);
            const deptEmployeeResult = await deptEmployee;
            if(deptEmployeeResult.length <= 0){
                res.status(404).send('No department found for employee number: ' + emp_no + '.');
            }
            stmt = 'SELECT * FROM departments WHERE dept_no = ?';
            const dept =  pool.query(stmt, [deptEmployeeResult[0].dept_no]);
            const deptResult = await deptEmployee;

            var message = '{Employee: \n{first_name: ' + employeeNumbersResult[0].first_name + ',\nlast_name: '
                + employeeNumbersResult[0].last_name +',\nemp_no: ' + employeeNumbersResult[0].emp_no + '},'
                +'Department: {\ndept_no: ' +deptEmployeeResult[0].dept_no+',\ndept_name: '+deptResult[0].dept_name + '}}';
            res.set('Content-Type', 'application/json').status(200).send(message);
           
    } 
};
#!/usr/bin/env /usr/bin/nodejs
var fs = require('fs');
var exec = require('child_process').exec;

var root = "/home/pi/bots/";
var tasks = JSON.parse(fs.readFileSync(root+"tasks.json", 'utf8'));

var logMessage = [];

// cronjob sends interval name in arg
var interval = process.argv.slice(2)[0];

// execute all tasks in this interval
tasks[interval].forEach(function(task){
  logMessage.push("executing '"+task+"'");
  exec(task, function(error, stdout, stderr) {
    if (error) {
      logMessage.push("execute error: "+error);
    }
    logMessage.push("execute stdout: "+stdout);
  });
});

// log to console and log file
console.log(JSON.stringify(logMessage));
// var dateObj = new Date();
// var m = dateObj.getMonth()+1;
// var d = dateObj.getDate();
// var y = dateObj.getFullYear();
// var date = y+"-"+m+"-"+d;
// var hr = dateObj.getHours();
// var min = dateObj.getMinutes();
// var time = hr+":"+min;
// var log = JSON.parse(fs.readFileSync(root+"log.json", 'utf8'));
// if (log.length > 100) log.shift();
// log.push({date:date,time:time,log:logMessage});
// fs.writeFileSync(root+"log.json", JSON.stringify(log), 'utf8');
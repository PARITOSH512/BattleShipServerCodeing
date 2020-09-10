var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var log4js = require('log4js');
var mysql = require('mysql');
var Server = require('./Classes/Server');


var youcantjoin = false;
var thisismycode;
//config of log4js
log4js.configure({
    appenders: {
      everything: { type: 'file', filename: '_GAME_LOG.log', maxLogSize: 1000000, }
    },
    categories: {
        default: { appenders: ['everything'], level: 'debug' }
    }
});

//config for crash reporting
require('crashreporter').configure({
    outDir: (__dirname + '/bin/crash'),
    exitOnCrash: false // if you want that crash reporter exit(1) for you, default to true,
});

//config for mysql
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ebizz2016",
    database: "battle_war_ship_db",
    charset: 'utf8mb4'
});

//checking db connection
db.connect(function (err) {
    if (err) {
        console.log('Error message: ' + err.sqlMessage)
        console.log('cannot connect to database');
        return;
    }
    console.log('database connected');
    //fire any query at some timeout so database connection can not get disconnect
    /* setInterval(function () {
        db.query('SELECT 1');
    }, 3000); */
});

//get environment port or custom port
var port =  52300 || process.env.PORT

//variables
let generatedCodes = [];
let teams = [];

console.log("Server Started");

var server = new Server();

setInterval(()=>
{
  server.onUpdate();
  //console.log("data0");
},100,0);

io.on('connection', function (socket) 
{
    let connection = server.onConnection(socket);
    connection.createEvents();

    console.log('a user connected');

    socket.emit("register",{'id':connection.player.player_id})
});
http.listen(port, function () {
    console.log('listening on *: ' + port);
});

function interval(func, wait, times) {
    var interv = (function (w, t) {
      return function () {
        if (typeof t === "undefined" || t-- > 0) {
          SetTimeout(interv, w);
  
          try {
            func.call(null);
          } catch (e) {
            t = 0;
            throw e.toString();
          }
        }
      };
    })(wait, times);
  
    setTimeout(interv, wait);
  }

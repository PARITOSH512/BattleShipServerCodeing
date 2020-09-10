var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var log4js = require('log4js');
var mysql = require('mysql');
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

//custom methods
/**
 * will generate unique code
 * @param {int} len code length
 * @param {String} arr from which to generate 
 */
function randomCode(len, arr) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

app.get('/', function (req, res) {
    res.send('<h1>404</h1>');
    console.log("-=-=app.get-=-");
});

app.get("/getUniqueCode/:userName/:deviceId", function (req, res) {
    if (req.params.userName == undefined || req.params.userName == '') {
        res.json({ status: false, message: "Username is required" })
    }

    let myCode = '';
    do {
        myCode = randomCode(7, "0123456789ABCDEFGHIJKL")
    } while (generatedCodes.includes(myCode));

    generatedCodes.push(myCode);

    teams[myCode] = [{
        userName: req.params.userName,
        role: "admin",
        deviceId: req.params.deviceId,
    }]
    console.log(new Date().getMinutes() + ": " + myCode)

    res.json({ status: true, message: "Code generated", myCode: myCode })
})

app.get("/checkCode/:code/:userName/:deviceId", function (req, res) {
    if (req.params.code == undefined || req.params.code == '') {
        res.json({ status: false, message: "Code is required" })
    }

    if (req.params.userName == undefined || req.params.userName == '') {
        res.json({ status: false, message: "Username is required" })
    }

    let myCode = req.params.code;
    
    
    if (generatedCodes.includes(myCode)) {
        if (teams[myCode].length >= 4) {
            res.json({ status: false, message: "Team is already full. You can't join." })
        } else {
            let inputJson = {
                userName: req.params.userName,
                role: "friend",
                deviceId: req.params.deviceId,
            };

            console.log("TEAMS: ", teams[myCode]);

            var matchedCategories = teams[myCode].filter(i => i.deviceId == inputJson.deviceId);

            console.log("matchedCategories: ", matchedCategories);

            if (matchedCategories.length > 0) {
                res.json({ status: true, message: "You are already in team", team: teams[myCode] })
            } else {
                teams[myCode].push(inputJson)
                teams[thisismycode].push(inputJson) 
                res.json({ status: true, message: "Found team", team: teams[myCode] })
            }
        }
    } else {
        res.json({ status: false, message: "Not found any team with this code" })
    }
})

io.on('connection', function (socket) {
    console.log('a user connected');

     socket.join('adminRoom');

    socket.on("getUniqueCode", function (data, ack) {
        console.log("getUniqueCode: ", data);
        if (data.userName == undefined || data.userName == '') {
            ack({ status: false, message: "Username is required" })
        }

        let myCode = '';
        
        do {
            myCode = randomCode(7, "0123456789ABCDEFGHIJKL")
        } while (generatedCodes.includes(myCode));

        generatedCodes.push(myCode);
        thisismycode = myCode;
        youcantjoin=true;

        teams[myCode] = [{
            userName: data.userName,
            role: "admin",
            deviceId: data.deviceId,
            socket: socket.id
        }]
        console.log(new Date().getMinutes() + ": " + myCode)

        ack({ status: true, message: "Code generated", myCode: myCode })
    })

    socket.on("adminDidLeft", function (data, ack) {
        console.log("adminDidLeft: ", data);
        if (data.code != undefined && data.code != '') {
            let getAllUsers = teams[data.code]

            if (getAllUsers != undefined) {
                getAllUsers.forEach(item => {
                    socket.to(item.socket).emit("leftGame", { message: "Admin has left/ the game. Please try to create/join new game." })
                    //item.socket.emit("leftGame", { message: "Admin has left the game. Please try to create/join new game." })
                });
            }

            delete teams[data.code];

            console.log("removeData: ", teams)
            ack({ message: "Sent code", status: true })
        } else {
            ack({ message: "Please send code", status: false })
        }
    })

    socket.on("joinGame", function (data, ack) {
        console.log("joinGame: ", data);
        if (data.code == undefined || data.code == '') {
            ack({ status: false, message: "Code is required" })
        }

        if (data.userName == undefined || data.userName == '') {
            ack({ status: false, message: "Username is required" })
        }

        let myCode = data.code.toUpperCase();

               if (myCode == "") {
                console.log("myCode is Not found : ");
               }
        if (generatedCodes.includes(myCode)) {

              console.log("joinGame youcantjoin AA: ", youcantjoin);

            if (teams[myCode].length >= 4 || youcantjoin == false) {
                console.log("joinGame youcantjoin if: ", youcantjoin);
                ack({ status: false, message: "Team is already full or you left the battle in between. You can't join." })

            } 
            else 
            {
                console.log("joinGame youcantjoin else: ", youcantjoin);
                let inputJson = {
                    userName: data.userName,
                    role: "friend",
                    deviceId: data.deviceId,
                    socket: socket.id
                };

                console.log("TEAMS: ", teams[myCode]);

                var matchedCategories = teams[myCode].filter(i => i.socket == inputJson.socket);

                if (matchedCategories.length > 0) {
                    ack({ status: true, message: "You are already in team", team: teams[myCode] })
                } else {
                    teams[myCode].push(inputJson)

                    ack({ status: true, message: "Found team", team: teams[myCode] })

                     console.log("playerJoinedRoom AA: ", { status: true, team: teams[myCode] });

                teams[myCode].forEach(item => {
                    socket.to(item.socket).emit("playerJoinedRoom", { status: true, team: teams[myCode] })
                     console.log("playerJoinedRoom Call:",youcantjoin);
                });

                // if (teams[myCode].length > 4 && youcantjoin==true) {
                //         console.log("Four Player joined you cant join:",youcantjoin);
                // }else
                // {


                // }

                }

                // var i = 0;
                // resp(i);

                // function resp(i){
                //     if(teams[myCode].length > i){

                        

                //          //console.log("_id" ,teams[myCode][0].deviceId);

                       
                //         //io.to('adminRoom').emit("playerJoinedRoom", { status: true, team: teams[myCode] })
                        
                //         setTimeout(function(){

                //             var index = random(10,20) 

                //              console.log("index  ♦" ,index);

                //      var Rand;
                //      var LastRand = new Array();
                //      var Max = index;
                //      var numbers = new Array();
                    
                //      LastRand = [Max];
        
                //         for (var i = 1; i < Max; i++)
                //         {
                //             Rand = random(0, 20);
        
                //             for (var j = 1; j < LastRand.length; j++)
                //             {
                //                 while (Rand == LastRand[j])
                //                 {
                //                     Rand = random(0, 20);
                //                 }
                //             }
        
                //             LastRand[i] = Rand;
                //             numbers.push(Rand);
                //         }
                //             console.log(numbers);
            
                //      console.log("numbers 0 1 2: ♦" ,numbers);

                //      var plane = new Array(index);

                //     for (var i = 0; i < plane.length; i++) {
                //          plane[i] = random(10, 20)
                //             }
                //       console.log("plane 0 1 2: ♦" ,plane);
            
                //          var dataplayerfour;
                //          var dataplayerfour;
                //          var dataplayerfour;
                //          var dataplayerfour;

                // console.log("♦ teams[myCode].length ♦" ,teams[myCode].length);

               
                // //console.log("♦ _id" ,teams[myCode][1].deviceId);
                
                // var AllPlayerData = [];

                //     for (var q = 0; q < teams[myCode].length; q++) {
                        
                //         if (q == 0 ) 
                //         {
                //             myColor = "red"
                //              console.log("♦ _id" ,teams[myCode][0].deviceId);
                //             var dataplayerone = {
                //                  "playerindex" : numbers[q],
                //                  "Playerplane": random(20, 30),
                //                  "playerCode" : "playername",
                //                  "teamCode" : q+1,
                //                  "teamColor" : myColor,
                //                  "_id": teams[myCode][0].deviceId,
                //                  };
                //                  AllPlayerData.push(dataplayerone);
                //         }
                //         if (q == 1) 
                //         {
                //             myColor = "yellow"
                //              console.log("♦ _id" ,teams[myCode][1].deviceId);
                //              var dataplayertwo = {
                //                  "playerindex" : numbers[q],
                //                  "Playerplane": random(20, 30),
                //                  "playerCode" : "playername",
                //                  "teamCode" : q+1,
                //                  "teamColor" : myColor,
                //                  "_id": teams[myCode][1].deviceId,
                //                  };
                //                  AllPlayerData.push(dataplayertwo);
                //         }
                //         if (q == 2 ) 
                //         {
                //             myColor = "green"
                //              console.log("♦ _id" ,teams[myCode][2].deviceId);
                //          var dataplayerthree = {
                //                  "playerindex" : numbers[q],
                //                  "Playerplane": random(20, 30),
                //                  "playerCode" : "playername",
                //                  "teamCode" : q+1,
                //                  "teamColor" : myColor,
                //                  "_id": teams[myCode][2].deviceId,
                //                  };
                //                  AllPlayerData.push(dataplayerthree);
                //         }
                //         if (q == 3) 
                //         {
                //             myColor = "blue"
                //              console.log("♦ _id" ,teams[myCode][3].deviceId);
                //             var dataplayerfour = {
                //                  "playerindex" : numbers[q],
                //                  "Playerplane": random(20, 30),
                //                  "playerCode" : "playername",
                //                  "teamCode" : q+1,
                //                  "teamColor" : myColor,
                //                  "_id": teams[myCode][3].deviceId,
                //                  };
                //                  AllPlayerData.push(dataplayerfour);
                //         }
                //     }

                //              var data1 = {
                //                  "En":"startGame",
                //                  "spawncontainerindex":random(0,2),
                //                  "playingData":[{
                //                      "activethisindex":numbers,
                //                      "planevalue":plane
                //                                          }],
                //                     "playerData": AllPlayerData
                //              };

                //                 console.log("data1 0 1 2: ♦" ,data1);
                            

                //             // socket.to(teams[myCode].socket).emit("startGame", data)
                //             i++;
                //             resp(i);
                            
                //             io.to('adminRoom').emit("startGame", data1);

                //             setTimeout(function()
                //             {
                //                  console.log("setTimeout startTimer ♦" );
                //                  io.to('adminRoom').emit("startTimer");
                //             },5000);

                //             myCode ="";
                //             console.log("data1 0 1 2: ♦" ,myCode);
                //             youcantjoin = false;
                //              console.log("youcantjoin" ,youcantjoin);
                //             teams[myCode] = "";
                //              console.log("data1 0 1 2: ♦" ,teams[myCode]);

                //         },15000);



                //     }
                //     // else{
                //     //     i++;
                //     //     resp(i)
                //     // }

                //         // setInterval
                //         // (function()
                //         //     {
                //         //         var data =
                //         //         {
                //         //             "timer":1,
                //         //         };
                //         //         console.log("timer Call ♦" ,data);
                //         //         io.to('adminRoom').emit("timer", data);
                //         //     }, 10000);

                // }
            }
        } 
        else 
        {
            ack({ status: false, message: "Not found any team with this code" })
        }
    })

    socket.on("Emoji",function(data)
    {
         console.log("Emoji ♣♦♠♥" ,data);
        io.to('adminRoom').emit('Emoji',data);
    })

    socket.on("Attack",function(data)
    {
         console.log("Attack ♣♦♠♥" ,data);
        io.to('adminRoom').emit('Attack',data);
        teams[myCode]
    })

    socket.on("startGame" ,function (data) {
        console.log("On Button Click startGame: ♦");

//////////////////////////////
                     var index = random(10,20) 

                     console.log("index  ♦" ,index);

                     var Rand;
                     var LastRand = new Array();
                     var Max = index;
                     var numbers = new Array();
                    
                     LastRand = [Max];
        
                        for (var i = 1; i < Max; i++)
                        {
                            Rand = random(0, 20);
        
                            for (var j = 1; j < LastRand.length; j++)
                            {
                                while (Rand == LastRand[j])
                                {
                                    Rand = random(0, 20);
                                }
                            }
        
                            LastRand[i] = Rand;
                            numbers.push(Rand);
                        }
                            console.log(numbers);
            
                    console.log("numbers 0 1 2: ♦" ,numbers);

                    var plane = new Array(index);

                    for (var i = 0; i < plane.length; i++) {
                        plane[i] = random(10, 20)
                            }
                    console.log("plane 0 1 2: ♦" ,plane);
            
                        var dataplayerfour;
                        var dataplayerfour;
                        var dataplayerfour;
                        var dataplayerfour;

                console.log("♦ thisismycode ♦" ,thisismycode);
                console.log("♦ teams[myCode].length ♦" ,teams[thisismycode].length);

            
                //console.log("♦ _id" ,teams[myCode][1].deviceId); vej kerk kfm
                
                var AllPlayerData = [];

                    for (var q = 0; q < teams[thisismycode].length; q++) {
                        
                        if (q == 0 ) 
                        {
                            myColor = "red"
                            console.log("♦ _id" ,teams[thisismycode][0].deviceId);
                            var dataplayerone = {
                                "playerindex" : numbers[q],
                                "Playerplane": random(20, 30),
                                "playerCode" : "playername",
                                "teamCode" : q+1,
                                "teamColor" : myColor,
                                "_id": teams[thisismycode][0].deviceId,
                                };
                                AllPlayerData.push(dataplayerone);
                        }
                        if (q == 1) 
                        {
                            myColor = "yellow"
                             console.log("♦ _id" ,teams[thisismycode][1].deviceId);
                             var dataplayertwo = {
                                 "playerindex" : numbers[q],
                                 "Playerplane": random(20, 30),
                                 "playerCode" : "playername",
                                 "teamCode" : q+1,
                                 "teamColor" : myColor,
                                 "_id": teams[thisismycode][1].deviceId,
                                 };
                                 AllPlayerData.push(dataplayertwo);
                        }
                        if (q == 2 ) 
                        {
                            myColor = "green"
                             console.log("♦ _id" ,teams[thisismycode][2].deviceId);
                         var dataplayerthree = {
                                 "playerindex" : numbers[q],
                                 "Playerplane": random(20, 30),
                                 "playerCode" : "playername",
                                 "teamCode" : q+1,
                                 "teamColor" : myColor,
                                 "_id": teams[thisismycode][2].deviceId,
                                 };
                                 AllPlayerData.push(dataplayerthree);
                        }
                        if (q == 3) 
                        {
                            myColor = "blue"
                             console.log("♦ _id" ,teams[thisismycode][3].deviceId);
                            var dataplayerfour = {
                                 "playerindex" : numbers[q],
                                 "Playerplane": random(20, 30),
                                 "playerCode" : "playername",
                                 "teamCode" : q+1,
                                 "teamColor" : myColor,
                                 "_id": teams[thisismycode][3].deviceId,
                                 };
                                 AllPlayerData.push(dataplayerfour);
                        }
                    }

                             var data1 = {
                                 "En":"startGame",
                                 "spawncontainerindex":random(0,2),
                                 "playingData":[{
                                     "activethisindex":numbers,
                                     "planevalue":plane
                                                        }],
                                    "playerData": AllPlayerData
                             };

                                console.log("data1 0 1 2: ♦" ,data1);
                            

                            // socket.to(teams[myCode].socket).emit("startGame", data)
                            i++;
                            // resp(i);
                            
                            io.to('adminRoom').emit("startGame", data1);

                            setTimeout(function()
                            {
                                console.log("setTimeout startTimer ♦" );
                             io.to('adminRoom').emit("startTimer");

                            },5000);

                            myCode ="";
                            console.log("myCode ♦" ,myCode);
                            youcantjoin = false;
//////////////////////////////
    })


    socket.on("leftGame", function (data, ack) {
        if (data.code == undefined || data.code == '') {
            if (typeof ack == 'function') {
                ack({ status: false, message: "Code is required" })
            }
        }

        if (data.deviceId == undefined || data.deviceId == '') {
            if (typeof ack == 'function')
                ack({ status: false, message: "deviceId is required" })
        }

        data.code = data.code.toUpperCase();

        let index = teams[data.code].findIndex(item => item.deviceId == data.deviceId)
        if (index >= 0) {
            teams[data.code].splice(index, 1);
            if (typeof ack == 'function')
                ack({ status: true, message: "left game" })
        } else {
            if (typeof ack == 'function')
                ack({ status: false, message: "not found your data in team" })
        }

        teams[data.code].forEach(item => {
            socket.to(item.socket).emit("playerLeftGame", { status: true, team: teams[data.code] })
        });

    })
});

http.listen(port, function () {
    console.log('listening on *: ' + port);
});

function random(low, high)
{
    return Math.floor(Math.random() * (high - low) + low);
}


// function intervalFunc()
// {
//   console.log('Cant stop me now!');
// }

// setInterval(intervalFunc, 1000);

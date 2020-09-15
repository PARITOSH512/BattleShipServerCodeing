let iceland = require('./Icelands');
let AttackingPlane = require('./AttackingPlane');
let LobbyState = require('./LobbyState');

module.exports = class Connection
{
    constructor()
    {
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }
    createEvents()
    {
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;
        
        socket.on("getUniqueCode", function (data, ack) {
            console.log("getUniqueCode: ", data);
            if (data.userName == undefined || data.userName == '') {
                ack({ status: false, message: "Username is required" })
            }
    
            let myCode = '';
            
            do {
                myCode = randomCode(7, "0123456789ABCDEFGHIJKL")
            } while (server.generatedCodes.includes(myCode));
    
            
            server.generatedCodes.push(myCode);
            //thisismycode = myCode;
            //youcantjoin=true;
    
            //Player data
            player.username = data.userName;
            player.role="admin";
            player.deviceId=data.deviceId;
            player.socketId=socket.id;
            
            
            server.teams[myCode] = [{
                lobby_id: myCode,
                userName: data.userName,
                role: "admin",
                deviceId: data.deviceId,
                socket: socket.id
            }]
            console.log(new Date().getMinutes() + ": " + myCode)
    
            server.Create_Lobby(myCode);
            server.onSwtichLobby(connection,myCode);
            ack({ status: true, message: "Code generated", myCode: myCode })
        });

        socket.on("joinGame", function (data, ack) 
    {
        console.log("joinGame: ", data);
        if (data.code == undefined || data.code == '') {
            ack({ status: false, message: "Code is required" })
        }

        if (data.userName == undefined || data.userName == '') {
            ack({ status: false, message: "Username is required" })
        }

        let myCode = data.code.toUpperCase();
        console.log("mycode-=-=->"+myCode+"  "+server.lobbys[myCode].id);
                if (myCode == "") {
                console.log("myCode is Not found : ");
                }
        if (server.generatedCodes.includes(myCode)) {

            console.log("joinGame youcantjoin AA: "+myCode);

            if(server.lobbys[myCode].Connection.length>=4 || server.lobbys[player.lobby_id].Started_Game)
            {
                ack({ status: false, message: "Team is already full or you left the battle in between. You can't join." })
            }
            
            
            //   if (teams[myCode].length >= 4 || youcantjoin == false) {
            //     console.log("joinGame youcantjoin if: ", youcantjoin);
            //     ack({ status: false, message: "Team is already full or you left the battle in between. You can't join." })

            // } 
            else 
            {
                //Putting Player Data
                player.username = data.userName;
                player.role = "friend";
                player.deviceId = data.deviceId;
                player.socketId = socket.id;
                
                //console.log("joinGame youcantjoin else: ", youcantjoin);
                let inputJson = {
                    lobby_id: myCode,
                    userName: data.userName,
                    role: "friend",
                    deviceId: data.deviceId,
                    socket: socket.id
                };

                console.log("TEAMS: ", server.teams[myCode]);

                var matchedCategories = server.teams[myCode].filter(i => i.socket == inputJson.socket);

                if (matchedCategories.length > 0) {
                    ack({ status: true, message: "You are already in team", team: server.teams[myCode] })
                } else {
                    server.teams[myCode].push(inputJson)
                    server.onSwtichLobby(connection,myCode);

                    ack({ status: true, message: "Found team", team: server.teams[myCode] })

                    console.log("playerJoinedRoom AA: ", { status: true, team: server.teams[myCode] });

                // teams[myCode].forEach(item => {
                //     socket.to(item.socket).emit("playerJoinedRoom", { status: true, team: teams[myCode] })
                //      console.log("playerJoinedRoom Call:",youcantjoin);
                // });
                    socket.emit("playerJoinedRoom", { status: true, team: server.teams[myCode] });
                    socket.broadcast.to(myCode).emit("playerJoinedRoom", { status: true, team: server.teams[myCode] });

                }
            }
        } 
        else 
        {
            ack({ status: false, message: "Not found any team with this code" })
        }
    });

    socket.on("AttackingPlaneReach",function(data)
    {
        if(data.plane_id in server.lobbys[player.lobby_id].AttackingPlanes)
        {   
        
        delete server.lobbys[player.lobby_id].AttackingPlanes[data.plane_id];
        let element = server.lobbys[player.lobby_id].Icelands[data.icelandindex];
        element.isFree  = ((data.isFree=="True") ? true : false);
        element.isStatic =((data.isStatic=="True")?true : false);
        element.TeamCode = data.teamCode;
        element.Color = data.color;
        element.PlayerType = data.playerType;
        element.TotalPlane = data.totalPlane;

        
        //console.log("-data.plane_id-=-=-=-=>"+data.isFree);
        server.lobbys[player.lobby_id].senddata();
            socket.emit("Checkwin");
            socket.broadcast.to(player.lobby_id).emit("Checkwin");
        }

    });
    

    socket.on("startGame" ,function (data) {
        console.log("On Button Click startGame: ♦");

//////////////////////////////
                    var index = random(10,20) 

                    console.log("index  ♦" ,index);

                     //var Rand;
                     //var LastRand = new Array();
                    var Max = index;
                    var numbers = new Array();
                    
                     //LastRand = [Max];
        
                    var numbers1 = [];
                     //var numbers2 = new Array();
                    
                    
                    for (let i = 0; i <= 20; i++) {
                        numbers1[i] =i;
                    } 
                    //console.log(numbers1);  



                    for (let i = 0; i < Max; i++) {
                        var temp = numbers1[random(0,numbers1.length)];

                        numbers.push(temp);
                        server.lobbys[player.lobby_id].Icelands[temp]= new iceland(temp);
                        
                        let index = numbers1.indexOf(temp);
                        if(index>-1)
                        {
                            numbers1.splice(index,1);
                        }  
                    }
                     //console.log(numbers);
                    // for (var i = 1; i < Max; i++)
                    //     {
                    //         Rand = random(0, 20);
        
                    //         for (var j = 1; j < LastRand.length; j++)
                    //         {
                    //             while (Rand == LastRand[j])
                    //             {
                    //                 Rand = random(0, 20);
                    //             }
                    //         }
        
                    //         LastRand[i] = Rand;
                    //         numbers.push(Rand);
                    //         server.lobbys[player.lobby_id].Icelands[Rand]= new iceland(Rand);    
                    //     }
                    //         console.log(numbers);

                        
                    
            
                    console.log("numbers 0 1 2: ♦" ,numbers);

                    var plane = new Array(index-1);

                    // for (var i = 0; i < plane.length; i++) {
                    //     plane[i] = random(10, 20)
                    //         }
                    let count = 0;
                    server.lobbys[player.lobby_id].Icelands.forEach(element => 
                    {
                        plane[count] = random(10, 20);
                        element.TotalPlane=parseInt(plane[count],10);
                        numbers[count]=element.IcelandIndex
                        count++;
                        console.log(element.IcelandIndex+"-=-=-=-=>"+element.TotalPlane);
                    });
                        
                    console.log("number 0 1 2" , numbers);
                    console.log("plane 0 1 2: ♦" ,plane);
                    
            
                        var dataplayerfour;
                        var dataplayerfour;
                        var dataplayerfour;
                        var dataplayerfour;

                console.log("♦ thisismycode ♦" ,player.lobby_id);
                console.log("♦ teams[myCode].length ♦" ,server.teams[player.lobby_id].length);

            
                //console.log("♦ _id" ,teams[myCode][1].deviceId);
                
                var AllPlayerData = [];

                let myColor;
                var numbertemp = new Array();
                for (let i = 0; i < numbers.length; i++) {
                    numbertemp.push(numbers[i]);

                }
                console.log(numbertemp);    
                for (var q = 0; q < server.lobbys[player.lobby_id].Connection.length; q++) {
                        
                        if (q == 0 ) 
                        {
                            var land = numbertemp[random(0,numbertemp.length)];
                            let index = numbertemp.indexOf(land);
                            console.log("index=-=-=-=-=>"+index);
                            if(index>-1)
                            {
                                numbertemp.splice(index,1);
                            }
                            var Playerplane = parseInt(random(20,30),10);
                            myColor = "red"

                            server.lobbys[player.lobby_id].Icelands[land].PlayerCode ="playername";
                            server.lobbys[player.lobby_id].Icelands[land].isFree = false;
                            server.lobbys[player.lobby_id].Icelands[land].isStatic = false;
                            server.lobbys[player.lobby_id].Icelands[land].TeamCode = q+1;
                            server.lobbys[player.lobby_id].Icelands[land].PlayerType = "human";
                            server.lobbys[player.lobby_id].Icelands[land].Color = myColor;
                            server.lobbys[player.lobby_id].Icelands[land].TotalPlane = Playerplane;
                            
                            console.log("♦ _id" ,server.lobbys[player.lobby_id].Connection[0].player.player_id);
                            var dataplayerone = {
                                "playerindex" : land,
                                "Playerplane": Playerplane,
                                "playerCode" : "playername",
                                "teamCode" : q+1,
                                "teamColor" : myColor,
                                "_id":  server.lobbys[player.lobby_id].Connection[0].player.player_id,
                                };
                                AllPlayerData.push(dataplayerone);

                                let LoadLobbystate  = new LobbyState();
                                LoadLobbystate.playerid = server.lobbys[player.lobby_id].Connection[0].player.player_id;
                                LoadLobbystate.teamCode = q+1;
                                LoadLobbystate.color = myColor;
                                LoadLobbystate.state = "INGAME";

                                server.lobbys[player.lobby_id].LobbyState[q]=LoadLobbystate;
                                console.log("player data about -=-=>"+LoadLobbystate.playerid);
                        }
                        if (q == 1) 
                        {
                            var land = numbertemp[random(0,numbertemp.length)];
                            let index = numbertemp.indexOf(land);
                            console.log("index=-=-=-=-=>"+index);
                            if(index>-1)
                            {
                                numbertemp.splice(index,1);
                            }

                            var Playerplane = parseInt(random(20,30),10);
                            myColor = "yellow"

                            server.lobbys[player.lobby_id].Icelands[land].PlayerCode ="playername";
                            server.lobbys[player.lobby_id].Icelands[land].isFree = false;
                            server.lobbys[player.lobby_id].Icelands[land].isStatic = false;
                            server.lobbys[player.lobby_id].Icelands[land].TeamCode = q+1;
                            server.lobbys[player.lobby_id].Icelands[land].PlayerType = "human";
                            server.lobbys[player.lobby_id].Icelands[land].Color = myColor;
                            server.lobbys[player.lobby_id].Icelands[land].TotalPlane = Playerplane;
                            console.log("♦ _id" ,server.lobbys[player.lobby_id].Connection[1].player.player_id);
                            var dataplayertwo = {
                                "playerindex" : land,
                                "Playerplane": Playerplane,
                                "playerCode" : "playername",
                                "teamCode" : q+1,
                                "teamColor" : myColor,
                                "_id": server.lobbys[player.lobby_id].Connection[1].player.player_id,
                                };
                                AllPlayerData.push(dataplayertwo);

                                let LoadLobbystate  = new LobbyState();
                                LoadLobbystate.playerid = server.lobbys[player.lobby_id].Connection[1].player.player_id;
                                LoadLobbystate.teamCode = q+1;
                                LoadLobbystate.color = myColor;
                                LoadLobbystate.state = "INGAME";

                                server.lobbys[player.lobby_id].LobbyState[q]=LoadLobbystate;
                                console.log("player data about -=-=>"+LoadLobbystate.playerid);
                        }
                        if (q == 2 ) 
                        {
                            var land = numbertemp[random(0,numbertemp.length)];
                            let index = numbertemp.indexOf(land);
                            console.log("index=-=-=-=-=>"+index);
                            if(index>-1)
                            {
                                numbertemp.splice(index,1);
                            }
                            var Playerplane = parseInt(random(20,30),10);
                            
                            myColor = "green"
                            
                            server.lobbys[player.lobby_id].Icelands[land].PlayerCode ="playername";
                            server.lobbys[player.lobby_id].Icelands[land].isFree = false;
                            server.lobbys[player.lobby_id].Icelands[land].isStatic = false;
                            server.lobbys[player.lobby_id].Icelands[land].TeamCode = q+1;
                            server.lobbys[player.lobby_id].Icelands[land].PlayerType = "human";
                            server.lobbys[player.lobby_id].Icelands[land].Color = myColor;
                            server.lobbys[player.lobby_id].Icelands[land].TotalPlane = Playerplane;

                            console.log("♦ _id" ,server.lobbys[player.lobby_id].Connection[2].player.player_id);
                            var dataplayerthree = {
                                "playerindex" : land,
                                "Playerplane": Playerplane,
                                "playerCode" : "playername",
                                "teamCode" : q+1,
                                "teamColor" : myColor,
                                "_id": server.lobbys[player.lobby_id].Connection[2].player.player_id,
                                };
                                AllPlayerData.push(dataplayerthree);

                                let LoadLobbystate  = new LobbyState();
                                LoadLobbystate.playerid = server.lobbys[player.lobby_id].Connection[2].player.player_id;
                                LoadLobbystate.teamCode = q+1;
                                LoadLobbystate.color = myColor;
                                LoadLobbystate.state = "INGAME";

                                server.lobbys[player.lobby_id].LobbyState[q]=LoadLobbystate;
                                console.log("player data about -=-=>"+LoadLobbystate.playerid);
                        }
                        if (q == 3) 
                        {
                            var land = numbertemp[random(0,numbertemp.length)];
                            let index = numbertemp.indexOf(land);
                            console.log("index=-=-=-=-=>"+index);
                            if(index>-1)
                            {
                                numbertemp.splice(index,1);
                            }

                            var Playerplane = parseInt(random(20,30),10);
                            myColor = "blue"

                            server.lobbys[player.lobby_id].Icelands[land].PlayerCode ="playername";
                            server.lobbys[player.lobby_id].Icelands[land].isFree = false;
                            server.lobbys[player.lobby_id].Icelands[land].isStatic = false;
                            server.lobbys[player.lobby_id].Icelands[land].TeamCode = q+1;
                            server.lobbys[player.lobby_id].Icelands[land].PlayerType = "human";
                            server.lobbys[player.lobby_id].Icelands[land].Color = myColor;
                            server.lobbys[player.lobby_id].Icelands[land].TotalPlane = Playerplane;
                        
                            console.log("♦ _id" ,server.lobbys[player.lobby_id].Connection[3].player.player_id4DA9IG4);
                            var dataplayerfour = {
                                "playerindex" : land,
                                "Playerplane": Playerplane,
                                "playerCode" : "playername",
                                "teamCode" : q+1,
                                "teamColor" : myColor,
                                "_id": server.lobbys[player.lobby_id].Connection[3].player.player_id,
                                };
                                AllPlayerData.push(dataplayerfour);

                                let LoadLobbystate  = new LobbyState();
                                LoadLobbystate.playerid = server.lobbys[player.lobby_id].Connection[3].player.player_id;
                                LoadLobbystate.teamCode = q+1;
                                LoadLobbystate.color = myColor;
                                LoadLobbystate.state = "INGAME";

                                server.lobbys[player.lobby_id].LobbyState[q]=LoadLobbystate;
                                console.log("player data about -=-=>"+LoadLobbystate.playerid);
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
                                
                                server.lobbys[player.lobby_id].LobbyState.forEach(element =>
                                    {
                                        console.log("data"+element.color);
                                    })
                                
                                    console.log("player whole data in the list lenght"+server.lobbys[player.lobby_id].LobbyState.length);
                            

                            // socket.to(teams[myCode].socket).emit("startGame", data)
                            //i++;
                            // resp(i);
                            
                            //io.to('adminRoom').emit("startGame", data1);
                            socket.emit("startGame", data1);
                            socket.broadcast.to(player.lobby_id).emit("startGame", data1);

                            setTimeout(function()
                            {
                                console.log("setTimeout startTimer ♦" );
                                socket.emit("startTimer");
                                socket.broadcast.to(player.lobby_id).emit("startTimer");
                                server.lobbys[player.lobby_id].updateIcelands = true;

                            },5000);
                            server.lobbys[player.lobby_id].Started_Game = true;
                            //myCode ="";
                            console.log("myCode ♦" ,player.lobby_id);
                            console.log("Icelands",server.lobbys[player.lobby_id].Icelands);
                           // youcantjoin = false;
//////////////////////////////
    });

    socket.on("Emoji",function(data)
    {
        console.log("Emoji ♣♦♠♥" ,data);
        socket.emit('Emoji',data);
        socket.broadcast.to(player.lobby_id).emit('Emoji',data);
    });

    socket.on("MyLimit",function(data)
    {
        console.log("MyLimit"+data.Mylimit.length);
        let count =0;
        server.lobbys[player.lobby_id].Icelands.forEach(element => {
            element.MyLimit= parseInt( data.Mylimit[count]);
            count++;
        });
        console.log("AddMylimitIcelands",server.lobbys[player.lobby_id].Icelands);
    });

    socket.on("Attack",function(data)
    {
        console.log("Attack ♣♦♠♥" ,Math.round( Number((data.totalPlane))/2));
        let attackingplane = new AttackingPlane()
        attackingplane.selectedIceLand = data.selectedIceLand;
        attackingplane.iceLandIndex = data.iceLandIndex;
        attackingplane.TotalPlane = data.totalPlane;
        
        var data1 = 
        {
        "plane_id":attackingplane.plane_id,
        "selectedIceLand":attackingplane.selectedIceLand,
        "iceLandIndex":attackingplane.iceLandIndex,
        "totalPlane":attackingplane.TotalPlane,
        "isAttackModeOn":data.isAttackModeOn
        }
        
        server.lobbys[player.lobby_id].AttackingPlanes[attackingplane.plane_id] = attackingplane;
        console.log(Object.keys(server.lobbys[player.lobby_id].AttackingPlanes));

        socket.emit('Attack',data1);
        socket.broadcast.to(player.lobby_id).emit('Attack',data1);
        console.log("after"+server.lobbys[player.lobby_id].Icelands[data.selectedIceLand].TotalPlane)
        server.lobbys[player.lobby_id].Icelands[data.selectedIceLand].TotalPlane = Math.round( Number((data.totalPlane))/2);
        console.log("bofer"+server.lobbys[player.lobby_id].Icelands[data.selectedIceLand].TotalPlane);
        server.lobbys[player.lobby_id].senddata();

        //server.teams[myCode];
    });

    socket.on("disconnect",function()
    {
        
        console.log("player-=-=-=disconnect->"+player.player_id);
        let lobbyid = player.lobby_id;
        server.lobbys[player.lobby_id].onLeaveLobby(connection);
        let id = player.id;
        delete server.connections[id];
        server.onCheckConnection(lobbyid);
        
    });

    socket.on("exitlobby",function(data)
    {
        let id = player.lobby_id;
        console.log(data.playerid+"player-=-=-=->"+server.lobbys[player.lobby_id].Connection.length);
        server.onSwtichLobby(connection,"0");
        //server.lobbys[player.lobby_id].onLeaveLobby(connection);    
        server.onCheckConnection(id);
       // console.log(data.playerid+"player-=-=-=->"+server.lobbys[player.lobby_id].Connection.length);
    });

    socket.on("adminDidLeft", function (data, ack) {
        console.log("adminDidLeft: ", data);
        if (data.code != undefined && data.code != '') {
            let getAllUsers = server.teams[data.code]

           // socket.emit("leftGame", { message: "Admin has left/ the game. Please try to create/join new game." });
            socket.broadcast.to(player.lobby_id).emit("leftGame", { message: "Admin has left/ the game. Please try to create/join new game." });
            let id = player.lobby_id;
            server.lobbys[id].Connection.forEach(element => {
                server.onSwtichLobby(element,"0");
            });
            // if (getAllUsers != undefined) {
            //     getAllUsers.forEach(item => {
            //         socket.to(item.socket).emit("leftGame", { message: "Admin has left/ the game. Please try to create/join new game." })
            //         //item.socket.emit("leftGame", { message: "Admin has left the game. Please try to create/join new game." })
            //     });
            // }
            delete server.lobbys[id];
            delete server.teams[data.code];

            console.log("removeData: ", server.teams)
            ack({ message: "Sent code", status: true })
        } else {
            ack({ message: "Please send code", status: false })
        }
    });

    socket.on("playerleft",function(data)
    {
        // let data1 = 
        // {
        //     player_id = player.id
        // } 
        
        let id = player.lobby_id;
        console.log(data.playerid+"player-=-=-=->"+server.lobbys[player.lobby_id].Connection.length);
        server.lobbys[player.lobby_id].playerleftgame(player.player_id)
        // let data1 =
        // {
        //     playerdata : server.lobbys[player.lobby_id].LobbyState
        // }
        //socket.broadcast.emit("playerleft",data1);
        server.onSwtichLobby(connection,"0");
        //server.lobbys[player.lobby_id].onLeaveLobby(connection);    
        server.onCheckConnection(id);
    });
    
    socket.on("Getplanedata",function(data)
    {
        var clientisinlobby = false;
        console.log("player id to getplanedata   "+data.lobby_id);
        //if(server.lobbys[data.lobby_id].Connection!=undefined)
        //{    
        server.lobbys[data.lobby_id].Connection.forEach
        (element => {
            if(element.player.plane_id == data.playerid)
            {
                clientisinlobby = true;
            }   
        });

        if(clientisinlobby)
        {
            server.onSwtichLobby(connection,data.lobby_id);
        }
        
        socket.broadcast.to(player.lobby_id).emit("Getplanedata",data);
       // }
    });

    socket.on("Updatedataplane",function(data)
    {
        console.log("playerdata-=-=-=-=-=>"+data.playerid);
        let NewPlanedata1 = [];
        for (let i = 0; i < data.pos.length; i++) 
        {
            console.log(data.pos[i].id);
            if(data.pos[i].id !=undefined)
            {
            let data1 = 
            {
                "plane_id":data.pos[i].id,
                "X":data.pos[i].X,
                "Y":data.pos[i].Y,
                "Z":data.pos[i].Z,
                "selectedIceLand":server.lobbys[player.lobby_id].AttackingPlanes[data.pos[i].id].selectedIceLand,
                "iceLandIndex":server.lobbys[player.lobby_id].AttackingPlanes[data.pos[i].id].iceLandIndex,
                "TotalPlane":server.lobbys[player.lobby_id].AttackingPlanes[data.pos[i].id].TotalPlane
            }
            NewPlanedata1.push(data1);  
        }
        }

        let DATA =
        {
            "newLobbystate" : server.lobbys[player.lobby_id].LobbyState,
            "NewPlanedata1":NewPlanedata1
        }
       // server.lobbys[player.lobby_id].Connection[data.playerid].socket.emit("Updateplanedata",DATA);
        console.log("NumberofConnection"+NewPlanedata1+server.lobbys[player.lobby_id].Connection.length);
        for (let i = 0; i < server.lobbys[player.lobby_id].Connection.length; i++) {
            
            var element = server.lobbys[player.lobby_id].Connection[i];
            console.log(element.player.player_id+"-=-=-=-=-=-=>"+data.playerid);
            if(element.player.player_id == data.playerid)
            {
                
                console.log("-=-=-=-=-=-playerdata=-=-=-=-=>"+NewPlanedata1);
                element.socket.emit("Updateplanedata",DATA);

                break;
            }
            
        }
    });
    
        
    }

}
function randomCode(len, arr) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

function random(low, high)
{
    return Math.floor(Math.random() * (high - low) + low);
}

let Connection = require("./Connection");
let Player = require("./Player");

//Lobby
let GameLobby = require("./GameLobby");

module.exports = class Server
{
    constructor()
    {
        this.connections = [];
        this.lobbys = [];
        this.lobbys["0"]=new GameLobby("0");
        this.generatedCodes = [];
        this.teams = [];
    }

    onUpdate()
    {
        let server = this;
        //console.log("-=-=-=-Server-=-=-=>");
        //Update each lobby 
        for(let id in server.lobbys)
        {
            //console.log("-=-=-=-Server-=-=-=>"+server.lobbys[id].constructor.name+" "+server.lobbys.length);
            server.lobbys[id].onUpdate();
        }
    }
    
    onConnection(socket)
    {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

       // console.log("-=-=-=-=->"+player.lobby_id);
        socket.join(player.lobby_id);
        console.log("player" + player.displayPlayerInformation());
        server.connections[player.id] = connection;
        connection.lobby = lobbys[player.lobby_id]
        //console.log("-=-=-=console=-=->"+connection.lobby);
        connection.lobby.onEnterLobby(connection)

        return connection;
    }
    Create_Lobby(id = String)
    {
        let server =this;
        let gamelobby = new GameLobby(id);
       // console.log("-=-=-=-gamelobby.settings.maxPlayers=->"+gamelobby.settings.maxPlayers);
        server.lobbys[id] =gamelobby;
        //server.lobbys.push(gamelobby);
    }
    Remove_lobby(id =String)
    {
        let server =this;
        
    }
    onSwtichLobby(connection = Connection , lobbyId)    
    {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyId);//Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyId];//assign reference to the new lobby

        lobbys[connection.player.lobby_id].onLeaveLobby(connection);//Perfrom Lobby clean up
       // console.log(lobbys[lobbyId]);

        lobbys[lobbyId].onEnterLobby(connection);//Entry point to the new lobby 
        console.log(lobbys[lobbyId].Connection.length);
        console.log("-=-lobby swtich=-=-=>"+lobbyId+"-=-=-=->"+lobbys.length);
    }
    onCheckConnection(lobbyId)
    {
        console.log("server.lobbys[lobbyId]"+this.lobbys[lobbyId].Connection.length);
        if(this.lobbys[lobbyId].Connection.length == 0 && lobbyId !="0")
        {
        delete this.lobbys[lobbyId];
        console.log("lobby delete"+lobbyId);
        }
    }

    
    
}

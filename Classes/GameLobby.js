let Connection = require("./Connection");
let LobbyState = require("./LobbyState");
module.exports = class GameLobby
{
    constructor(id)
    {
        this.id = id;
        this.Connection =[];
        this.Started_Game = false;
        this.Icelands = [];
        this.AttackingPlanes = [];
        this.updateIcelands = false;
        this.LobbyState = [];

    }
    onUpdate()
    {
        
        let gamelobby = this;
        //console.log("Update data"+gamelobby.updateIcelands);
       // console.log("Update data"+gamelobby.updateIcelands);
        if(gamelobby.updateIcelands)
        {
            gamelobby.updateIcelands = false;
            setTimeout(()=>
            {
                this.senddata();
                gamelobby.updateIcelands = true;

            },1000);
        }
    }
    
    senddata()
    {
        
        let lobby = this;
       // gamelobby.updateIcelands = true;
            //console.log("Update data"+this.id+this.updateIcelands);
           // let NewPlanedata  = new Array();
            let NewPlanedata1 = [];
        this.Icelands.forEach(element => {
            
            //console.log(element.IcelandIndex +" "+element.MyLimit+" "+element.TotalPlane);
            if(!element.isStatic && (element.MyLimit)>element.TotalPlane)
            {
                element.TotalPlane ++;
             //   console.log(element.IcelandIndex+"-=-=-=-=-=>"+element.TotalPlane);
                
            }
            let data = 
            {
                "isFree":element.isFree,
                "isStatic":element.isStatic,
                "TeamCode":element.TeamCode,
                "Color":element.Color,
                "PlayerType":element.PlayerType,
                "totalPlane":element.TotalPlane,
            }
            NewPlanedata1.push(data);
           // NewPlanedata.push(element.TotalPlane);
            
        });
        var data=
        {
            "Newplanedata1":NewPlanedata1,      
        }
        for (let i = 0; i < this.Connection.length; i++) {
            this.Connection[i].socket.emit("updateiceland" , data);
            
        }
        console.log(data);

    }


    onEnterLobby(connection = Connection)
    {
        let lobby = this;
        let player = connection.player;

        //console.log("connection-=-=>"+connection.player);
        console.log("Player" + player.displayPlayerInformation());
        lobby.Connection.push(connection);

        player.lobby_id = lobby.id;
        connection.lobby = lobby;
        
    }

    onLeaveLobby(connection = Connection)   
    {
        let lobby = this;
        let player = connection.player;

        
        connection.lobby = undefined;
        connection.player.lobby = undefined;

        let index = lobby.Connection.indexOf(connection);
        if(index>-1)
        {
            lobby.Connection.splice(index,1);
        }
        console.log("Player to Lobby"+lobby.Connection.length);
    }

    playerleftgame(id = String)
    {
        let lobby = this;
        lobby.LobbyState.forEach(element =>
            {
                if(element.playerid == id)
                {
                    console.log("-=-=Find the player-=-=->"+element.playerid);
                    element.state="LG";
                }
            });

            let data = {
                "newLobbystate" : lobby.LobbyState
            }
            for (let i = 0; i < this.Connection.length; i++) {
                if(this.Connection[i].player.player_id != id)
                this.Connection[i].socket.emit("playerleft" , data);
            }
            
    }
}
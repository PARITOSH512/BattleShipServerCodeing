let shortid = require("shortid");
module.exports = class Player
{
    constructor()
    {
        this.username = "Default_Player";
        this.role = "singleplayer";
        this.deviceId="null";
        this.socketId = "null";
        this.player_id = shortid.generate()
        this.lobby_id = "0"; //lobby id default lobby

    }

    displayPlayerInformation()
  {
    let player = this
    return "("+player.username+" : "+ player.lobby_id + ")"; 
  }

}
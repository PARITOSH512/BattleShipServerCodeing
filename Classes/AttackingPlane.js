let shortid = require('shortid');
let vector = require("./Vector");
module.exports = class AttackingPlane
{
    constructor()
    {
        this.plane_id = shortid.generate();
        this.selectedIceLand = new Number(0);
        this.iceLandIndex = new Number(0);
        this.TotalPlane = new Number(0);
        this.vector = new vector();
    }
}
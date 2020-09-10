module.exports = class Vector
 {
    constructor(X = 0, Y = 0, Z = 0) {
      this.x = X;
      this.y = Y;
      this.z = Z;
    }
  
    Magnitude() {
      // this magnitude will take the "0" as origin
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
  
    Normalized() {
      var Mag = this.Magnitude();
      return new Vector2(this.x / Mag, this.y / Mag, this.z / mag);
    }
  
    Distance(othervect = Vector2) {
      var direction = new Vector2();
      direction.x = othervect.x - this.x;
      direction.y = othervect.y - this.y;
      direction.z = othervect.z - this.z;
      return direction.Magnitude();
    }
  
    ConsoleOutput() {
      return "(" + this.x + "," + this.y + "," + this.z + ")";
    }
  };
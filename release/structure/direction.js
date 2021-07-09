export var Direction;
(function(Direction2) {
  Direction2[Direction2["north"] = 0] = "north";
  Direction2[Direction2["north_west"] = 1] = "north_west";
  Direction2[Direction2["west"] = 2] = "west";
  Direction2[Direction2["west_south"] = 3] = "west_south";
  Direction2[Direction2["south"] = 4] = "south";
  Direction2[Direction2["south_east"] = 5] = "south_east";
  Direction2[Direction2["east"] = 6] = "east";
  Direction2[Direction2["east_north"] = 7] = "east_north";
  Direction2[Direction2["concave"] = 35] = "concave";
  Direction2[Direction2["convex"] = 17] = "convex";
})(Direction || (Direction = {}));
export class DirectionChecker {
  static check(pos1, pos2) {
    const reg = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    const ang = reg * (180 / Math.PI);
    if (ang > 90) {
      return 3;
    } else if (ang >= 0) {
      return 5;
    } else if (ang >= -90) {
      return 7;
    } else {
      return 1;
    }
  }
}

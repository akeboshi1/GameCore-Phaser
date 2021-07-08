export var Direction;
(function (Direction) {
    Direction[Direction["north"] = 0] = "north";
    Direction[Direction["north_west"] = 1] = "north_west";
    Direction[Direction["west"] = 2] = "west";
    Direction[Direction["west_south"] = 3] = "west_south";
    Direction[Direction["south"] = 4] = "south";
    Direction[Direction["south_east"] = 5] = "south_east";
    Direction[Direction["east"] = 6] = "east";
    Direction[Direction["east_north"] = 7] = "east_north";
    Direction[Direction["concave"] = 35] = "concave";
    Direction[Direction["convex"] = 17] = "convex"; // 凸角
})(Direction || (Direction = {}));
var DirectionChecker = /** @class */ (function () {
    function DirectionChecker() {
    }
    // dir from pos1 to pos2
    DirectionChecker.check = function (pos1, pos2) {
        var reg = Math.atan2((pos2.y - pos1.y), (pos2.x - pos1.x));
        var ang = reg * (180 / Math.PI);
        // 重叠
        if (ang > 90) {
            return 3;
        }
        else if (ang >= 0) {
            return 5;
        }
        else if (ang >= -90) {
            return 7;
        }
        else {
            return 1;
        }
    };
    return DirectionChecker;
}());
export { DirectionChecker };
//# sourceMappingURL=direction.js.map
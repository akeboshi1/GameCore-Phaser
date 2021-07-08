var Intersects = /** @class */ (function () {
    function Intersects() {
    }
    Intersects.RectangleToRectangle = function (rectA, rectB) {
        if (rectA.width <= 0 || rectA.height <= 0 || rectB.width <= 0 || rectB.height <= 0) {
            return false;
        }
        return !(rectA.right < rectB.x || rectA.bottom < rectB.y || rectA.x > rectB.right || rectA.y > rectB.bottom);
    };
    return Intersects;
}());
export { Intersects };
//# sourceMappingURL=intersects.js.map
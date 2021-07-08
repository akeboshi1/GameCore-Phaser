var Algorithm = /** @class */ (function () {
    function Algorithm() {
    }
    Algorithm.median = function (arr) {
        var op_arr = arr.sort(function (x, y) {
            return y - x;
        });
        var med = Math.floor(op_arr.length / 2);
        if (op_arr.length % 2 === 0) {
            var h = op_arr[med - 1], l = op_arr[med];
            return (h + l) / 2;
        }
        return op_arr[med];
    };
    return Algorithm;
}());
export { Algorithm };
//# sourceMappingURL=algorithm.js.map
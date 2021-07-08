var LogicRectangle = /** @class */ (function () {
    function LogicRectangle(x, y, width, height) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        if (x === undefined) {
            x = 0;
        }
        if (y === undefined) {
            y = 0;
        }
        if (width === undefined) {
            width = 0;
        }
        if (height === undefined) {
            height = 0;
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(LogicRectangle.prototype, "left", {
        get: function () {
            return this.x;
        },
        set: function (value) {
            if (value >= this.right) {
                this.width = 0;
            }
            else {
                this.width = this.right - value;
            }
            this.x = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogicRectangle.prototype, "right", {
        get: function () {
            return this.x + this.width;
        },
        set: function (value) {
            if (value <= this.x) {
                this.width = 0;
            }
            else {
                this.width = value - this.x;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogicRectangle.prototype, "top", {
        get: function () {
            return this.y;
        },
        set: function (value) {
            if (value >= this.bottom) {
                this.height = 0;
            }
            else {
                this.height = (this.bottom - value);
            }
            this.y = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogicRectangle.prototype, "bottom", {
        get: function () {
            return this.y + this.height;
        },
        set: function (value) {
            if (value <= this.y) {
                this.height = 0;
            }
            else {
                this.height = value - this.y;
            }
        },
        enumerable: true,
        configurable: true
    });
    LogicRectangle.prototype.contains = function (x, y) {
        if (this.width <= 0 || this.height <= 0) {
            return false;
        }
        return (this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y);
    };
    return LogicRectangle;
}());
export { LogicRectangle };
//# sourceMappingURL=logic.rectangle.js.map
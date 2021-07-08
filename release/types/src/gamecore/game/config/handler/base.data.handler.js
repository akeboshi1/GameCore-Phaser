var BaseDataHandler = /** @class */ (function () {
    function BaseDataHandler(game, event) {
        this.game = game;
        this.mEvent = event;
    }
    BaseDataHandler.prototype.clear = function () {
        this.mEvent.offAllCaller(this);
    };
    BaseDataHandler.prototype.destroy = function () {
        this.clear();
        this.game = undefined;
        this.mEvent = undefined;
    };
    BaseDataHandler.prototype.on = function (event, fn, context) {
        this.mEvent.on(event, context, fn);
    };
    BaseDataHandler.prototype.off = function (event, fn, context) {
        this.mEvent.off(event, context, fn);
    };
    BaseDataHandler.prototype.emit = function (event, data) {
        this.mEvent.emit(event, data);
    };
    Object.defineProperty(BaseDataHandler.prototype, "Event", {
        get: function () {
            return this.mEvent;
        },
        enumerable: true,
        configurable: true
    });
    return BaseDataHandler;
}());
export { BaseDataHandler };
//# sourceMappingURL=base.data.handler.js.map
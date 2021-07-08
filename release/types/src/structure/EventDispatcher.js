var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Handler } from "./Handler";
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.hasListener = function (type) {
        var listener = this._events && this._events[type];
        return !!listener;
    };
    EventDispatcher.prototype.emit = function (type) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (!this._events || !this._events[type])
            return false;
        var listeners = this._events[type];
        if (listeners.run) {
            if (listeners.once)
                delete this._events[type];
            data != null ? listeners.runWith(data) : listeners.run();
        }
        else {
            for (var i = 0, n = listeners.length; i < n; i++) {
                var listener = listeners[i];
                if (listener) {
                    (data != null) ? listener.runWith(data) : listener.run();
                }
                if (!listener || listener.once) {
                    listeners.splice(i, 1);
                    i--;
                    n--;
                }
            }
            if (listeners.length === 0 && this._events)
                delete this._events[type];
        }
        return true;
    };
    EventDispatcher.prototype.on = function (type, listener, caller, args) {
        if (args === void 0) { args = null; }
        return this._createListener(type, caller, listener, args, false);
    };
    EventDispatcher.prototype.once = function (type, listener, caller, args) {
        if (args === void 0) { args = null; }
        return this._createListener(type, caller, listener, args, true);
    };
    /**
     *
     */
    EventDispatcher.prototype.off = function (type, listener, caller, onceOnly) {
        if (onceOnly === void 0) { onceOnly = false; }
        if (!this._events || !this._events[type])
            return this;
        var listeners = this._events[type];
        if (listener != null) {
            if (listeners.run) {
                if ((!caller || listeners.caller === caller) && listeners.method === listener && (!onceOnly || listeners.once)) {
                    delete this._events[type];
                    listeners.recover();
                }
            }
            else {
                var count = 0;
                var len = listeners.length;
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var item = listeners[i];
                    if (!item) {
                        count++;
                        continue;
                    }
                    if (item && (!caller || item.caller === caller) && (listener == null || item.method === listener) && (!onceOnly || item.once)) {
                        count++;
                        listeners[i] = null;
                        item.recover();
                    }
                }
                if (count === len)
                    delete this._events[type];
            }
        }
        return this;
    };
    EventDispatcher.prototype.offAll = function (type) {
        if (type === void 0) { type = null; }
        var events = this._events;
        if (!events)
            return this;
        if (type) {
            this._recoverHandlers(events[type]);
            delete events[type];
        }
        else {
            for (var name_1 in events) {
                this._recoverHandlers(events[name_1]);
            }
            this._events = null;
        }
        return this;
    };
    EventDispatcher.prototype.offAllCaller = function (caller) {
        if (caller && this._events) {
            for (var name_2 in this._events) {
                this.off(name_2, caller, null);
            }
        }
        return this;
    };
    EventDispatcher.prototype.destroy = function () {
        this.offAll();
    };
    EventDispatcher.prototype._createListener = function (type, caller, listener, args, once, offBefore) {
        if (offBefore === void 0) { offBefore = true; }
        if (offBefore)
            this.off(type, caller, listener, once);
        var handler = EventHandler.create(caller || this, listener, args, once);
        if (!this._events)
            this._events = {};
        var events = this._events;
        if (!events[type])
            events[type] = handler;
        else {
            if (!events[type].run)
                events[type].push(handler);
            else
                events[type] = [events[type], handler];
        }
        return this;
    };
    EventDispatcher.prototype._recoverHandlers = function (arr) {
        if (!arr)
            return;
        if (arr.run) {
            arr.recover();
        }
        else {
            for (var i = arr.length - 1; i > -1; i--) {
                if (arr[i]) {
                    arr[i].recover();
                    arr[i] = null;
                }
            }
        }
    };
    return EventDispatcher;
}());
export { EventDispatcher };
var EventHandler = /** @class */ (function (_super) {
    __extends_1(EventHandler, _super);
    function EventHandler(caller, method, args, once) {
        return _super.call(this, caller, method, args, once) || this;
    }
    EventHandler.create = function (caller, method, args, once) {
        if (args === void 0) { args = null; }
        if (once === void 0) { once = true; }
        if (EventHandler._mpool.length)
            return EventHandler._mpool.pop().setTo(caller, method, args, once);
        return new EventHandler(caller, method, args, once);
    };
    EventHandler.prototype.recover = function () {
        if (this._id > 0) {
            this._id = 0;
            EventHandler._mpool.push(this.clear());
        }
    };
    EventHandler._mpool = [];
    return EventHandler;
}(Handler));
//# sourceMappingURL=EventDispatcher.js.map
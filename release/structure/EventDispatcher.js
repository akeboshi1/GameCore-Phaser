var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Handler } from "./Handler";
export class EventDispatcher {
  constructor() {
    __publicField(this, "_events");
  }
  hasListener(type) {
    const listener = this._events && this._events[type];
    return !!listener;
  }
  emit(type, ...data) {
    if (!this._events || !this._events[type])
      return false;
    const listeners = this._events[type];
    if (listeners.run) {
      if (listeners.once)
        delete this._events[type];
      data != null ? listeners.runWith(data) : listeners.run();
    } else {
      for (let i = 0, n = listeners.length; i < n; i++) {
        const listener = listeners[i];
        if (listener) {
          data != null ? listener.runWith(data) : listener.run();
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
  }
  on(type, listener, caller, args = null) {
    return this._createListener(type, caller, listener, args, false);
  }
  once(type, listener, caller, args = null) {
    return this._createListener(type, caller, listener, args, true);
  }
  off(type, listener, caller, onceOnly = false) {
    if (!this._events || !this._events[type])
      return this;
    const listeners = this._events[type];
    if (listener != null) {
      if (listeners.run) {
        if ((!caller || listeners.caller === caller) && listeners.method === listener && (!onceOnly || listeners.once)) {
          delete this._events[type];
          listeners.recover();
        }
      } else {
        let count = 0;
        const len = listeners.length;
        for (let i = 0, n = listeners.length; i < n; i++) {
          const item = listeners[i];
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
  }
  offAll(type = null) {
    const events = this._events;
    if (!events)
      return this;
    if (type) {
      this._recoverHandlers(events[type]);
      delete events[type];
    } else {
      for (const name in events) {
        this._recoverHandlers(events[name]);
      }
      this._events = null;
    }
    return this;
  }
  offAllCaller(caller) {
    if (caller && this._events) {
      for (const name in this._events) {
        this.off(name, caller, null);
      }
    }
    return this;
  }
  destroy() {
    this.offAll();
  }
  _createListener(type, caller, listener, args, once, offBefore = true) {
    if (offBefore)
      this.off(type, caller, listener, once);
    const handler = EventHandler.create(caller || this, listener, args, once);
    if (!this._events)
      this._events = {};
    const events = this._events;
    if (!events[type])
      events[type] = handler;
    else {
      if (!events[type].run)
        events[type].push(handler);
      else
        events[type] = [events[type], handler];
    }
    return this;
  }
  _recoverHandlers(arr) {
    if (!arr)
      return;
    if (arr.run) {
      arr.recover();
    } else {
      for (let i = arr.length - 1; i > -1; i--) {
        if (arr[i]) {
          arr[i].recover();
          arr[i] = null;
        }
      }
    }
  }
}
const _EventHandler = class extends Handler {
  static create(caller, method, args = null, once = true) {
    if (_EventHandler._mpool.length)
      return _EventHandler._mpool.pop().setTo(caller, method, args, once);
    return new _EventHandler(caller, method, args, once);
  }
  constructor(caller, method, args, once) {
    super(caller, method, args, once);
  }
  recover() {
    if (this._id > 0) {
      this._id = 0;
      _EventHandler._mpool.push(this.clear());
    }
  }
};
let EventHandler = _EventHandler;
__publicField(EventHandler, "_mpool", []);

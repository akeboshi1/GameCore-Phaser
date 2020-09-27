import { Handler } from "./Handler";
import { IDispose } from "../../rooms/action/IDispose";

export class HandlerDispatcher implements IDispose {

    private _events: object;

    public hasListener(type: string): Boolean {
        const listener = this._events && this._events[type];
        return !!listener;
    }

    public emitter(type: string, data: any = null): Boolean {
        if (!this._events || !this._events[type]) return false;

        const listeners: any = this._events[type];
        if (listeners.run) {
            if (listeners.once) delete this._events[type];
            data != null ? listeners.runWith(data) : listeners.run();
        } else {
            for (let i: number = 0, n: number = listeners.length; i < n; i++) {
                const listener: Handler = listeners[i];
                if (listener) {
                    (data != null) ? listener.runWith(data) : listener.run();
                }
                if (!listener || listener.once) {
                    listeners.splice(i, 1);
                    i--;
                    n--;
                }
            }
            if (listeners.length === 0 && this._events) delete this._events[type];
        }

        return true;
    }

    public on(type: string, caller: any, listener: Function, args: any[] = null): HandlerDispatcher {
        return this._createListener(type, caller, listener, args, false);
    }

    public once(type: string, caller: any, listener: Function, args: any[] = null): HandlerDispatcher {
        return this._createListener(type, caller, listener, args, true);
    }

    public off(type: string, caller: any, listener: Function, onceOnly: Boolean = false): HandlerDispatcher {
        if (!this._events || !this._events[type]) return this;

        const listeners: any = this._events[type];
        if (listener != null) {
            if (listeners.run) {
                if ((!caller || listeners.caller === caller) && listeners.method === listener && (!onceOnly || listeners.once)) {
                    delete this._events[type];
                    listeners.recover();
                }
            } else {
                let count: number = 0;
                const len = listeners.length;
                for (let i: number = 0, n: number = listeners.length; i < n; i++) {
                    const item: Handler = listeners[i];
                    if (item && (!caller || item.caller === caller) && item.method === listener && (!onceOnly || item.once)) {
                        count++;
                        listeners[i] = null;
                        item.recover();
                    }
                }
                if (count === len) delete this._events[type];
            }
        }

        return this;
    }

    public offAll(type: string = null): HandlerDispatcher {
        const events: any = this._events;
        if (!events) return this;
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

    public destroy() {
        this.offAll();
    }

    private _createListener(type: string, caller: any, listener: Function, args: any[], once: Boolean, offBefore: Boolean = true): HandlerDispatcher {
        if (offBefore)
            this.off(type, caller, listener, once);
        const handler: Handler = EventHandler.create(caller || this, listener, args, once);
        if (!this._events) this._events = {};

        const events: any = this._events;
        if (!events[type]) events[type] = handler;
        else {
            if (!events[type].run) events[type].push(handler);
            else events[type] = [events[type], handler];
        }
        return this;
    }

    private _recoverHandlers(arr: any): void {
        if (!arr) return;
        if (arr.run) {
            arr.recover();
        } else {
            for (let i: number = arr.length - 1; i > -1; i--) {
                if (arr[i]) {
                    arr[i].recover();
                    arr[i] = null;
                }
            }
        }
    }
}

class EventHandler extends Handler {
    public static create(caller: any, method: Function, args: any[] = null, once: Boolean = true): Handler {
        if (EventHandler._mpool.length) return EventHandler._mpool.pop().setTo(caller, method, args, once);
        return new EventHandler(caller, method, args, once);
    }
    private static _mpool: any[] = [];

    public constructor(caller: any, method: Function, args: any[], once: Boolean) {
        super(caller, method, args, once);
    }

    public recover(): void {
        if (this._id > 0) {
            this._id = 0;
            EventHandler._mpool.push(this.clear());
        }
    }
}

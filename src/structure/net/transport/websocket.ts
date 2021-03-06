import { EventEmitter } from "events";
import { Buffer } from "buffer/";

// @ts-ignore
const Socket: any = WebSocket || MozWebSocket;

export enum ReadyState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
}

export class WSWrapper extends EventEmitter {
    public secure = true;
    _host: string;
    _port: number;
    _connection: any = undefined;
    _readyState: ReadyState = ReadyState.CLOSED;
    _packets_q: Buffer[] = [];
    _writable = false;
    _sent_count: number = 0;
    _auto_reconnect = false;
    _force_close = false;

    constructor();
    constructor(host: string, port: number);
    constructor(host?: string, port?: number, autoReconnect?: boolean) {
        super();
        this._host = host || "localhost";
        this._port = port || 80;

        if (typeof autoReconnect !== "undefined")
            this._auto_reconnect = autoReconnect;
    }

    Open(): void;
    Open(host: string, port: number): void;
    Open(host?: string, port?: number): any {
        if (typeof host !== "undefined" && typeof port !== "undefined") {
            this._host = host;
            this._port = port;
        }
        this.doOpen();
    }

    public readyState(): number {
        return this._readyState;
    }

    public Close() {
        this.doClose();
    }
    public Send(packet: Buffer) {
        if (ReadyState.OPEN === this._readyState) {
            this._packets_q.push(packet);
            this.write();
        } else {
            this.emit(`error`, `Transport not open yet.`);
        }
    }

    // Frees all resources for garbage collection.
    public destroy(): void {
        this.onClose();
        // TODO
    }

    private addCallBacks() {

        this._connection.onopen = () => {
            this.onOpen();
        };

        this._connection.onclose = () => {
            this.onClose();
        };

        this._connection.onmessage = (ev: any) => {
            // console.info(`_connection.onmessage`);
            this.onData(ev.data);
        };

        this._connection.onerror = (e: Error) => {
            this.emit(`error`, e);
        };
    }

    private onOpen() {
        this._readyState = ReadyState.OPEN;
        this._writable = true;
        this.emit("open");
    }

    private onClose() {
        this._readyState = ReadyState.CLOSED;
        this._writable = false;
        this.emit("close");

        if (this._auto_reconnect && !this._force_close) {
            this.emit(`reopen`);
            this.doOpen();
        }
    }

    private onData(data: any) {
        this.emit("packet", data);
    }

    private doOpen() {
        /**
         * Get either the `WebSocket` or `MozWebSocket` globals
         * in the browser
         */
        if (typeof Socket === "undefined") {
            this.emit(`error`, `WebSocket is NOT support by this Browser.`);
            return;
        }

        const uri = this.uri();
        try {
            if (this._connection) {
                this._connection.close();
                this._connection = null;
            }
            this._connection = new Socket(uri);
            this._connection.binaryType = "arraybuffer";
            this.addCallBacks();
        } catch (e) {
            this.emit(`error`, e);
        }
    }

    private doClose() {
        if (typeof this._connection !== "undefined") {
            this._force_close = true;
            this._connection.close();
            this._readyState = ReadyState.CLOSING;
            this.emit(`closing`);
        }
    }

    private uri(): string {
        const schema = this.secure ? "wss" : "ws";
        let port = "";
        if (this._port && (("wss" === schema && Number(this._port) !== 443) ||
            ("ws" === schema && Number(this._port) !== 80))) {
            port = ":" + this._port;
        }
        return `${schema}://${this._host}${port}`;
    }

    private write() {
        if (this._packets_q.length > 0 && this._writable) {
            const packet = this._packets_q.shift();

            this._writable = false; // write lock!
            new Promise((resolve, reject) => {
                try {
                    this._connection.send(packet);
                    resolve(null);
                } catch (e) {
                    reject(e);
                }
            }).then(() => {
                // send ok
                this.emit(`sent`, [++this._sent_count, packet]);
                this._writable = true;
                this.write();
            }).catch((reason: any) => {
                this.emit(`error`, reason);
            });
        }
    }
}

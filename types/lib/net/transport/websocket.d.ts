/// <reference types="node" />
import { EventEmitter } from "events";
import { Buffer } from "buffer/";
export declare enum ReadyState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}
export declare class WSWrapper extends EventEmitter {
    secure: boolean;
    _host: string;
    _port: number;
    _connection: any;
    _readyState: ReadyState;
    _packets_q: Buffer[];
    _writable: boolean;
    _sent_count: number;
    _auto_reconnect: boolean;
    _force_close: boolean;
    constructor();
    constructor(host: string, port: number);
    Open(): void;
    Open(host: string, port: number): void;
    readyState(): number;
    Close(): void;
    Send(packet: Buffer): void;
    destroy(): void;
    private addCallBacks;
    private onOpen;
    private onClose;
    private onData;
    private doOpen;
    private doClose;
    private uri;
    private write;
}

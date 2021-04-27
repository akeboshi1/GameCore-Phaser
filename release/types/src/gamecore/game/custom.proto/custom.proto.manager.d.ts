import { PacketHandler } from "net-socket-packet";
import { Game } from "../game";
export declare class CustomProtoManager extends PacketHandler {
    private game;
    private emitter;
    constructor(game: Game);
    send(msgName: string, cmd?: string, msg?: any): void;
    on(type: string, listener: Function, caller: any, args?: any[]): void;
    once(type: string, listener: Function, caller: any, args?: any[]): void;
    off(type: string, listener: Function, caller: any, onceOnly?: Boolean): void;
    destroy(): void;
    private onCustomHandler;
    private get connection();
}

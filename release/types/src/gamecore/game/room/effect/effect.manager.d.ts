import { PacketHandler } from "net-socket-packet";
import { IRoomService } from "../room";
import { Effect } from "./effect";
export declare class EffectManager extends PacketHandler {
    private room;
    private mEffects;
    constructor(room: IRoomService);
    add(ownerID: number, id?: number): Effect;
    remove(ownerID: number): void;
    getByOwner(ownerID: number): Effect;
    getByID(id: number): Effect[];
    destroy(): void;
    protected updateDisplay(effect: Effect): void;
    protected fetchDisplay(ids: number[]): void;
    private onSyncSprite;
    get connection(): import("../..").Connection;
}

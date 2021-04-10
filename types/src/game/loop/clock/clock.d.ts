import { PacketHandler } from "net-socket-packet";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { MainPeer } from "../../main.peer";
export interface ClockReadyListener {
    onClockReady(): void;
}
export declare class Clock extends PacketHandler {
    private mClockSync;
    private mDeltaTimeToServer;
    protected get sysUnixTime(): number;
    get unixTime(): number;
    private mConn;
    private mIntervalId;
    private mListener;
    private mainPeer;
    constructor(con: ConnectionService, mainPeer: MainPeer, listener?: ClockReadyListener);
    sync(times?: number): void;
    clearTime(): void;
    destroy(): void;
    get clockSync(): boolean;
    protected _check(): void;
    private proof;
}

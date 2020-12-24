import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { Algorithm, Logger } from "utils";
import { MainPeer } from "../../main.peer";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
import IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME;

const LATENCY_SAMPLES = 7; // Latency Array length
const MIN_READY_SAMPLES = 2;
const CHECK_INTERVAL = 8000; // (ms)
const MAX_DELAY = 500; // (ms)

export interface ClockReadyListener {
    onClockReady(): void;
}

export class Clock extends PacketHandler {
    // clock是否同步完成
    private mClockSync: boolean = false;
    private mDeltaTimeToServer: number = 0;
    protected get sysUnixTime(): number {
        return new Date().getTime();
    }

    get unixTime(): number {
        return this.sysUnixTime + this.mDeltaTimeToServer;
    }

    private mConn: ConnectionService;
    private mIntervalId: any;
    private mListener: ClockReadyListener;
    private mainPeer: MainPeer;
    constructor(con: ConnectionService, mainPeer: MainPeer, listener?: ClockReadyListener) {
        super();
        this.mConn = con;
        this.mConn.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, this.proof);
        this.mListener = listener;
        this.mainPeer = mainPeer;
        this._check();
        con.setClock(this);
    }

    public sync(times: number = 1): void {
        if (!this.mConn) return;
        if (times < 0) {
            times = 1;
        }
        for (let i = 0; i < times; ++i) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
            const ct: IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = pkt.content;
            ct.clientStartTs = this.sysUnixTime;
            this.mainPeer.send(pkt.Serialization());
        }
    }

    public clearTime() {
        this.mClockSync = false;
        if (this.mIntervalId) {
            clearInterval(this.mIntervalId);
        }
        this.mDeltaTimeToServer = 0;
        this._check();
    }

    public destroy(): void {
        if (this.mConn) {
            this.mConn.removePacketListener(this);
            this.mConn = undefined;
        }
        if (this.mIntervalId) {
            clearInterval(this.mIntervalId);
        }
    }

    public get clockSync(): boolean {
        return this.mClockSync;
    }

    protected _check(): void {
        const self = this;
        this.mIntervalId = setInterval(() => {
            self.sync();
        }, CHECK_INTERVAL);
    }

    private proof(packet: PBpacket) {
        const ct: IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = packet.content;
        const local_receive = this.sysUnixTime
            , local_send = ct.clientStartTs
            , remote_receive = ct.serverReceiveTs
            , remote_send = ct.serverSendTs;

        // 参考文档：https://zhuanlan.zhihu.com/p/106069365
        this.mDeltaTimeToServer = Math.floor(((remote_receive - local_send) + (remote_send - local_receive)) / 2);
        if (this.mListener) {
            this.mClockSync = true;
            // Logger.getInstance().debug("clock同步完成");
            this.mListener.onClockReady();
        }
        // Logger.getInstance().debug(`mDeltaTimeToServer: ${this.mDeltaTimeToServer}`);
    }
}

import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../net/connection.service";
import { Algorithm } from "../utils/algorithm";
import { Logger } from "../utils/log";
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
    private mAutoSync: boolean = false;
    protected get sysUnixTime(): number {
        return new Date().getTime();
    }

    set unixTime(t: number) {
        this.mTimestamp = t;
    }

    get unixTime(): number {
        return this.mTimestamp;
    }

    private mTimestamp: number; // The timestamp in JavaScript is expressed in milliseconds.
    private mConn: ConnectionService;
    private mLatency: number[] = [];
    private mIntervalId: any;
    private mListener: ClockReadyListener;

    constructor(conn: ConnectionService, listener?: ClockReadyListener) {
        super();
        this.mConn = conn;
        this.mConn.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, this.proof);
        this.mListener = listener;
        this._check();
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
            this.mConn.send(pkt);
        }
    }

    public update(time: number, delta: number) {
        if (!this.mTimestamp) this.mTimestamp = time;
        else
            this.mTimestamp += delta;
    }

    public clearTime() {
        this.mClockSync = false;
        if (this.mIntervalId) {
            clearInterval(this.mIntervalId);
        }
        this.mTimestamp = 0;
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
        this.mLatency = undefined;
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
            , remote_send = ct.serverSendTs
            , server_run = remote_send - remote_receive
            , total_delay = (local_receive - local_send) - server_run
            , latency = Math.round(total_delay / 2);
        let timeSychronDelta: number = 0;
        if (latency < 0) return;

        this.mLatency.push(latency);
        if (this.mLatency.length > LATENCY_SAMPLES) {
            this.mLatency.shift();
        }
        const median_latency = Algorithm.median(this.mLatency);
        timeSychronDelta = median_latency + server_run;

        const remote_time = remote_send - timeSychronDelta; // the real remote-time.
        const mistake = Math.abs(remote_time - this.mTimestamp);
        // update timesychron
        if (mistake > MAX_DELAY) {
            this.mTimestamp = remote_time;
            this.mAutoSync = true;
            Logger.getInstance().debug("正在同步clock");
            // if (this.mAutoSync) {
            this.sync(-1);
            return;
            //  }
        }
        this.mAutoSync = false;
        if (this.mListener && this.mLatency.length >= MIN_READY_SAMPLES && !this.mAutoSync) {
            this.mClockSync = true;
            Logger.getInstance().debug("clock同步完成");
            this.mListener.onClockReady();
        }
        Logger.getInstance().debug(`total_delay: ${total_delay} / latency: ${latency} | timeSychronDelta: ${timeSychronDelta} / remote_time: ${remote_time} / mistake: ${mistake}`);

    }
}

import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {ConnectionService} from "../net/connection.service";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
import IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME;
import {Algorithm} from "../utils/algorithm";
import { Console } from "../utils/log";

const LATENCY_SAMPLES = 15; // Latency Array length
const TICK_INTERVAL = 500; // (ms)
const CHECK_INTERVAL = 100000; // (ms)

export class Clock extends PacketHandler {

    get sysUnixTime(): number {
        return new Date().getTime();
    }

    set unixTime(t: number) {
        this.mTimestamp = t;
    }

    get unixTime(): number {
        return this.mTimestamp;
    }
    private mTimestamp: number; // The timestamp in JavaScript is expressed in milliseconds.
    private mTickHandler: any;
    private mConn: ConnectionService;
    private mLatency: number[] = [];

    constructor(conn: ConnectionService) {
        super();
        this.mConn = conn;
        this.mConn.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, this.proof);

        this._start();
        this._check();
    }

    public sync(): void {
        if (!this.mConn) return;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
        const ct: IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = pkt.content;
        ct.clientStartTs = this.sysUnixTime;
        this.mConn.send(pkt);
    }

    protected _check(): void {
        const self = this;
        setInterval(() => {
            self.sync();
        }, CHECK_INTERVAL);
    }

    protected _start(): void {
        const self = this;
        this.mTickHandler = setInterval(() => {
            if (!self.mTimestamp) {
                self.mTimestamp = self.sysUnixTime;
            } else
                self.mTimestamp += TICK_INTERVAL;
        }, TICK_INTERVAL);
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
        let timeSychronDelta = 0;
        if (latency < 0) return;

        this.mLatency.push(latency);
        if (this.mLatency.length > LATENCY_SAMPLES) {
            this.mLatency.shift();
        }
        const median_latency = Algorithm.median(this.mLatency);
        timeSychronDelta = median_latency + server_run;

        const remote_time = remote_send - timeSychronDelta;
        const mistake = Math.abs(remote_time - this.mTimestamp);
        // update timesychron
        if (mistake > TICK_INTERVAL) {
            this.mTimestamp = remote_time;
        }
        Console.log(`total_delay: ${total_delay} / latency: ${latency} | timeSychronDelta: ${timeSychronDelta} / remote_time: ${remote_time} / mistake: ${mistake}`);
    }
}

import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_gateway, op_virtual_world} from "pixelpai_proto";
import {SocketConnection} from "../net/socket";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
import IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME;
import * as Long from "long";

export class Clock extends PacketHandler {
    private mTimestamp: number; //The timestamp in JavaScript is expressed in milliseconds.
    private mTickHandler: any;
    private mConn: SocketConnection;
    private mDelay: number[] = [];

    constructor(conn: SocketConnection) {
        super();
        this.mConn = conn;

        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, this.proof);

        this._start();
        this._check();
    }

    set unixTime(t: number) {
        this.mTimestamp = t;
    }

    get unixTime(): number {
        return this.mTimestamp
    }

    protected _check():void{
        const self = this;
        setInterval(()=>{
            self.sync();
        },10000);
    }

    protected _start(): void {
        const self = this;
        this.mTickHandler = setInterval(() => {
            if (!self.mTimestamp) {
                self.mTimestamp = new Date().getTime();
            } else
                self.mTimestamp += 200
        }, 200);
    }

    sync(): void {
        if (!this.mConn) return;
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
        let ct: IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = pkt.content;
        ct.clientStartTs = this.mTimestamp;
        this.mConn.send(pkt);
    }

    private proof(packet: PBpacket) {
        const ct: IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = packet.content;
        const local_receive = this.mTimestamp
            , local_send = Long.fromValue(ct.clientStartTs).toNumber()
            , remote_receive = Long.fromValue(ct.serverReceiveTs).toNumber()
            , remote_send = Long.fromValue(ct.serverSendTs).toNumber()
            , delta_up = remote_receive - local_send
            , delta_down = local_receive - remote_send;

        console.log(`local_send = ${local_send} | remote_receive = ${remote_receive} | remote_send = ${remote_send}`);
        if (delta_up <= 0) {
            console.error(`RemoteReceive time is less than LocalSend time: ${delta_up}`);
            return;
        }
        if (delta_down <= 0) {
            console.error(`LocalReceive time is less than RemoteSend time: ${delta_down}`);
            this.unixTime = remote_send;
            return;
        }

        const avg_delay: number = Math.round((delta_up + delta_down) / 2);
        this.mDelay.push(avg_delay);
        if (this.mDelay.length > 3) {
            this.mDelay.shift();
        }
    }

    get delay(): number {
        if (this.mDelay.length < 1) return 0;
        const total = this.mDelay.reduce((a, b) => {
            return a + b;
        })
            , count = this.mDelay.length;
        return Math.round(total / count);
    }
}

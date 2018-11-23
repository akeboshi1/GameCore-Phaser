import BaseSingleton from "../../base/BaseSingleton";
import {ISocketSend} from "../../interface/ISocketSend";
import {ISocketHandle} from "../../interface/ISocketHandle";
import {PBpacket} from "net-socket-packet";

export class SocketManager extends BaseSingleton implements ISocketSend,ISocketHandle{
    private m_SocketSend: ISocketSend;
    private m_SocketHandle: ISocketHandle;
    public constructor() {
        super();
    }

    public setSocketSend( value: ISocketSend ) {
        this.m_SocketSend = value;
    }

    public setSocketHandle( value: ISocketHandle ) {
        this.m_SocketHandle = value;
    }

    public send( packet: PBpacket ): void {
        this.m_SocketSend.send(packet);
    }

    public addListener(opcode: number, fun: Function): void {
        this.m_SocketHandle.addListener(opcode, fun);
    }

}
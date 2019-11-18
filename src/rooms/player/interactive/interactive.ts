import { PacketHandler, PBpacket } from "net-socket-packet";
import { IEntity } from "../../entity";
import { WorldService } from "../../../game/world.service";
import { op_virtual_world } from "pixelpai_proto";

export class Interactive extends PacketHandler implements IEntity {
    private mInitialize: boolean;
    constructor(private mWorld: WorldService) {
        super();
    }

    initialize(): boolean {
        return this.mInitialize;
    }

    public register() {
        this.mWorld.connection.addPacketListener(this);
    }

    public unRegister() {
        this.mWorld.connection.removePacketListener(this);
    }

    public destroy() {
        this.mInitialize = false;
        this.mWorld.connection.removePacketListener(this);
    }

    public requestTargetUI(uiId, id) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = uiId;
        content.componentId = id;
        this.mWorld.connection.send(pkt);
    }
}

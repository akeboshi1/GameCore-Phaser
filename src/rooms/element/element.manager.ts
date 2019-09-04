import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client} from "pixelpai_proto";
import {ConnectionService} from "../../net/connection.service";
import {Element} from "./element";
import {IRoomService} from "../room";
import {FramesModel} from "../display/frames.model";
import {Console} from "../../utils/log";

export interface IElementManager {
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;
    readonly scene: Phaser.Scene | undefined;

    init(): void;
}

export class ElementManager extends PacketHandler implements IElementManager {
    private mElements: Map<number, Element>;

    constructor(private mRoom: IRoomService) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
        }
    }

    public init() {
        if (!this.mElements) {
            this.mElements = new Map();
        }
        this.mElements.clear();
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Console.log("roomManager is undefined");
        return;
    }

    private onAdd(packet: PBpacket) {
        if (!this.mElements) {
            this.mElements = new Map();
        }

        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT = packet.content;
        const elements = content.elements;
        let element: Element;
        let loader: FramesModel;
        for (const ele of elements) {
            element = new Element(ele, this);
            loader = new FramesModel();
            loader.setInfo(ele);
            element.load(loader);
            this.mElements.set(ele.id || 0, element);

            this.mRoom.blocks.add(element);
        }
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }

    private onRemove(packet: PBpacket) {
    }

    private onMove(packet: PBpacket) {
    }

    private onSetPosition(packet: PBpacket) {
    }
}

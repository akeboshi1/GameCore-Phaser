import { PacketHandler, PBpacket } from "net-socket-packet";
import { IRoomService, Room } from "../room";
import { ConnectionService } from "../../net/connection.service";
import { Logger } from "../../utils/log";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { InteractionBubbleContainer } from "./interactionbubble.container";
import { Handler } from "../../Handler/Handler";
import { IElement } from "../element/element";

export class InteractiveBubbleManager extends PacketHandler {
    private mRoom: IRoomService;
    private map = new Map<string, InteractionBubbleContainer>();
    private mBubbleContainer: InteractionBubbleContainer;
    constructor(mRoom: IRoomService) {
        super();
        this.mRoom = mRoom;
        this.connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, this.onInteractiveBubble);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE, this.onClearInteractiveBubble);
    }

    get connection(): ConnectionService {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        Logger.getInstance().log("roomManager is undefined");
        return;
    }

    public destroy() {
        for (const key in this.map) {
            const bubble = this.map.get(key);
            bubble.destroy();
        }
        this.map.clear();
        this.map = null;
        this.mBubbleContainer = null;
        this.mRoom = null;
    }

    private onInteractiveBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE = packet.content;
        const room = this.mRoom as Room;
        let element = room.elementManager.get(content.receiverId);
        if (!element) element = room.playerManager.get(content.receiverId);
        if (element) {
            this.showInteractionBubble(content, element);
            Logger.getInstance().log("elementelementelementelementelementelementelementelementelementelement");
        }

        Logger.getInstance().log("onInteractiveBubbleonInteractiveBubbleonInteractiveBubbleonInteractiveBubble");
    }

    private onClearInteractiveBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE = packet.content;
        for (const id of content.ids) {
            this.clearInteractionBubble(id);
        }
    }

    private clearInteractionBubble(id: number) {
        for (const key in this.map) {
            const bubble = this.map.get(key);
            if (bubble.id === id) {
                bubble.hide();
            }
        }
    }

    private showInteractionBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, ele: IElement) {
        const scene = this.mRoom.scene;
        if (!scene) {
            return;
        }
        if (!this.mRoom) return;
        content.display["resName"] = "gems";
        content.display.texturePath = "resources/test/columns";
        const key = content.display.texturePath;
        if (this.mBubbleContainer) this.mBubbleContainer.hide();
        if (this.map.has(key)) {
            this.mBubbleContainer = this.map.get(key);
        } else {
            this.mBubbleContainer = new InteractionBubbleContainer(this.mRoom.scene);
            this.map.set(key, this.mBubbleContainer);
        }
        this.mBubbleContainer.setBubble(content, new Handler(this, this.onInteractiveBubbleHandler));
        const position = ele.getPosition();
        if (position) {
            const ration = this.mRoom.world.scaleRatio;
            this.mBubbleContainer.setPosition(position.x * ration, (position.y - 100) * ration, position.z * ration);
        }
        this.mRoom.addToSceneUI(this.mBubbleContainer);
        Logger.getInstance().log("reciver: ",content.id);
    }

    private onInteractiveBubbleHandler(data: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE) {
        const connection = this.mRoom.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE = packet.content;
        content.id = data.id;
        //  content.receiverId = data.receiverId;
        connection.send(packet);
        Logger.getInstance().log("*******************onInteractiveBubbleHandler");
        Logger.getInstance().log("click: ",content.id);
    }
}

import { PacketHandler, PBpacket } from "net-socket-packet";
import { Room } from "../../rooms/room";
import { ConnectionService } from "../../net/connection.service";
import { Logger } from "../../utils/log";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { InteractionBubbleContainer } from "./interactionbubble.container";
import { Handler } from "../../Handler/Handler";
import { IElement } from "../../rooms/element/element";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { Pos } from "../../utils/pos";

export class InteractiveBubbleManager extends PacketHandler {
    private map = new Map<string, InteractionBubbleContainer>();
    private mBubbleContainer: InteractionBubbleContainer;
    private uilayer: ILayerManager;
    private scene: Phaser.Scene;
    private mworld: WorldService;
    constructor(layerMgr: ILayerManager, mworld: WorldService, scene: Phaser.Scene) {
        super();
        this.uilayer = layerMgr;
        this.mworld = mworld;
        this.scene = scene;
        this.connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, this.onInteractiveBubble);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE, this.onClearInteractiveBubble);
    }

    get connection(): ConnectionService {
        if (this.mworld) {
            return this.mworld.connection;
        }
        Logger.getInstance().log("roomManager is undefined");
        return;
    }

    public destroy() {
        if (this.map) {
            for (const key in this.map) {
                const bubble = this.map.get(key);
                bubble.destroy();
            }
            this.map.clear();
        }
        this.map = null;
        this.mBubbleContainer = null;
        this.scene = null;
        this.uilayer = null;
        this.mworld = null;
    }

    private onInteractiveBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE = packet.content;
        const room = this.mworld.roomManager.currentRoom;
        let element = room.elementManager.get(content.receiverId);
        if (!element) element = room.playerManager.get(content.receiverId);
        if (element) {
            this.showInteractionBubble(content, element);
        }
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
        content.display["resName"] = "gems";
        content.display.texturePath = "resources/test/columns";
        const key = content.display.texturePath;
        if (this.mBubbleContainer) this.mBubbleContainer.hide();
        if (this.map.has(key)) {
            this.mBubbleContainer = this.map.get(key);
        } else {
            this.mBubbleContainer = new InteractionBubbleContainer(this.scene);
            this.map.set(key, this.mBubbleContainer);
        }
        this.mBubbleContainer.setBubble(content, new Handler(this, this.onInteractiveBubbleHandler));
        const position = ele.getDisplay().getWorldTransformMatrix();
        if (position) {
            const uiRatio = 0;// this.mworld.uiRatio;
            Logger.getInstance().log(position.tx * uiRatio, (position.ty - 100) * uiRatio);
            this.mBubbleContainer.setPosition(position.tx * uiRatio, (position.ty - 100) * uiRatio);
        }
        this.uilayer.addToDialogLayer(this.mBubbleContainer);
    }

    private onInteractiveBubbleHandler(data: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE) {
        const connection = this.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE = packet.content;
        content.id = data.id;
        //  content.receiverId = data.receiverId;
        connection.send(packet);
        Logger.getInstance().log("*******************onInteractiveBubbleHandler");
        Logger.getInstance().log("click: ", content.id);
    }
}

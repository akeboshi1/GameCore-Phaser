import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { Logger } from "../../utils/log";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { InteractionBubbleContainer } from "./interactionbubble.container";
import { Handler } from "../../Handler/Handler";
import { IElement } from "../../rooms/element/element";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { Pos } from "../../utils/pos";
import { PlayScene } from "../../scenes/play";
import { Tool } from "../../utils/tool";
import { Url } from "../../utils/resUtil";
import { Room } from "../../rooms/room";

export class InteractiveBubbleManager extends PacketHandler {
    private map = new Map<number, InteractionBubbleContainer>();
    private mBubble: InteractionBubbleContainer;
    private uilayer: ILayerManager;
    private scene: Phaser.Scene;
    private mworld: WorldService;
    private mCurRoom: Room;
    constructor(layerMgr: ILayerManager, mworld: WorldService) {
        super();
        this.uilayer = layerMgr;
        this.mworld = mworld;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, this.onInteractiveBubble);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORDL_REQ_CLIENT_REMOVE_INTERACTIVE_BUBBLE, this.onClearInteractiveBubble);
    }

    public setScene(scene: Phaser.Scene) {
        this.connection.removePacketListener(this);
        this.scene = scene;
        this.connection.addPacketListener(this);
    }

    get connection(): ConnectionService {
        if (this.mworld) {
            return this.mworld.connection;
        }
        Logger.getInstance().log("roomManager is undefined");
        return;
    }

    get currentRoom(): Room {
        return this.mworld.roomManager.currentRoom;
    }

    public destroy() {
        this.connection.removePacketListener(this);
        if (this.map) {
            for (const key in this.map) {
                const bubble = this.map.get(Number(key));
                if (bubble) bubble.destroy();
            }
            this.map.clear();
        }
        if (this.mCurRoom) this.mCurRoom.frameManager.remove(this, this.update);
        this.map = null;
        this.mBubble = null;
        this.scene = null;
        this.uilayer = null;
        this.mworld = null;
    }

    private onInteractiveBubble(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE = packet.content;
        if (this.mCurRoom !== this.currentRoom) {
            if (this.mCurRoom) this.mCurRoom.frameManager.remove(this, this.update);
            this.mCurRoom = this.currentRoom;
            this.mCurRoom.frameManager.add(this, this.update);
        }
        let element = this.currentRoom.elementManager.get(content.receiverId);
        if (!element) element = this.currentRoom.playerManager.get(content.receiverId);
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
        if (this.map.has(id)) {
            const bubble = this.map.get(id);
            bubble.destroy();
            this.map.delete(id);
        }
    }

    private showInteractionBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, ele: IElement) {
        const dpr = Math.round(this.mworld.uiRatio || 1);
        content.display["resName"] = null;// "gems";
        content.display.texturePath = Url.getUIRes(dpr, "bubble/bubblebg.png");// "resources/test/columns";
        content.display.dataPath = Url.getUIRes(dpr, "bubble/tipsicon.png");// "resources/test/columns";
        const key = content.id;
        if (this.mBubble) this.mBubble.hide();
        if (this.map.has(key)) {
            this.mBubble = this.map.get(key);
        } else {
            this.mBubble = new InteractionBubbleContainer(this.scene, dpr);
            this.map.set(key, this.mBubble);
        }
        this.mBubble.setBubble(content, new Handler(this, this.onInteractiveBubbleHandler));
        const playScene = this.mworld.game.scene.getScene(PlayScene.name);
        this.updateBublePos(ele, playScene);
        this.mBubble.setFollow(ele, playScene, (obj) => {
            this.updateBublePos(ele, obj.scene);
        });
        this.mBubble.show = true;
        this.uilayer.addToUILayer(this.mBubble);
    }

    private updateBublePos(gameObject: any, scene: Phaser.Scene) {
        const dpr = this.mworld.uiRatio;
        const zoom = this.mworld.uiScale;
        const position = gameObject.getDisplay().getWorldTransformMatrix();
        if (position) {
            const pos = Tool.getPosByScenes(scene, new Pos(position.tx, (position.ty - 33 * dpr * zoom)));
            this.mBubble.setPosition(pos.x, pos.y);
        }
    }

    private onInteractiveBubbleHandler(data: any) {
        if (typeof data === "number") {
            this.clearInteractionBubble(data);
            return;
        }
        const connection = this.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE);
        const content: op_virtual_world.OP_CLIENT_RES_VIRTUAL_WORLD_ACTIVE_BUBBLE = packet.content;
        content.id = data.id;
        //  content.receiverId = data.receiverId;
        connection.send(packet);
    }

    private update() {
        if (!this.map) return;
        this.map.forEach((bubble) => {
            if (bubble && bubble.show) bubble.updatePos();
        });
    }
}

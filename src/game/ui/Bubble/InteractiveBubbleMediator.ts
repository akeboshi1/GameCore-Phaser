import { Logger } from "../../game/core/utils/log";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { InteractiveBubblePanel } from "./InteractiveBubblePanel";
import { Handler } from "../../Handler/Handler";
import { IElement } from "../../rooms/element/element";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { Pos } from "../../game/core/utils/pos";
import { PlayScene } from "../../scenes/play";
import { Tool } from "../../game/core/utils/tool";
import { Url } from "../../game/core/utils/resUtil";
import { Room } from "../../rooms/room";
import { InteractiveBubble } from "./InteractiveBubble";
import { BaseMediator } from "apowophaserui";

export class InteractiveBubbleMediator extends BaseMediator {
    protected mView: InteractiveBubblePanel;
    private layerMgr: ILayerManager;
    private scene: Phaser.Scene;
    private mworld: WorldService;
    private mCurRoom: Room;
    private bubblePacket: InteractiveBubble;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, mworld: WorldService) {
        super();
        this.layerMgr = layerMgr;
        this.mworld = mworld;
        this.scene = scene;
        if (!this.bubblePacket) {
            this.bubblePacket = new InteractiveBubble(mworld);
            this.bubblePacket.on("showbubble", this.onShowInteractiveBubble, this);
            this.bubblePacket.on("clearbubble", this.onClearInteractiveBubble, this);
            this.bubblePacket.register();
        }
        if (!this.mView) {
            this.mView = new InteractiveBubblePanel(this.scene, this.mworld);
            this.mView.on("queryinteractive", this.onInteractiveBubbleHandler, this);
        }
    }

    get currentRoom(): Room {
        return this.mworld.roomManager.currentRoom;
    }

    destroy() {
        if (this.mCurRoom) this.mCurRoom.frameManager.remove(this, this.update);
        if (this.bubblePacket) {
            this.bubblePacket.destroy();
            this.bubblePacket = undefined;
        }
        super.destroy();
        this.mCurRoom = undefined;
    }

    update() {
        if (this.mView) this.mView.update();
    }
    private onShowInteractiveBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE) {
        if (this.mCurRoom !== this.currentRoom) {
            if (this.mCurRoom) this.mCurRoom.frameManager.remove(this, this.update);
            this.mCurRoom = this.currentRoom;
            this.mCurRoom.frameManager.add(this, this.update);
        }
        let element = this.currentRoom.elementManager.get(content.receiverId);
        if (!element) element = this.currentRoom.playerManager.get(content.receiverId);
        if (element && this.mView) {
            this.mView.showInteractionBubble(content, element);
        }
        this.layerMgr.addToUILayer(this.mView, 0);
    }

    private onClearInteractiveBubble(ids: number[]) {
        if (!this.mView) return;
        for (const id of ids) {
            this.mView.clearInteractionBubble(id);
        }
    }
    private onInteractiveBubbleHandler(data: any) {
        if (!this.mView) return;
        if (typeof data === "number") {
            this.mView.clearInteractionBubble(data);
            return;
        }
        this.bubblePacket.queryInteractiveHandler(data);
    }
}

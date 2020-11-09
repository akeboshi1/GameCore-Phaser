import { op_client, op_virtual_world } from "pixelpai_proto";
import { InteractiveBubble } from "./InteractiveBubble";
import { BaseMediator } from "apowophaserui";
import { BasicMediator, Game, Room } from "gamecore";
import { ModuleName } from "structure";

export class InteractiveBubbleMediator extends BasicMediator {
    public static NAME: string = ModuleName.BUBBLE_NAME;
    private mCurRoom: Room;
    private bubblePacket: InteractiveBubble;
    constructor(protected game: Game) {
        super(game);
        if (!this.bubblePacket) {
            this.bubblePacket = new InteractiveBubble(this.game);
            this.game.emitter.on("showbubble", this.onShowInteractiveBubble, this);
            this.game.emitter.on("clearbubble", this.onClearInteractiveBubble, this);
            this.bubblePacket.register();
        }
    }

    show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(InteractiveBubbleMediator.NAME, param).then(() => {
                this.mView = this.game.peer.render.InteractiveBubblePanel;
            });
            this.game.emitter.on("queryinteractive", this.onInteractiveBubbleHandler, this);
            this.bubblePacket.register();
        });
    }

    hide() {
        super.hide();
        this.game.emitter.off("queryinteractive", this.onInteractiveBubbleHandler, this);
    }

    get currentRoom(): Room {
        return this.game.roomManager.currentRoom;
    }

    destroy() {
        if (this.mCurRoom) this.mCurRoom.removeUpdateHandler(this, this.update);
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
            if (this.mCurRoom) this.mCurRoom.removeUpdateHandler(this, this.update);
            this.mCurRoom = this.currentRoom;
            this.mCurRoom.addUpdateHandler(this, this.update);
        }
        let element = this.currentRoom.elementManager.get(content.receiverId);
        if (!element) element = this.currentRoom.playerManager.get(content.receiverId);
        if (element && this.mView) {
            this.mView.showInteractionBubble(content, element);
        }
        // this.layerMgr.addToUILayer(this.mView, 0);
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

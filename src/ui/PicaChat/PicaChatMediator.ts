import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaChatPanel } from "./PicaChatPanel";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";
import { PicaChat } from "./PicaChat";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class PicaChatMediator extends BaseMediator {
    public static NAME: string = "PicaChatMediator";
    protected mView: PicaChatPanel;
    private scene: Phaser.Scene;
    private mChat: PicaChat;
    private world: WorldService;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super();
        this.world = worldService;
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.mView.show();
            this.layerManager.addToUILayer(this.mView.view);
            return;
        }
        if (!this.mChat) {
            this.mChat = new PicaChat(this.world);
            this.mChat.on("chat", this.onChatHandler, this);
            this.mChat.register();
        }
        if (!this.mView) {
            this.mView = new PicaChatPanel(this.scene, this.world);
            this.mView.on("showNavigate", this.onShowNavigateHandler, this);
            this.mView.on("chat", this.onSendChatHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView.view);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.mChat) {
            this.mChat.destroy();
            this.mChat = undefined;
        }
        super.destroy();
    }

    private onShowNavigateHandler() {
        if (!this.world) {
            return;
        }
        const uiManager = this.world.uiManager;
        const mediator = uiManager.getMediator(PicaNavigateMediator.name);
        if (mediator) {
            mediator.show();
            this.mView.hide();
            this.mView.removeListen();
            this.layerManager.removeToUILayer(this.mView.view);
        }
    }

    private onChatHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT) {
        if (!this.mView || !this.world || !this.world.roomManager || !this.world.roomManager.currentRoom) {
            return;
        }
        const playerManager = this.world.roomManager.currentRoom.playerManager;
        const player = playerManager.get(content.chatSenderid);
        if (player) {
            this.mView.appendChat(`[color=#ffffff][当前]${player.model.nickname}: ${content.chatContext}[/color]\n`);
        }
    }

    private onSendChatHandler(val: string) {
        if (!this.mChat) {
            return;
        }
        if (val === "whosyourdaddy") {
            this.world.uiManager.showMed("DebugLogger");
        }
        this.mChat.sendMessage(val);
    }
}

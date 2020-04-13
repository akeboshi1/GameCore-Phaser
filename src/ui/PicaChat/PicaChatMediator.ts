import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaChatPanel } from "./PicaChatPanel";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";
import { Chat } from "./Chat";
import { op_client } from "pixelpai_proto";

export class PicaChatMediator extends BaseMediator {
    protected mView: PicaChatPanel;
    private scene: Phaser.Scene;
    private mChat: Chat;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super(worldService);
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            this.mView.show();
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.mChat) {
            this.mChat = new Chat(this.world);
            this.mChat.on("chat", this.onChatHandler, this);
            this.mChat.register();
        }
        if (!this.mView) {
            this.mView = new PicaChatPanel(this.scene, this.world);
            this.mView.on("showNavigate", this.onShowNavigateHandler, this);
            this.mView.on("chat", this.onSendChatHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.mChat) {
            this.mChat.destroy();
            this.mChat = undefined;
        }
        if (this.mView) {
            this.mView.destroy();
            this.mView = undefined;
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
            this.layerManager.removeToUILayer(this.mView);
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
        this.mChat.sendMessage(val);
    }
}

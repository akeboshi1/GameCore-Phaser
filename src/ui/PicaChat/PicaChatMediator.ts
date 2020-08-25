import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaChatPanel } from "./PicaChatPanel";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";
import { PicaChat } from "./PicaChat";
import { op_client, op_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { IElement } from "../../rooms/element/element";
import { i18n } from "../../i18n";

export class PicaChatMediator extends BaseMediator {
    public static NAME: string = "PicaChatMediator";
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
        if (this.mView) {
            this.mView.show();
            this.layerManager.addToUILayer(this.mView);
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
        super.destroy();
    }

    hide() {
        super.hide();
        this.mView.removeListen();
        this.layerManager.removeToUILayer(this.mView);
    }

    private onShowNavigateHandler() {
        if (!this.world) {
            return;
        }
        const uiManager = this.world.uiManager;
        uiManager.showMed("PicaNavigate");
        uiManager.hideMed("PicHandheld");
        this.hide();
    }

    private onChatHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT) {
        if (!this.mView) {
            return;
        }
        const player = this.getSpeaker(content.chatSenderid);
        let speaker = "";
        if (player) {
            speaker = `${player.model.nickname}`;
        } else {
            if (content.chatSenderid) {
                speaker = i18n.t("chat.mystery");
            }
        }
        let color = "#ffffff";
        if (content.chatSetting) {
            color = content.chatSetting.textColor;
        }
        this.appendChat(`[color=${color}][${this.getChannel(content.chatChannel)}]${speaker}: ${content.chatContext}[/color]\n`);
    }

    private appendChat(chat: string) {
        if (!this.mView) {
            return;
        }
        (<PicaChatPanel>this.mView).appendChat(chat);
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

    private getChannel(channel: op_def.ChatChannel) {
        switch (channel) {
            case op_def.ChatChannel.CurrentScene:
                return i18n.t("chat.current");
            case op_def.ChatChannel.World:
                return i18n.t("chat.world");
            default:
                return i18n.t("chat.system");
        }
    }

    private getSpeaker(id: number): IElement {
        if (id) {
            if (!this.world || !this.world.roomManager || !this.world.roomManager.currentRoom) {
                return;
            }
            return this.world.roomManager.currentRoom.getElement(id);
        }
    }
}

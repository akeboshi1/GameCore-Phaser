import { PicaChat } from "./PicaChat";
import { op_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
export class PicaChatMediator extends BasicMediator {
    public static NAME: string = "PicaChat";
    private mChat: PicaChat;
    constructor(protected game: Game) {
        super(game);
        this.mChat = new PicaChat(this.game);
    }

    show(param?: any) {
        if (!this.mPanelInit) {
            this.__exportProperty(() => {
                this.game.peer.render.showPanel(PicaChatMediator.NAME, param);
                if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICACHAT_NAME];
            });
        } else {
            this.mView = this.game.peer.render[ModuleName.PICACHAT_NAME];
        }
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
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICACHAT_NAME];
        if (this.mView) {
            this.mView.hide();
        }
        this.mView = undefined;
        super.hide();
    }

    sendMessage(val: string) {
        if (this.mChat) this.mChat.sendMessage(val);
    }

    showNavigate() {
        const uiManager = this.game.uiManager;
        uiManager.showMed(ModuleName.PICANAVIGATE_NAME);
        uiManager.hideMed(ModuleName.PICHANDHELD_NAME);
        this.hide();
    }

    buyItem(prop: op_def.IOrderCommodities) {
        this.mChat.buyMarketCommodities([prop]);
    }
    // private onChatHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT) {
    //     const player = this.getSpeaker(content.chatSenderid);
    //     this.game.peer.render.appendChat(content);
    // }

    // private getSpeaker(id: number): IElement {
    //     if (id) {
    //         if (!this.game || !this.game.roomManager || !this.game.roomManager.currentRoom) {
    //             return;
    //         }
    //         return this.game.roomManager.currentRoom.getElement(id);
    //     }
    // }

    // private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    //     this.game.peer.render.setGiftData(content);
    // }
}

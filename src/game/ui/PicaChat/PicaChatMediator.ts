import { Game } from "src/game/game";
import { BasicMediator } from "../basic/basic.mediator";
import { PicaChat } from "./PicaChat";
import { op_def } from "pixelpai_proto";
export class PicaChatMediator extends BasicMediator {
    public static NAME: string = "PicaChat";
    private mChat: PicaChat;
    constructor(protected game: Game) {
        super(game);
        this.mChat = new PicaChat(this.game);
    }

    show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(PicaChatMediator.NAME, param);
        });
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
        this.game.peer.render.hidePanel(PicaChatMediator.NAME);
    }

    sendMessage(val: string) {
        if (this.mChat) this.mChat.sendMessage(val);
    }

    showNavigate() {
        const uiManager = this.game.uiManager;
        uiManager.showMed("PicaNavigate");
        uiManager.hideMed("PicHandheld");
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

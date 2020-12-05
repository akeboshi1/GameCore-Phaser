import { PicaChat } from "./PicaChat";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game, IElement, UIType } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { i18n, Logger } from "utils";

export class PicaChatMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICACHAT_NAME, game);
        Logger.getInstance().log("picachatmed=====create");
        // this.game.dataManager.on(EventType.UPDATE_PARTY_STATE, this.onGiftStateHandler, this);
        if (!this.mModel) {
            this.mModel = new PicaChat(this.game);
        }
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_showNavigate", this.onShowNavigateHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querymarket", this.queryMarket, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_chat", this.onSendChatHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.on("chat", this.onChatHandler, this);
        this.game.emitter.on(ModuleName.PICACHAT_NAME + "_queryMarket", this.onQueryResuleHandler, this);
        this.onViewInitComplete();
    }

    hide() {
        this.game.emitter.off("chat", this.onChatHandler, this);
        this.game.emitter.off(ModuleName.PICACHAT_NAME + "_queryMarket", this.onQueryResuleHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_showNavigate", this.onShowNavigateHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querymarket", this.queryMarket, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_chat", this.onSendChatHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_buyItem", this.onBuyItemHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_initialized", this.onViewInitComplete, this);
        super.hide();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        this.game.emitter.off("chat", this.onChatHandler, this);
        this.game.emitter.off(ModuleName.PICACHAT_NAME + "_queryMarket", this.onQueryResuleHandler, this);
        // this.game.dataManager.off(EventType.UPDATE_PARTY_STATE, this.onGiftStateHandler, this);
        super.destroy();
    }

    private onViewInitComplete() {
        if (!this.game) {
            return;
        }
        const mgr = this.game.dataManager.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        if (mgr && mgr.curRoom)
            this.onGiftStateHandler(mgr.curRoom.openingParty);
        if (this.mView && this.mView.isShowChatPanel()) {
            const uiManager = this.game.uiManager;
            uiManager.showMed(ModuleName.PICAHANDHELD_NAME);
        }
    }

    private onShowNavigateHandler() {
        if (!this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(ModuleName.PICANAVIGATE_NAME);
        uiManager.hideMed(ModuleName.PICAHANDHELD_NAME);
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
        this.mView.appendChat(chat);
    }

    private onSendChatHandler(val: string) {
        if (!this.model) {
            return;
        }
        if (val === "whosyourdaddy") {
            this.game.uiManager.showMed("DebugLogger");
        }
        if (val === "##show matter") {
            return this.game.roomManager.currentRoom.matterWorld.debugEnable();
        }

        if (val === "##hide matter") {
            return this.game.roomManager.currentRoom.matterWorld.debugDisable();
        }
        this.model.sendMessage(val);
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
            if (!this.game || !this.game.roomManager || !this.game.roomManager.currentRoom) {
                return;
            }
            return this.game.roomManager.currentRoom.getElement(id);
        }
    }
    private onQueryResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
        this.mView.setGiftData(content);
    }
    private queryMarket() {
        this.model.queryMarket("gift_shop", 1, undefined, undefined);
    }
    private onBuyItemHandler(prop: op_def.IOrderCommodities) {
        this.model.buyMarketCommodities([prop]);
    }
    private onGiftStateHandler(openGift: boolean) {
        if (this.mView) {
            this.mView.setGiftButtonState(openGift);
        }
    }
    private get model(): PicaChat {
        return (<PicaChat>this.mModel);
    }
}

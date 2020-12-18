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
        const uiManager = this.game.uiManager;
        if (mgr && mgr.curRoom)
            this.onGiftStateHandler(mgr.curRoom.openingParty);
        if (this.mView && this.mView.isShowChatPanel()) {
            uiManager.showMed(ModuleName.PICAHANDHELD_NAME);
        }
        uiManager.hideMed(ModuleName.PICANAVIGATE_NAME);
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
        this.getChannel(content.chatChannel).then((str) => {
            this.appendChat(`[color=${color}][${str}]${speaker}: ${content.chatContext}[/color]\n`);
        });
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

        const patt = new RegExp("##(\\D+)\\.(\\D+)");
        const params = patt.exec(val);
        if (params && params.length > 0) {
            this.applyChatCommand(params);
            return;
        }
        this.model.sendMessage(val);
    }

    // "##matterWorld.debugEnable"
    // => this.game.roomManager.currentRoom.matterWorld.debugEnable();
    private applyChatCommand(params: string[]) {
        if (params.length !== 3) return;

        const contextStr = params[1];
        let context = null;
        if (contextStr === "matterWorld") {
            context = this.game.roomManager.currentRoom.matterWorld;
        } else if (contextStr === "logger") {
            context = Logger.getInstance();
        }
        if (context === null) {
            return;
        }

        const functionStr = params[2];
        context[functionStr].apply(context);
    }

    private async getChannel(channel: op_def.ChatChannel): Promise<string> {
        return new Promise<string>(async (resolve, rejcet) => {
            let str = "";
            if (channel === op_def.ChatChannel.CurrentScene) {
                str = await this.game.peer.render.getMessage("chat.current");
            } else if (channel === op_def.ChatChannel.World) {
                str = await this.game.peer.render.getMessage("chat.world");
            } else {
                str = await this.game.peer.render.getMessage("chat.system");
            }
            // switch (channel) {
            //     case op_def.ChatChannel.CurrentScene:
            //         str = await this.game.peer.render.getMessage("chat.current");
            //     case op_def.ChatChannel.World:
            //         str = await this.game.peer.render.getMessage("chat.world");
            //     default:
            //         str = await this.game.peer.render.getMessage("chat.system");
            // }
            resolve(str);
        });
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

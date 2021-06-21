import { PicaChat } from "./PicaChat";
import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game, IElement, SceneDataManager, UIType } from "gamecore";
import { EventType, ModuleName, RENDER_PEER } from "structure";
import { ChatCommandInterface, i18n, Logger } from "utils";

export class PicaChatMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICACHAT_NAME, game);
        Logger.getInstance().debug("picachatmed=====create");
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
        const mgr = this.game.dataManager.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        const uiManager = this.game.uiManager;
        if (mgr && mgr.curRoom)
            this.onGiftStateHandler(mgr.curRoom.openingParty);
        if (this.mView && this.mView.isShowChatPanel()) {
            uiManager.showMed(ModuleName.PICAHANDHELD_NAME);
        }
    }

    private onShowNavigateHandler() {
        if (!this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.hideMed(ModuleName.PICAHANDHELD_NAME);
        this.hide();
    }

    private async onChatHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT) {
        if (!this.mView) {
            return;
        }
        const player = this.getSpeaker(content.chatSenderid);
        let speaker = "";
        if (player) {
            speaker = `${player.model.nickname}`;
        } else {
            if (content.chatSenderid) {
                speaker = await this.game.renderPeer.i18nString("chat.mystery");
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

        const patt = new RegExp("^##(\\w+)\\s*(.*)");
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
        if (params.length < 2) return;

        const contextStr = params[1];
        const contextMap = {
            "box": this.game.peer.physicalPeer["matterWorld"],
            "log": Logger.getInstance()
        };
        const context: ChatCommandInterface = contextMap[contextStr];
        if (context === undefined || context === null) {
            return;
        }
        if (params.length > 2 && params[2].length > 0) {
            const functionStr = params[2];
            context[functionStr].apply(context);
        } else {
            context.v();
        }
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

import { BasicMediator, ChatManager, DataMgrType, Game, IElement, UIType } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaChat } from "../PicaChat/PicaChat";
import { ChatCommandInterface, Logger } from "utils";
import { MainUIRedType, RedEventType } from "picaStructure";
import { PicaGame } from "../../pica.game";
import { PicaCommandMsgType } from "../../command/pica.command.msg.type";

export class BottomMediator extends BasicMediator {
    private mCacheManager: ChatManager;
    private isTrumpet = false;
    constructor(game: Game) {
        super(ModuleName.BOTTOM, game);
        if (!this.mModel) {
            this.mModel = new PicaChat(this.game);
        }
        this.mUIType = UIType.Scene;
    }

    public show() {
        this.game.emitter.on("chat", this.appendChat, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_gohome", this.onGoHomeHandler, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_trumpet", this.onTrumpetHandler, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_bbcodeEvent", this.onBBCODEEventHandler, this);
        this.game.emitter.on(RedEventType.MAIN_PANEL_RED, this.onRedSystemHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.setTrumpetState, this);
        super.show();
    }

    public hide() {
        this.game.emitter.off("chat", this.appendChat, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_gohome", this.onGoHomeHandler, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_trumpet", this.onTrumpetHandler, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_bbcodeEvent", this.onBBCODEEventHandler, this);
        this.game.emitter.off(RedEventType.MAIN_PANEL_RED, this.onRedSystemHandler, this);
        this.game.emitter.off(EventType.PACKAGE_UPDATE, this.setTrumpetState, this);
        super.hide();
    }

    public isSceneUI() {
        return true;
    }

    public sendChat(data: { val: string, trumpet: boolean }) {
        const model = this.model;
        if (!model) {
            return;
        }

        const patt = new RegExp("^##(\\w+)\\s*(.*)");
        const params = patt.exec(data.val);
        if (params && params.length > 0) {
            this.applyChatCommand(params);
            return;
        }
        if (!data.trumpet) {
            model.sendMessage(data.val);
        } else {
            this.game.sendCustomProto("STRING", "sendTrumpetMessage", { id: data.val });
            this.setTrumpetState();
        }
    }

    protected panelInit() {
        super.panelInit();
        const cacheManager = this.cacheManager;
        if (cacheManager) {
            const msgs = cacheManager.getMsgs();
            for (const msg of msgs) {
                this.appendChat(msg);
            }
        }
        this.onRedSystemHandler((<PicaGame>this.game).getRedPoints(MainUIRedType.MAIN));
        this.setTrumpetState();
    }

    // "##matterWorld.debugEnable"
    // => this.game.roomManager.currentRoom.matterWorld.debugEnable();
    private applyChatCommand(params: string[]) {
        if (params.length < 2) return;

        const contextStr = params[1];
        const contextMap = {
            "box": this.game.roomManager.currentRoom.collsionManager,
            "log": Logger.getInstance(),
            "grids": this.game.renderPeer.gridsDebugger,
            "astar": this.game.renderPeer.astarDebugger,
            "sort": this.game.renderPeer.sortDebugger,
            "editor": this.game.renderPeer.editorModeDebugger,
            "reconnect": this.game,
            "showpanel": { v: () => { this.onShowPanelHandler(params[2]); } },
            "off": { v: () => { this.exitUser(); } },
            "command": { v: () => { this.onTestCommandHandler(params[2]); } },
            "point": { v: () => { this.game.peer.showMovePoint(true); }, q: () => { this.game.peer.showMovePoint(false); } },
            "snapshot": { v: () => { this.mView.snapshot(); } },
        };
        const context: ChatCommandInterface = contextMap[contextStr];
        if (context === undefined || context === null) {
            return;
        }
        if (params.length > 2 && params[2].length > 0) {
            const tag = params[1];
            if (tag === "showpanel" || tag === "off" || tag === "command") { // TODO: 临时显示UI界面
                context.v();
            } else {
                const functionStr = params[2];
                context[functionStr].apply(context);
            }
        } else {
            context.v();
        }
    }

    // private onChatHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT) {
    //     if (!this.mView) {
    //         return;
    //     }
    //     const player = this.getSpeaker(content.chatSenderid);
    //     let speaker = "";
    //     if (player) {
    //         speaker = `${player.model.nickname}`;
    //     } else {
    //         if (content.chatSenderid) {
    //             // speaker = i18n.t("chat.mystery");
    //         }
    //     }
    //     let color = "#ffffff";
    //     if (content.chatSetting) {
    //         color = content.chatSetting.textColor;
    //     }
    //     this.getChannel(content.chatChannel).then((str) => {
    //         const msg = `[color=${color}][${str}]${speaker}: ${content.chatContext}[/color]\n`;
    //         this.appendChat(msg);
    //     });
    // }

    private appendChat(chat: string) {
        if (!this.mView) {
            return;
        }
        this.mView.appendChat(chat);
    }

    // private getSpeaker(id: number): IElement {
    //     if (id) {
    //         if (!this.game || !this.game.roomManager || !this.game.roomManager.currentRoom) {
    //             return;
    //         }
    //         return this.game.roomManager.currentRoom.getElement(id);
    //     }
    // }

    // private async getChannel(channel: op_def.ChatChannel): Promise<string> {
    //     return new Promise<string>(async (resolve, rejcet) => {
    //         let str = "";
    //         if (channel === op_def.ChatChannel.CurrentScene) {
    //             str = await this.game.peer.render.getMessage("chat.current");
    //         } else if (channel === op_def.ChatChannel.World) {
    //             str = await this.game.peer.render.getMessage("chat.world");
    //         } else {
    //             str = await this.game.peer.render.getMessage("chat.system");
    //         }
    //         resolve(str);
    //     });
    // }
    private setTrumpetState() {
        if (this.mView) {
            const id = "IP1310058";
            const count = this.game.user.userData.playerBag.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, id);
            this.mView.setTrumpetState(count);
        }
    }
    private onShowPanelHandler(panel: string, data?: any) {
        if (!this.mModel || !this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(panel);
    }
    private onGoHomeHandler() {
        this.model.queryGoHome();
    }

    private onTrumpetHandler(enable: boolean) {
        this.isTrumpet = enable;
    }
    private onBBCODEEventHandler(key: string) {

    }

    private onTestCommandHandler(tag: string) {
        this.game.emitter.emit(EventType.TEST_COMMAND_MESSAGE, tag);
    }

    private exitUser() {
        if (!this.mView) {
            return;
        }
        this.mView.exitUser();
    }

    private get model(): PicaChat {
        return (<PicaChat>this.mModel);
    }

    private get cacheManager() {
        if (!this.mCacheManager) {
            this.mCacheManager = this.game.getDataMgr<ChatManager>(DataMgrType.ChatMgr);
        }
        return this.mCacheManager;
    }
    private onRedSystemHandler(reds: number[]) {
        if (this.mView) this.mView.setRedsState(reds);
    }
}

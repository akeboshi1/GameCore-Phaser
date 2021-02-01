import { BasicMediator, Game, IElement, UIType } from "gamecore";
import { ModuleName } from "structure";
import { op_def, op_client } from "pixelpai_proto";
import { PicaChat } from "picaWorker";
import { ChatCommandInterface, Logger } from "utils";

export class BottomMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.BOTTOM, game);
        if (!this.mModel) {
            this.mModel = new PicaChat(this.game);
        }
        this.mUIType = UIType.Scene;
    }

    public show() {
        this.game.emitter.on("chat", this.onChatHandler, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(ModuleName.BOTTOM + "_gohome", this.onGoHomeHandler, this);
        super.show();
    }

    public hide() {
        this.game.emitter.off("chat", this.onChatHandler, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(ModuleName.BOTTOM + "_gohome", this.onGoHomeHandler, this);
        super.hide();
    }

    public isSceneUI() {
        return true;
    }

    public sendChat(val: string) {
        const model = this.model;
        if (!model) {
            return;
        }

        const patt = new RegExp("^##(\\w+)\\s*(.*)");
        const params = patt.exec(val);
        if (params && params.length > 0) {
            this.applyChatCommand(params);
            return;
        }
        model.sendMessage(val);
    }

    // "##matterWorld.debugEnable"
    // => this.game.roomManager.currentRoom.matterWorld.debugEnable();
    private applyChatCommand(params: string[]) {
        if (params.length < 2) return;

        const contextStr = params[1];
        const contextMap = {
            "box": this.game.peer.physicalPeer.matterWorld,
            "log": Logger.getInstance(),
            "grids": this.game.renderPeer.gridsDebugger,
            "astar": this.game.renderPeer.astarDebugger
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
                // speaker = i18n.t("chat.mystery");
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

    private getSpeaker(id: number): IElement {
        if (id) {
            if (!this.game || !this.game.roomManager || !this.game.roomManager.currentRoom) {
                return;
            }
            return this.game.roomManager.currentRoom.getElement(id);
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
            resolve(str);
        });
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

    private get model(): PicaChat {
        return (<PicaChat>this.mModel);
    }
}

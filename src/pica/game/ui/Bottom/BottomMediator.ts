import { BasicMediator, BasicModel, Game, IElement, UIType } from "gamecore";
import { ModuleName } from "structure";
import { op_def, op_client } from "pixelpai_proto";
import { PicaChat } from "picaWorker";

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
        super.show();
    }

    public hide() {
        this.game.emitter.off("chat", this.onChatHandler, this);
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
        if (val === "whosyourdaddy") {
            this.game.uiManager.showMed("DebugLogger");
        }

        if (val === "##show matter") {
            return this.game.roomManager.currentRoom.matterWorld.debugEnable();
        }

        if (val === "##hide matter") {
            return this.game.roomManager.currentRoom.matterWorld.debugDisable();
        }
        model.sendMessage(val);
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

    private get model(): PicaChat {
        return (<PicaChat>this.mModel);
    }
}

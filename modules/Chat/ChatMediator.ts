import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../../protocol/protocols";
import {MessageType} from "../../common/const/MessageType";
import IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT;

export class ChatMediator extends MediatorBase {
    private get view(): ChatView {
        return this.viewComponent as ChatView;
    }

    public onRegister(): void {
        Globals.MessageCenter.on(MessageType.CHAT_TO, this.onHandleChat, this);
        Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.ENTER, this.onEnterHandle, this);
        this.view.bt.on("up", this.onHandleBt, this);
        super.onRegister();
    }

    public onRemove(): void {
        Globals.MessageCenter.cancel(MessageType.CHAT_TO, this.onHandleChat, this);
        Globals.Keyboard.removeListenerKeyUp(Phaser.Keyboard.ENTER, this.onEnterHandle, this);
        this.view.bt.cancel("up", this.onHandleBt);
        if (this.view.input_tf) {
          this.view.input_tf.endFocus();
        }
        super.onRemove();
    }

    private onEnterHandle(): void {
        this.onHandleBt();
    }

    private onHandleChat(chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT): void {
        this.view.out_tf.text += chat.chatContext + "\n";
        this.view.scroller.scroll();
    }

    private onHandleBt(): void {
        if (this.view.inputValue === "") {
            return;
        }
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
        let content: IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
        content.chatChannel = 0;
        content.chatContext = this.view.inputValue;
        this.view.inputValue = "";
        Globals.SocketManager.send(pkt);
        this.view.input_tf.startFocus();
    }
}

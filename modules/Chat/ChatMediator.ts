import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "../../../protocol/protocols";
import IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT;
import {MessageType} from "../../common/const/MessageType";

export class ChatMediator extends MediatorBase {
    private get view(): ChatView {
        return this.viewComponent as ChatView;
    }

    public onRegister(): void {
        Globals.MessageCenter.on(MessageType.CHAT_TO, this.onHandleChat, this);
        this.view.bt.events.onInputUp.add(this.onHandleBt, this);
        this.view.bt.events.onInputOver.add(this.onHandleOver, this);
        this.view.bt.events.onInputOut.add(this.onHandleOut, this);
    }

    public onRemove(): void {
        Globals.MessageCenter.cancel(MessageType.CHAT_TO, this.onHandleChat, this);
        this.view.bt.events.onInputUp.remove(this.onHandleBt, this);
        this.view.bt.events.onInputOver.remove(this.onHandleOver, this);
        this.view.bt.events.onInputOut.remove(this.onHandleOut, this);
        super.onRemove();
    }

    private onHandleChat(chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT): void {
        this.view.out_tf.text += chat.chatContext + "\n";
    }

    private onHandleOver(): void {
        Globals.MouseMod.pause();
    }

    private onHandleOut(): void {
        Globals.MouseMod.resume();
    }

    private onHandleBt(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
        let content: IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
        content.chatChannel = 0;
        content.chatContext = this.view.inputValue;
        this.view.inputValue = "";
        Globals.SocketManager.send(pkt);
    }
}

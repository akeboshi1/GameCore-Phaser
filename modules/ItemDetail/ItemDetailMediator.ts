import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ItemDetailView} from "./view/ItemDetailView";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {PBpacket} from "net-socket-packet";
import Globals from "../../Globals";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;

export class ItemDetailMediator extends MediatorBase {
    private get view(): ItemDetailView {
        return this.viewComponent as ItemDetailView;
    }

    public onRegister(): void {
        super.onRegister();
        this.initView();
        this.view.m_Bt.on("up", this.onHandleBt, this);
    }

    public onRemove(): void {
        super.onRemove();
        this.view.m_Bt.cancel("up", this.onHandleBt, this);
    }

    private onHandleBt(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.param[0];
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = param.id;
        if (param.button.length > 0) {
            content.componentId = param.button[0].node.id;
        }

        Globals.SocketManager.send(pkt);
    }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.param[0];

        if (param.display.length > 0) {
            this.view.loadIcon(param.display[0]);
        }

        if (param.text.length > 0) {
            this.view.m_Text.text = param.text[0].text;
            Globals.Tool.formatChinese(this.view.m_Text, 608);
        }

        if (param.button.length > 0) {
            this.view.m_Bt.setText(param.button[0].text);
        }
    }
}

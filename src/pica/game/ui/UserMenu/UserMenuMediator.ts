import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { MessageType, ModuleName } from "structure";
export class UserMenuMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.USERMENU_NAME, game);
    }

    show() {
    }
    // show(param?: any) {
    //     super.show(param);
    //     this.game.emitter.on(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
    // }
    // hide(): void {
    //     this.mShow = false;
    //     this.game.emitter.off(MessageType.SCENE_BACKGROUND_CLICK, this.onClosePanel, this);
    //     if (this.mView) {
    //         this.mView.off("menuClick", this.onClickMenuHandler, this);
    //         this.mView.hide();
    //         this.mView = null;
    //     }
    // }

    // isSceneUI(): boolean {
    //     return false;
    // }

    // isShow(): boolean {
    //     return false;
    // }

    // update(param?: any): void {
    //     if (this.mView) this.mView.update(param[0]);
    // }

    // destroy() {
    //     super.destroy();
    //     if (this.mView) {
    //         this.mView.destroy();
    //         this.mView = null;
    //     }
    //     this.mScene = null;
    // }

    // private onClickMenuHandler(targetNode) {
    //     if (!this.mView) return;
    //     const uiNode: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mView.getData("data");
    //     if (!targetNode || !uiNode || !this.world || !this.world.connection) return;
    //     this.hide();
    //     if (targetNode.platformid) {
    //         if (targetNode.text === "关注") {
    //             this.world.httpService.follow(targetNode.platformid);
    //         } else if (targetNode.text === "取消关注") {
    //             this.world.httpService.unfollow(targetNode.platformid);
    //         }
    //         return;
    //     }
    //     const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    //     const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    //     content.uiId = uiNode.id;
    //     content.componentId = targetNode.id;
    //     this.world.connection.send(pkt);
    // }

    // private onClosePanel(pointer, gameObject) {
    //     this.hide();
    // }

}

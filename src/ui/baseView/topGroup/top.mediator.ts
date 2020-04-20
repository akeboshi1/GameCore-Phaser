import { BaseFaceMediator } from "../baseFace.mediator";
import { WorldService } from "../../../game/world.service";
import { TopBtnGroup } from "./top.btn.group";
import { RankMediator } from "../../Rank/RankMediator";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";

export class TopMediator extends BaseFaceMediator {
    public static NAME: string = "TopMediator";
    private refreshMedList: string[];
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld, scene);
    }

    public preRefreshBtn(medName: string) {
        if (!this.refreshMedList) this.refreshMedList = [];
        this.refreshMedList.push(medName);
    }

    public refreshBtn(medName: string, addBoo: boolean) {
        const topBtnGroup: TopBtnGroup = this.mView as TopBtnGroup;
        switch (medName) {
            case RankMediator.NAME:
                if (addBoo) {
                    topBtnGroup.addBtn({
                        key: medName, bgResKey: "baseView", bgTextures: ["btnGroup_red_normal.png", "btnGroup_red_light.png", "btnGroup_red_select.png"],
                        iconResKey: "baseView", iconTexture: "btnGroup_rank_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json", callBack: () => {
                            const med = this.world.uiManager.getMediator(medName);
                            if (med) {
                                // 该判断条件用于某些常驻界面ui在移动端需要手动打开，客户端将此逻辑修改为通过后端发送的showui数据将入口按钮变成是否常驻
                                // 好处在于移动端客户端界面让玩家自行选择是否打开，减少ui布局混乱的情况
                                const param = med.getParam();
                                med.show(param);
                            } else {
                                // todo 该判断条件用于热发布活动，后端需要在pi中加一条活动按钮数据，不包含med具体代码，只有name，btnres等数据即可，等需要打开界面时在请求具体数据
                                // 客户端只需要发送medname给后端，后端发送showui给客户端，好处在于每次打开都是请求后端打开界面，活动数据是实时的
                            }
                        }
                    });
                } else {
                    topBtnGroup.removeBtn(medName);
                }
                break;
            case "EnterDecorate":
                if (addBoo) {
                    topBtnGroup.addBtn({
                        key: medName, bgResKey: "baseView", bgTextures: ["btnGroup_red_normal.png", "btnGroup_red_light.png", "btnGroup_red_select.png"],
                        iconResKey: "baseView", iconTexture: "btnGroup_rank_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json", callBack: () => {
                            this.onEnterDecorate();
                        }
                    });
                } else {
                    topBtnGroup.removeBtn(medName);
                }
                break;
            case "SaveDecorate":
                if (addBoo) {
                    topBtnGroup.addBtn({
                        key: medName, bgResKey: "baseView", bgTextures: ["btnGroup_red_normal.png", "btnGroup_red_light.png", "btnGroup_red_select.png"],
                        iconResKey: "baseView", iconTexture: "btnGroup_rank_icon.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json", callBack: () => {
                            this.onEnterDecorate();
                        }
                    });
                } else {
                    topBtnGroup.removeBtn(medName);
                }
                break;
        }
    }

    public tweenView(show: boolean) {
        if (this.mView) (this.mView as TopBtnGroup).tweenView(show);
    }

    public show(param?: any) {
        if (this.mView && this.isShow()) {
            return;
        }
        this.mView = new TopBtnGroup(this.mScene, this.world);
        this.mView.show(param);
        super.show(param);
        if (this.refreshMedList) {
            this.refreshMedList.forEach((medName: string) => {
                this.refreshBtn(medName, true);
            });
        }
    }

    public hide() {
        this.mShow = false;
        if (this.refreshMedList) {
            this.refreshMedList.forEach((medName: string) => {
                this.refreshBtn(medName, false);
            });
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = null;
        }
    }

    public addBtn(data: any) {
        if (this.mView) (this.mView as TopBtnGroup).addBtn(data);
    }

    private onEnterDecorate() {
        if (this.world && this.world.connection) {
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER);
            this.world.connection.send(packet);
        }
    }

    private onSaveDecorate() {
        if (this.world && this.world.connection) {
            // Alert.
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SAVE);
            this.world.connection.send(packet);
        }
    }
}

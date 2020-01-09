import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { IAbstractPanel } from "../abstractPanel";
import { Size } from "../../utils/size";
import { MessageType } from "../../const/MessageType";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { MainUIMobile } from "./mobile/mainUI.mobile";
import { MainUIPC } from "./pc/mainUI.pc";
import { JoyStickManager } from "../../game/joystick.manager";
import { TopBtnGroup } from "./mobile/top.btn.group";
import { UIType } from "../ui.manager";

export class MainUIMediator extends BaseMediator {
    public static NAME: string = "MainUIMediator";
    public world: WorldService;
    private mScene: Phaser.Scene;
    private refreshMedList: string[];
    constructor(mWorld: WorldService, scene: Phaser.Scene) {
        super(mWorld);
        this.world = mWorld;
        this.mScene = scene;
        this.mUIType = UIType.BaseUIType;
    }

    public preRefreshBtn(medName: string) {
        if (!this.refreshMedList) this.refreshMedList = [];
        this.refreshMedList.push(medName);
    }

    public refreshBtn(medName: string, addBoo: boolean) {
        switch (medName) {
            case "RankMediator":
                const topBtnGroup: TopBtnGroup = (this.mView as MainUIMobile).getTopView();
                if (addBoo) {
                    topBtnGroup.addBtn({ medKey: medName, bgTextureList: ["btnGroup_red_normal.png", "btnGroup_red_light.png", "btnGroup_red_select.png"], iconTexture: "btnGroup_rank_icon.png" });
                } else {
                    topBtnGroup.removeBtn({ medKey: medName });
                }
                break;
        }
    }

    public setUiScale(value: number) {
        this.mView.scaleX = this.mView.scaleY = value;
    }

    public isSceneUI(): boolean {
        return true;
    }

    public isShow(): boolean {
        if (this.mView) {
            return this.mView.isShow();
        }
    }

    public resize() {
        if (this.mView) this.mView.resize(this.mAddWid, this.mAddHei);
    }

    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any) {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        const size: Size = this.world.getSize();
        if (this.world.game.device.os.desktop) {
            this.mView = new MainUIPC(this.mScene, this.world, (size.width >> 1) - 29, size.height - 50);
        } else {
            this.mView = new MainUIMobile(this.mScene, this.world);
        }
        this.mView.show(param);
        this.world.emitter.on(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.emitter.on(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.on(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
        // this.world.game.scale.on("orientationchange", this.orientationChange, this);
        super.show(param);
        if (this.refreshMedList) {
            this.refreshMedList.forEach((medName: string) => {
                this.refreshBtn(medName, true);
            });
        }
    }

    public update(param: any) {
        if (this.mView) this.mView.update(param);
    }

    public hide() {
        this.isShowing = false;
        // this.world.game.scale.off("orientationchange", this.orientationChange, this);
        this.world.emitter.off(MessageType.QUERY_PACKAGE, this.queryPackAge, this);
        this.world.emitter.off(MessageType.UPDATED_CHARACTER_PACKAGE, this.heroItemChange, this);
        this.world.emitter.off(MessageType.PACKAGE_ITEM_ADD, this.heroItemChange, this);
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

    public destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
        this.mScene = null;
        this.world = null;
    }

    public tweenView(show: boolean) {
        if (!this.mView) return;
        if (!this.world.game.device.os.desktop) {
            (this.world.inputManager as JoyStickManager).tweenView(show);
        }
        (this.mView as MainUIMobile).tweenView(show);
    }

    // private orientationChange() {
    //     if (this.world.game.device.os.desktop) return;
    //     (this.mView as MainUIMobile).changeOrientation(this.world.game.scale.orientation);
    // }

    private heroItemChange() {
        const itemList: op_gameconfig.IItem[] = this.world.roomManager.currentRoom.playerManager.actor.package.items;
        if (this.mView) {
            if (this.world.game.device.os.desktop) {
                (this.mView as MainUIPC).setDataList(itemList);
            } else {
                (this.mView as MainUIMobile).setDataList(itemList);
            }
        }
    }

    private queryPackAge(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        if (data.id !== this.world.roomManager.currentRoom.playerManager.actor.package.id) return;
        const itemLen: number = data.items.length;
        if (this.mView && this.world.game.device.os.desktop) {
            (this.mView as MainUIPC).setDataList(data.items);
        }
    }
}

import {Panel} from "../components/panel";
import {BlackButton, Border, Url} from "../../utils/resUtil";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";
import { op_client, op_gameconfig_01 } from "pixelpai_proto";
import { MenuItem } from "./MenuItem";

export class UserMenuPanel extends Panel {
    private mBackground: NinePatch;
    private mMenus: MenuItem[] = [];
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    show(param?: any) {
        super.show(param);
        if (!this.scene) {
            return;
        }
        this.setData("data", param);
        this.x = this.scene.input.activePointer.x;
        this.y = this.scene.input.activePointer.y;
    }

    public addItem(params: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        this.clear();
        const menu: op_gameconfig_01.IMenuItem[] = params.menuItem;
        for (let i = 0; i < menu.length; i++) {
            const btn = this.appendItem(menu[i], 0, i * 32);
            this.add(btn);
            this.mMenus.push(btn);
        }
        this.resizeBackground(60, this.mMenus.length * 30);
    }

    protected preload() {
        this.mScene.load.image(BlackButton.getName(), BlackButton.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        super.preload();
    }

    protected init() {
        this.mBackground = new NinePatch(this.scene, {
            width: 1,
            height: 1,
            key: Border.getName(),
            columns: Border.getColumns(),
            rows: Border.getRows(),
        }, false);
        this.add(this.mBackground);
        super.init();
    }

    private appendItem(menu: op_gameconfig_01.IMenuItem, x: number, y: number): MenuItem {
        const item = new MenuItem(this.scene, x, y);
        item.setData("node", menu.node);
        item.setInteractive();
        item.on("pointerup", this.onClickMenu, this);
        if (menu.child.length > 0) {
            const menuChild = menu.child;
            for (const child of menuChild) {
                const btn = this.appendItem(child, 0, item.menus.length * 32);
                item.appendItem(btn);
            }
        }
        return item;
    }

    private onClickMenu(pointer, target: MenuItem) {
        if (!target) {
            return;
        }
        if (target.menus.length > 0) {
            target.show();
        } else {
            this.emit("menuClick", target.getData("node"));
        }
    }

    private resizeBackground(width: number, height: number) {
        if (this.mBackground) {
            this.mBackground.resize(width, height);
        }
    }

    private clear() {
        for (const menu of this.mMenus) {
            this.remove(menu);
            menu.off("pointerup", this.onClickMenu, this);
            menu.destroy();
        }
        this.mMenus.length = 0;
    }
}

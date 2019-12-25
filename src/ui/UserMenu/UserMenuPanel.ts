import { Panel } from "../components/panel";
import { BlackButton, Border, TransparentButton, Url } from "../../utils/resUtil";
import { op_client, op_gameconfig_01 } from "pixelpai_proto";
import { MenuItem } from "./MenuItem";
import { WorldService } from "../../game/world.service";
import { NinePatch } from "../components/nine.patch";

export class UserMenuPanel extends Panel {
    private mBackground: NinePatch;
    private mMenus: MenuItem[] = [];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mWorld = world;
    }

    show(param?: any) {
        super.show(param);
        if (!this.scene) {
            return;
        }
        this.setData("data", param);
        this.addItem(param);
        this.x = this.scene.input.activePointer.x + 32;
        this.y = this.scene.input.activePointer.y + 32;
        this.scene.input.on("gameobjectdown", this.onClickMenu, this);
    }

    hide() {
        this.scene.input.off("gameobjectdown", this.onClickMenu, this);
        this.removeInteractive();
        this.clear();
        super.hide();
    }

    setSize(width: number, height: number): this {
        super.setSize(width, height);
        this.setInteractive();
        if (this.mBackground) {
            this.mBackground.resize(width, height);
            // this.mBackground.x = this.mBackground.width * this.originX;
            // this.mBackground.y = this.mBackground.height * this.originY;
        }
        return this;
    }

    public destroy() {
        if (this.mBackground) {
            this.mBackground.destroy();
        }
        if (this.mMenus) {
            const len: number = this.mMenus.length;
            for (let i: number = 0; i < len; i++) {
                let item: MenuItem = this.mMenus[i];
                if (item) continue;
                item.destroy(true);
                item = null;
            }
            this.mMenus = [];
        }
        super.destroy();
    }

    public addItem(params: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (!this.mInitialized) return;
        this.clear();
        const menu: op_gameconfig_01.IMenuItem[] = params.menuItem;
        for (let i = 0; i < menu.length; i++) {
            const btn = this.appendItem(menu[i], 0, i * 32);
            this.add(btn);
            this.mMenus.push(btn);
        }
        // this.resizeBackground(60, this.mMenus.length * 30);
        // this.resizeBackground(60, this.mMenus.length * 32);
        this.setSize(70, this.mMenus.length * 30);

        const mainPlayer = this.mWorld.roomManager.currentRoom.getHero().model;
        if (!mainPlayer) return;
        const actor = params.actors[0];
        if (!actor) return;
        if (mainPlayer.platformId !== actor.platformId) {
            const fn = { text: "关注", platformid: actor.platformId };
            const follow = this.appendItem({ text: "关注", node: undefined }, 0, this.mMenus.length * 31);
            follow.setData("node", fn);
            this.add(follow);
            this.mMenus.push(follow);
            this.mWorld.httpService.checkFollowed([actor.platformId])
                .then((response: any) => {
                    if (response.code === 200) {
                        const data = response.data;
                        if (data.length > 0) {
                            follow.setText("取消关注");
                        }
                        fn.text = follow.getText();
                        follow.setData("node", fn);
                    }
                });
        }
    }

    protected preload() {
        this.scene.load.image(BlackButton.getName(), BlackButton.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("usermenu_arrow", Url.getRes("ui/usermenu/arrow.png"));
        this.scene.load.atlas(TransparentButton.getName(), TransparentButton.getPNG(), TransparentButton.getJSON());
        super.preload();
    }

    protected init() {
        this.mBackground = new NinePatch(this.scene, 0, 0, 70, 30, Border.getName(), null, Border.getConfig());
        this.add(this.mBackground);
        // this.mBackground.x = this.mBackground.width * this.mBackground.originX;
        // this.mBackground.y = this.mBackground.height * this.mBackground.originY;
        super.init();
        this.addItem(this.getData("data"));
    }

    private appendItem(menu: op_gameconfig_01.IMenuItem, x: number, y: number): MenuItem {
        const item = new MenuItem(this.scene, 0, 0, 59, 29, TransparentButton.getName(), menu.text, TransparentButton.getConfig());
        item.x = x;
        item.y = y - (item.height >> 1);
        item.setData("node", menu.node);
        if (menu.child && menu.child.length > 0) {
            const menuChild = menu.child;
            for (let i: number = 0, len = menuChild.length; i < len; i++) {
                const child = menuChild[i];
                // parent的宽，高需要加入
                const btn = this.appendItem(child, 31 + 42, i * 31 - 31 / 2 + this.mMenus.length * 31);
                item.appendItem(btn);
            }

        }
        return item;
    }

    private onClickMenu(pointer, gameobject) {
        if (gameobject instanceof MenuItem) {
            if (gameobject.menus.length > 0) {
                gameobject.show();
            } else {
                this.emit("menuClick", gameobject.getData("node"));
            }
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
            menu.off("pointerup", this.onClickMenu);
            menu.destroy();
        }
        this.mMenus.length = 0;
    }
}

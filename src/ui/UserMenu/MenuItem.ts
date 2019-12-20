import { NinePatchButton } from "../components/ninepatch.button";
import { IPatchesConfig } from "../components/patches.config";
import { NinePatch } from "../components/nine.patch";
import { Border } from "../../utils/resUtil";

export class MenuItem extends NinePatchButton {
    protected mMenus: MenuItem[];
    protected mChild: Phaser.GameObjects.Container;
    protected mArrow: Phaser.GameObjects.Image;
    protected mBackground: NinePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, text: string, config: IPatchesConfig) {
        super(scene, x, y, width, height, key, text, config);
    }

    public appendItem(menu: MenuItem) {
        if (!this.mChild) {
            this.mMenus = [];
            this.mChild = this.scene.make.container(undefined, false);
            this.mChild.x = 42;
            this.mArrow = this.scene.make.image({
                x: this.width * this.originX - 3,
                key: "usermenu_arrow"
            });
            this.add(this.mArrow);
            this.mBackground = new NinePatch(this.scene, 0, 0, 0, 0, Border.getName(), null, Border.getConfig());
            this.mChild.add(this.mBackground);
        }

        this.mChild.add(menu);
        this.mMenus.push(menu);

        this.mBackground.resize(70, this.mMenus.length * 32);
        this.mBackground.x = this.mBackground.width * this.mBackground.originX;
        this.mBackground.y = this.mBackground.height * this.mBackground.originY;
    }

    public show() {
        this.add(this.mChild);
    }

    public destroy(fromScene?: boolean): void {
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
        if (this.mBackground) {
            this.mBackground.destroy();
            this.mBackground = null;
        }
        if (this.mChild) {
            this.mChild.destroy(true);
            this.mChild = null;
        }
        if (this.mArrow) {
            this.mArrow.destroy(true);
            this.mArrow = null;
        }
        super.destroy(fromScene);
    }

    get menus(): MenuItem[] {
        return this.mMenus || [];
    }
}

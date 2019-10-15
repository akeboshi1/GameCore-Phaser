import { NinePatchButton } from "../components/ninepatch.button";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";

export class MenuItem extends NinePatchButton {
    protected mMenus: MenuItem[];
    protected mChild: Phaser.GameObjects.Container;
    protected mArrow: Phaser.GameObjects.Image;
    protected mBackground: NinePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, config: object, text: string) {
        super(scene, x, y, config, text);
    }

    public appendItem(menu: MenuItem) {
        if (!this.mChild) {
            this.mMenus = [];
            this.mChild = this.scene.make.container(undefined, false);
            this.mChild.x = 65;
        }

        this.mChild.add(menu);
        this.mMenus.push(menu);
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

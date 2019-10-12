import {NinePatchButton} from "../components/ninepatch.button";
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
        super.destroy(fromScene);
    }

    get menus(): MenuItem[] {
        return this.mMenus || [];
    }
}

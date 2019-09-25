import GameObjects = Phaser.GameObjects;
import {Logger} from "../../utils/log";
import Scroller from "../../../lib/rexui/plugins/input/scroller/Scroller";

export class ScrollerContainer extends Phaser.GameObjects.Container {
    private mMask: GameObjects.Graphics;
    private mScroller: Scroller;
    constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle, target: GameObjects.Container | GameObjects.Text | GameObjects.Sprite) {
        super(scene);
        if (!target) {
            Logger.error("scroller target does not exise");
            return;
        }

        this.mMask = this.scene.make.graphics(undefined, false)
            .fillStyle(0x000033, 1)
            .fillRect(rect.x, rect.y, rect.width, rect.height)
            .setInteractive(rect, Phaser.Geom.Rectangle.Contains);

        this.add(this.mMask);
        target.setMask(this.mMask.createGeometryMask());

        this.add(target);

        this.mScroller = new Scroller(this.mMask, {
            valuechangeCallback: (newValue) => {
                target.y = newValue;
            }
        });
    }
}

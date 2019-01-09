import {VisualComponent} from "../../base/VisualComponent";
import {IResizeObject} from "../../base/IResizeObject";

export class ModuleViewBase extends VisualComponent implements IResizeObject {
    constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent || null);
        this.preInit();
        this.init();
        this.onResize();
    }

    public onResize(): void {}

    protected preInit(): void {}

    protected init(): void {}
}
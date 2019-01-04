import {VisualComponent} from "../../base/VisualComponent";

export class ModuleViewBase extends VisualComponent {
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
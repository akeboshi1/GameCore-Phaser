/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";

export class LayerManager extends BaseSingleton {
    private game: Phaser.Game;
    public container: Phaser.Group;
    public sceneLayer: Phaser.Group;
    public animationLayer: Phaser.Group;
    public uiLayer: Phaser.Group;
    public dialogLayer: Phaser.Group;
    public tipLayer: Phaser.Group;
    public textLineSliderLayer: Phaser.Group;
    public debugLayer: Phaser.Group;

    public init(game: Phaser.Game): void {
        this.game = game;

        this.container = game.add.group();

        this.sceneLayer = new Phaser.Group(game, this.container, "sceneLayer");

        this.textLineSliderLayer = new Phaser.Group(game, this.container, "textLineSliderLayer");
        this.textLineSliderLayer.fixedToCamera = true;

        this.animationLayer = new Phaser.Group(game, this.container, "animationLayer");
        this.animationLayer.fixedToCamera = true;

        this.uiLayer = new Phaser.Group(game, this.container, "uiLayer");
        this.uiLayer.fixedToCamera = true;

        this.tipLayer = new Phaser.Group(game, this.container, "tipLayer");
        this.tipLayer.fixedToCamera = true;

        this.dialogLayer = new Phaser.Group(game, this.container, "dialogLayer");
        this.dialogLayer.fixedToCamera = true;

        this.debugLayer = new Phaser.Group(game, this.container, "debugLayer");
        this.debugLayer.fixedToCamera = true;

        this.layout();
    }

    public layout(): void {
        // let graphics = Globals.game.add.graphics();
        // graphics.clear();
        // graphics.beginFill(0xff0000);
        // graphics.drawCircle(100,100,100);
        // graphics.endFill();
        // this.container.add(graphics);
    }
}

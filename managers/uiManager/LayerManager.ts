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

        this.sceneLayer = new Phaser.Group(game);

        this.textLineSliderLayer = new Phaser.Group(game);

        this.animationLayer = new Phaser.Group(game);

        this.uiLayer = new Phaser.Group(game);

        this.tipLayer = new Phaser.Group(game);

        this.dialogLayer = new Phaser.Group(game);

        this.debugLayer = new Phaser.Group(game);

        this.container.add(this.sceneLayer);
        this.container.add(this.uiLayer);
        this.container.add(this.textLineSliderLayer);
        this.container.add(this.animationLayer);
        this.container.add(this.tipLayer);
        this.container.add(this.dialogLayer);
        this.container.add(this.debugLayer);

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

/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import Globals from "../../Globals";
import BasicSprite from "../../display/BasicSprite";

export class LayerManager extends BaseSingleton {
    private game: Phaser.Game;
    public container: Phaser.Sprite;
    public sceneLayer: Phaser.Group;
    public animationLayer: Phaser.Group;
    public uiLayer: Phaser.Group;
    public dialogLayer: Phaser.Group;
    public tipLayer: Phaser.Group;
    public textLineSliderLayer: Phaser.Group;
    public debugLayer: Phaser.Group;

    public init(game: Phaser.Game): void {
        this.game = game;

        this.container = game.add.sprite(0,0);

        this.sceneLayer = new Phaser.Group(game);

        this.textLineSliderLayer = new Phaser.Group(game);

        this.animationLayer = new Phaser.Group(game);

        this.uiLayer = new Phaser.Group(game);

        this.tipLayer = new Phaser.Group(game);

        this.dialogLayer = new Phaser.Group(game);

        this.debugLayer = new Phaser.Group(game);

        this.container.addChild(this.sceneLayer);
        this.container.addChild(this.uiLayer);
        this.container.addChild(this.textLineSliderLayer);
        this.container.addChild(this.animationLayer);
        this.container.addChild(this.tipLayer);
        this.container.addChild(this.dialogLayer);
        this.container.addChild(this.debugLayer);

        this.layout();
    }

    public layout(): void {

    }
}

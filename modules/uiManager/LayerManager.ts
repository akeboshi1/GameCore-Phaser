/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import BasicSprite from '../../display/BasicSprite';
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;

export class LayerManager extends BaseSingleton {
    public game: Game;
    public container: Sprite;
    public sceneLayer: BasicSprite;
    public animationLayer: BasicSprite;
    public uiLayer: BasicSprite;
    public dialogLayer: BasicSprite;
    public tipLayer: BasicSprite;
    public textLineSliderLayer: BasicSprite;
    public debugLayer: BasicSprite;

    public init(game: Game): void {
        this.game = game;

        this.container = new Sprite(game, 1, 1);

        this.sceneLayer = new Sprite(game, 1, 1);

        this.textLineSliderLayer = new Sprite(game, 1, 1);

        this.animationLayer = new Sprite(game, 1, 1);

        this.uiLayer = new Sprite(game, 1, 1);

        this.tipLayer = new Sprite(game, 1, 1);

        this.dialogLayer = new Sprite(game, 1, 1);

        this.debugLayer = new Sprite(game, 1, 1);

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

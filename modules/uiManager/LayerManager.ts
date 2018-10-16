/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import Globals from "../../Globals";
import BasicSprite from "../../display/BasicSprite";

export class LayerManager extends BaseSingleton {
    public stage: Phaser.Stage;
    public container: Phaser.Sprite;
    public sceneLayer: BasicSprite;
    public animationLayer: BasicSprite;
    public uiLayer: BasicSprite;
    public dialogLayer: BasicSprite;
    public tipLayer: BasicSprite;
    public textLineSliderLayer: BasicSprite;
    public debugLayer: BasicSprite;

    public init(stage: Phaser.Stage): void {
        this.stage = stage;

        this.container = Globals.game.add.sprite(0,0);

        this.sceneLayer = new BasicSprite();

        this.textLineSliderLayer = new BasicSprite();

        this.animationLayer = new BasicSprite();

        this.uiLayer = new BasicSprite();

        this.tipLayer = new BasicSprite();

        this.dialogLayer = new BasicSprite();

        this.debugLayer = new BasicSprite();

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

/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import DisplayObjectContainer = PIXI.DisplayObjectContainer;

export class LayerManager extends BaseSingleton {
    public stage: Phaser.Stage;
    public container: DisplayObjectContainer;
    public sceneLayer: DisplayObjectContainer;
    public animationLayer: DisplayObjectContainer;
    public uiLayer: DisplayObjectContainer;
    public dialogLayer: DisplayObjectContainer;
    public tipLayer: DisplayObjectContainer;
    public textLineSliderLayer: DisplayObjectContainer;
    public debugLayer: DisplayObjectContainer;

    public init(stage: Phaser.Stage): void {
        this.stage = stage;

        this.container = new DisplayObjectContainer();

        this.sceneLayer = new DisplayObjectContainer();

        this.textLineSliderLayer = new DisplayObjectContainer();

        this.animationLayer = new DisplayObjectContainer();

        this.uiLayer = new DisplayObjectContainer();

        this.tipLayer = new DisplayObjectContainer();

        this.dialogLayer = new DisplayObjectContainer();

        this.debugLayer = new DisplayObjectContainer();

        this.container.addChild(this.sceneLayer);
        this.container.addChild(this.uiLayer);
        this.container.addChild(this.textLineSliderLayer);
        this.container.addChild(this.animationLayer);
        this.container.addChild(this.tipLayer);
        this.container.addChild(this.dialogLayer);
        this.container.addChild(this.debugLayer);
        this.stage.add(this.container);

        this.layout();
    }

    public layout(): void {

    }
}

import {IAnimatedObject} from "./IAnimatedObject";
import {IEntityComponent} from "./IEntityComponent";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";
import { BubbleContainer } from "../modules/Scene/chat-bubble/BubbleContainer";
import { op_client } from "pixelpai_proto";
import { Point } from "phaser-ce";

export class BasicAvatar extends Phaser.Plugin.Isometric.IsoSprite implements IAnimatedObject, IEntityComponent, IDisposeObject {

    protected myData: any = null;
    protected mInitilized = false;
    protected mLoaderAvatar: any;
    protected mBubble: BubbleContainer;
    private _owner: any;

    public constructor(game: Phaser.Game) {
        super(game, 0, 0, 0);
    }

    public get initilized(): boolean {
        return this.mInitilized;
    }

    public getOwner(): any {
        return this._owner;
    }

    public setOwner(value: any) {
        this._owner = value;
    }

    public initialize(value: any = null): void {
        if (!this.initilized) {
            this.myData = value;
            this.onInitialize();
            this.mInitilized = true;
            this.onInitializeComplete();
        }
    }

    public onDispose(): void {
        if (this.initilized) {
            this.myData = null;
            this._owner = null;
            this.mInitilized = false;
        }
    }

    public addBubble(text: string, bubble: op_client.IChat_Setting, offsetX?: number, offserY?: number) {
        if (!!this.mBubble === false) {
            this.initBubble(offsetX, offserY);
        }
        this.mBubble.addBubble(text, bubble);
        if (this.mLoaderAvatar.headBitmapdata) {
            // test;
            let image = this.game.make.image(0, 0, this.mLoaderAvatar.headBitmapdata);
            this.addChild(image);
        }
    }

    public removeBubble() {
        this.mBubble.hideBubble();
    }

    // IAnimatedObject Interface
    public onFrame(): void {
    }

    public onClear(): void {
    }

    protected onInitialize(): void {
    }

    protected onInitializeComplete(): void {
    }

    protected initBubble(offsetX?: number, offsetY?: number) {
        this.mBubble = new BubbleContainer(this.game, this);
        // this.mBubble.pivot = new Point(0.5);
        this.mBubble.x = offsetX ? offsetX : -60;
        this.mBubble.y = offsetY ? offsetY : -this.height;
    }
}

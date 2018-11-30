import Globals from "../../../Globals";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import SceneEntity from "../view/SceneEntity";
import {Const} from "../../../common/const/Const";
import ModelStateType = Const.ModelStateType;
import {IAnimatedObject} from "../../../base/IAnimatedObject";

export default class BasicElement extends SceneEntity {
    protected baseLoc3: Phaser.Point;
    protected baseLoc5: Phaser.Point;
    protected baseLoc7: Phaser.Point;
    protected baseLoc1: Phaser.Point;

    protected baseLoc: Phaser.Point;
    protected mAnimationDirty: boolean = false;
    protected myAnimationName: string = ModelStateType.ELEMENT_IDEL;

    public constructor() {
        super();
    }

    public get elementInfo(): ElementInfo {
        return this.data;
    }

    public setAnimation(value: string): void {
        // Log.trace("角度-->"+value);
        if (this.myAnimationName !== value) {
            this.myAnimationName = value;

            this.invalidAnimation();
        }
    }

    public loadModel(url: string) {
        (<BasicElementAvatar>this.display).loadModel(url, this, null, this.onLoadComplete);
    }

    public getBaseLoc(value: number): Phaser.Point {
        if (value === 3) return this.baseLoc3;
        else if (value === 1) return this.baseLoc1;
        else if (value === 5) return this.baseLoc5;
        else return this.baseLoc7;
    }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    protected createDisplay() {
        let element = new BasicElementAvatar(Globals.game);
        return element;
    }

    protected onUpdating(deltaTime: number): void {
        if (this.mAnimationDirty) {
            this.onAvatarAnimationChanged();
            this.mAnimationDirty = false;
        }

        super.onUpdating(deltaTime);
    }

    protected onInitialize() {
        super.onInitialize();
        this.mySpeed = this.elementInfo.speed;
        this.initBaseLoc();
        this.setAngleIndex(this.elementInfo.dir);
        this.setPosition(this.elementInfo.x, this.elementInfo.y, this.elementInfo.z);
        this.loadModel(this.elementInfo.type.toString());
    }

    protected onUpdated(deltaTime: number): void {
        super.onUpdated(deltaTime);
        this.baseLoc = this.getBaseLoc(this.angleIndex);
    }

    protected onUpdatingDisplay(deltaTime: number): void {

        let p3 = Globals.Room45Util.p2top3(this.ox, this.oy, this.oz);
        // Log.trace(p3.x,p3.y,p3.z);
        this.display.isoX = p3.x - (this.baseLoc ? this.baseLoc.x : 0);
        this.display.isoY = p3.y - (this.baseLoc ? this.baseLoc.y : 0);
        this.display.isoZ = p3.z;
        // let graphics = Globals.game.make.graphics();
        // graphics.clear();
        // // graphics.lineStyle(1, 0x00ff00, 1);
        // graphics.beginFill(0x0000ff);
        // graphics.drawCircle(this.baseLoc ? this.baseLoc.x : 0, this.baseLoc ? this.baseLoc.y : 0, 5);
        // graphics.endFill();
        // this.display.addChild(graphics);
        // Log.trace(this.display.isoX,this.display.isoY,this.display.isoZ);
        if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicElementAvatar>this.display).gotoAndPlay( this.myIsWalking ? Const.ModelStateType.ELEMENT_WALK : this.myAnimationName);
    }

    protected onLoadComplete(): void {
        (<BasicElementAvatar>this.display).initAnimations(this.elementInfo.animations);
        this.invalidAnimation();
    }

    private initBaseLoc(): void {
        //图片坐标
        let ary: Array<string> = this.elementInfo.baseLoc.split("&");
        let tmp: Array<string> = ary[0].split(" ");
        this.baseLoc3 = new Phaser.Point(+(tmp[0]), +(tmp[1]));
        if (this.elementInfo.dirable.length === 4) {
            if (ary.length > 1) {
                tmp = ary[1].split(" ");
                this.baseLoc7 = new Phaser.Point(+(tmp[0]), +(tmp[1]));
            } else {
                this.baseLoc7 = this.baseLoc3.clone();
            }
        }
    }
}
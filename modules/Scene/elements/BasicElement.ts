import Globals from "../../../Globals";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import SceneEntity from "../view/SceneEntity";
import {Const} from "../../../common/const/Const";
import ModelStateType = Const.ModelStateType;
import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {op_gameconfig} from "../../../../protocol/protocols";

export default class BasicElement extends SceneEntity {
    protected baseLoc: Phaser.Point;
    protected mAnimationDirty: boolean = false;
    protected mScaleX: number = 1;
    protected mScaleY: number = 1;
    protected myAnimationName: string = ModelStateType.ELEMENT_IDLE;

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

    public loadModel(value: ElementInfo) {
        (<BasicElementAvatar>this.display).loadModel(value);
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
        this.loadModel(this.elementInfo);
        this.setAnimation(ModelStateType.ELEMENT_IDLE);
    }

    //Position
    public setPosition(x: number, y: number, z: number): void {
        super.setPosition(x, y, z);
        this.elementInfo.collisionArea.setPosition(x, y, z);
    }

    protected onUpdated(deltaTime: number): void {
        super.onUpdated(deltaTime);
        // this.baseLoc = this.getBaseLoc(this.angleIndex);
    }

    protected onUpdatingDisplay(deltaTime: number): void {
        let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);

        this.display.isoX = p3.x;
        this.display.isoY = p3.y;
        this.display.isoZ = p3.z;

        // let graphics = Globals.game.make.graphics(this.ox, this.oy);
        // graphics.clear();
        // graphics.beginFill(0x0000ff);
        // graphics.drawCircle(0, 0, 5);
        // graphics.endFill();
        // Globals.LayerManager.sceneLayer.add(graphics);

        if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicElementAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
        (<BasicElementAvatar>this.display).scaleX = this.mScaleX;
        (<BasicElementAvatar>this.display).scaleY = this.mScaleY;
    }

    private initBaseLoc(): void {
        //图片坐标
        let config: op_gameconfig.IAnimation = this.elementInfo.config;
        if (config === null) return;
        let tmp: Array<string> = config.baseLoc.split(",");
        this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
    }
}
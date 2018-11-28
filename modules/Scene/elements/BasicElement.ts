import Globals from "../../../Globals";
import {ElementInfo}  from "../../../common/struct/ElementInfo";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import SceneEntity from "../view/SceneEntity";

export default class BasicElement extends SceneEntity {
    protected mAnimationDirty: boolean = false;
    protected myAnimationName: string;
    public constructor() {
        super();
    }

    public setAnimation(value: string): void {
        // Log.trace("角度-->"+value);
        if (this.myAnimationName !== value) {
            this.myAnimationName = value;

            this.invalidAnimation();
        }
    }

    protected invalidAnimation(): void { this.mAnimationDirty = true; }

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
        this.loadModel(this.elementInfo.type.toString() );
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicElementAvatar>this.display).gotoAndPlay(this.myAnimationName);
    }

    public loadModel(url: string) {
        (<BasicElementAvatar>this.display).loadModel(url, this, null, this.onLoadComplete);
    }

    protected onLoadComplete(): void {
        (<BasicElementAvatar>this.display).initAnimations(this.elementInfo.animations);
        this.invalidAnimation();
    }

    public get elementInfo(): ElementInfo {
        return this.data;
    }
}
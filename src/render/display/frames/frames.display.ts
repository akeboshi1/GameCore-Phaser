import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { Render } from "../../render";
import { DisplayField, ElementStateType, RunningAnimation, TitleMask } from "structure";
import { IDisplayObject } from "../display.object";
import { IPos, Logger } from "utils";
import { ElementTopDisplay } from "../element.top.display";
import { DisplayMovement } from "../display.movement";
import { DragonbonesDisplay } from "../dragonbones/dragonbones.display";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends BaseFramesDisplay implements IDisplayObject {
    protected mID: number = undefined;
    protected mTitleMask: number;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected mMovement: DisplayMovement;

    private mName: string = undefined;

    constructor(scene: Phaser.Scene, private render: Render, id?: number, type?: number) {
        super(scene, id, type);
        this.mID = id;

        this.mMovement = new DisplayMovement(scene, this, render);
    }

    public startLoad(): Promise<any> {
        this.scene.load.start();
        return Promise.resolve(null);
    }

    public destroy() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        if (this.mMovement) {
            this.mMovement.destroy();
        }
        super.destroy();
    }

    public set titleMask(val: number) {
        this.mTitleMask = val;
    }

    public get titleMask(): number {
        return this.mTitleMask;
    }

    public setRootMount(gameObject: Phaser.GameObjects.Container) {
        super.setRootMount(gameObject);

        this.updateTopDisplay();
    }

    public checkCollision(sprite: any): boolean {
        const currentCollisionArea = sprite.currentCollisionArea;
        if (currentCollisionArea && currentCollisionArea.length > 0) return true;
        return false;
    }

    public async showRefernceArea(area: number[][], origin: IPos) {
        if (!area || area.length <= 0 || !origin) return;
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene);
        }
        const roomSize = await this.render.mainPeer.getCurrentRoomSize();
        this.mReferenceArea.draw(area, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
        this.addAt(this.mReferenceArea, 0);
    }

    public hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    }

    public updateTopDisplay() {
        if (this.mTopDisplay) this.mTopDisplay.update();
    }

    public showNickname(name?: string) {
        if (name === undefined) {
            name = this.mName;
        }
        this.mName = name;
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
        }
        if (!this.checkShowNickname()) return;
        this.mTopDisplay.showNickname(name);
    }

    public showTopDisplay(data?: ElementStateType) {
        if (!data) {
            if (this.mTopDisplay)
                this.mTopDisplay.destroy();
            this.mTopDisplay = undefined;
            return;
        }
        if (!this.mTopDisplay) this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
        this.mTopDisplay.loadState(data);
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
        }
        this.mTopDisplay.showBubble(text, setting);
    }

    public clearBubble() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.clearBubble();
    }

    public displayCreated() {
        super.displayCreated();
        this.render.mainPeer.elementDisplayReady(this.id);
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
    }

    public doMove(moveData: any) {
        this.mMovement.doMove(moveData);
    }

    public setPosition(x?: number, y?: number, z?: number, w?: number): this {
        super.setPosition(x, y, z, w);
        this.updateTopDisplay();
        return this;
    }

    public addEffect(display: IDisplayObject) {
        if (!display) {
            return Logger.getInstance().error("Failed to add effect, display does not exist");
        }
        const backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.addAt(backend, DisplayField.BACKEND);
        }
        const frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.addAt(frontend, DisplayField.FRONTEND);
        }
    }

    public removeEffect(display: IDisplayObject) {
        if (!display) {
            return Logger.getInstance().error("Failed to remove effect, display does not exist");
        }
        const backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.remove(backend, true);
        }
        const frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.remove(frontend, true);
        }
    }

    // public mount(display: FramesDisplay | DragonbonesDisplay, targetIndex?: number) {
    //     if (!display) return;
    //     if (this.mDisplays.size <= 0) {
    //         return;
    //     }
    //     if (!this.mCurAnimation) {
    //         return;
    //     }
    //     if (!this.mCurAnimation.mountLayer) {
    //         Logger.getInstance().error(`mountLyaer does not exist ${this.mAnimation}`);
    //         return;
    //     }
    //     const {index, mountPoint} = this.mCurAnimation.mountLayer;
    //     if (targetIndex === undefined) targetIndex = 0;
    //     if (targetIndex >= mountPoint.length) {
    //         Logger.getInstance().error("mount index does not exist");
    //         return;
    //     }
    //     let {x} = mountPoint[targetIndex];
    //     if (this.mAnimation.flip) {
    //         x = 0 - x;
    //     }
    //     display.x = x;
    //     display.y = mountPoint[targetIndex].y;

    //     if (!this.mMountContainer) {
    //         this.mMountContainer = this.scene.make.container(undefined, false);
    //     }
    //     if (!this.mMountContainer.parentContainer) {
    //         const container = <Phaser.GameObjects.Container> this.mSprites.get(DisplayField.STAGE);
    //         if (container) container.addAt(this.mMountContainer, index);
    //     }
    //     this.mMountContainer.addAt(display, targetIndex);
    //     display.setRootMount(this);
    //     this.mMountList[targetIndex] = display;
    //     if (this.mMainSprite) {
    //         // 侦听前先移除，避免重复添加
    //         this.mMainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
    //         this.mMainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
    //     }
    // }

    public unmount(display: FramesDisplay | DragonbonesDisplay) {
        if (!this.mMountContainer) {
            return;
        }
        super.unmount(display);
        this.render.displayManager.addToSurfaceLayer(display);
        //     display.setRootMount(undefined);
        //     const index = this.mMountList.indexOf(display);
        //     display.visible = true;
        //     if (index > -1) {
        //         this.mMountList.splice(index, 1);
        //     }
        //     const list = this.mMountContainer.list;
        //     if (list.length <= 0 && this.mDisplays.size > 0) {
        //         this.mDisplays[0].off("animationupdate", this.onAnimationUpdateHandler, this);
        //     }
    }

    public scaleTween() {
        if (this.mMountContainer && this.mMountContainer.list.length > 0) {
            return;
        }
        if (this.mScaleTween) {
            return;
        }
        const tmp = this.scale;
        this.mScaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            scale: tmp * 1.25,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.scale = 1;
                if (this.mScaleTween) {
                    // this.mScaleTween.destroy();
                    this.mScaleTween = undefined;
                }
            },
        });
    }

    protected async fetchProjection() {
        if (!this.id) return;
        this.mProjectionSize = await this.render.mainPeer.fetchProjectionSize(this.id);
        this.updateSort();
    }

    protected completeFrameAnimationQueue() {
        super.completeFrameAnimationQueue();
        this.render.mainPeer.completeFrameAnimationQueue(this.id);
    }

    protected checkShowNickname(): boolean {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    }

    protected clearDisplay() {
        super.clearDisplay();

        if (this.mMountContainer && this.mMountContainer.parentContainer) {
            this.mMountContainer.parentContainer.remove(this.mMountContainer);
        }
    }

    private onAnimationUpdateHandler(ani: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (!this.mMountContainer || !this.mCurAnimation) return;
        const frameVisible = this.mCurAnimation.mountLayer.frameVisible;
        if (!frameVisible) {
            return;
        }
        const index = frame.index - 1;
        if (index > frameVisible.length) {
            return;
        }
        for (let i = 0; i < this.mMountList.length; i++) {
            this.mMountList[i].visible = this.getMaskValue(frameVisible[index], i);
        }
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    get nickname() {
        return this.mName;
    }
}

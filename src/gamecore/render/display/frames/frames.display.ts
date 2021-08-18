import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { Render } from "../../render";
import { IPos, Logger, DisplayField, ElementStateType, LayerName, RunningAnimation, TitleMask, Position45, LogicPos } from "structure";
import { IDisplayObject } from "../display.object";
import { DragonbonesDisplay } from "../dragonbones/dragonbones.display";
import { ElementTopDisplay } from "../element.top.display";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends BaseFramesDisplay implements IDisplayObject {
    protected mID: number = undefined;
    protected mTitleMask: number;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected attrs: Map<string, string | number | boolean>;
    private mName: string = undefined;
    private mStartFireTween: Phaser.Tweens.Tween;
    private mDebugPoint: Phaser.GameObjects.Graphics;
    private mGrids: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, private render: Render, id?: number, type?: number) {
        super(scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, type);
        this.mNodeType = type;
        this.mID = id;
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
        if (this.mStartFireTween) {
            this.mStartFireTween.stop();
            this.mStartFireTween = undefined;
        }

        if (this.mDebugPoint) {
            this.mDebugPoint.destroy();
            this.mDebugPoint = undefined;
        }
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
        }
        if (this.attrs) {
            this.attrs.clear();
            this.attrs = undefined;
        }
        super.destroy();
    }

    public set titleMask(val: number) {
        this.mTitleMask = val;
    }

    public get titleMask(): number {
        return this.mTitleMask;
    }

    get hasInteractive(): boolean {
        return this.mHasInteractive;
    }

    set hasInteractive(val) {
        this.mHasInteractive = val;
    }

    public update() {
        super.update();
        this.updateTopDisplay();
    }

    public async showRefernceArea(area: number[][], origin: IPos, conflictMap?: number[][]) {
        if (!area || area.length <= 0 || !origin) return;
        const roomSize = this.render.roomSize;
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene);
        }
        let drawArea = area;
        if (conflictMap !== undefined && conflictMap.length > 0) {
            drawArea = conflictMap;
        }
        this.mReferenceArea.draw(drawArea, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
        this.addAt(this.mReferenceArea, 0);
    }

    public hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    }

    public showGrids() {
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
        }
        // const roomSize = this.render.roomSize;
        //
        // this.mGrids = this.scene.make.graphics(undefined, false);
        // this.mGrids.lineStyle(1, 0xffffff, 0.1);
        // this.mGrids.beginPath();
        // let point = new LogicPos(startX, endX);
        // point = Position45.transformTo90(point, roomSize);
        // this.mGrids.moveTo(point.x, point.y);
        // point = new LogicPos(startY, endY);
        // point = Position45.transformTo90(point);
        // this.mGrids.lineTo(point.x, point.y);
        // this.mGrids.closePath();
        // this.mGrids.strokePath();
        // this.addAt(this.mGrids, 0);
    }

    public hideGrids() {
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
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
        if (!this.checkShowNickname()) return;
        if (!this.mTopDisplay) {
            this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        }
        this.mTopDisplay.showNickname(name);

        // debug
        // if (name !== "透明") {
        //     this.mTopDisplay.showNickname(name + "; " + this.mID + "; " + this.x + "; " + this.y);
        //     this.setAlpha(0.2);
        //     if (this.mDebugPoint) this.mDebugPoint.destroy();
        //     this.mDebugPoint = this.scene.make.graphics(undefined, false);
        //     this.mDebugPoint.clear();
        //     this.mDebugPoint.fillStyle(0xFF0000, 1);
        //     this.mDebugPoint.fillCircle(0, 0, 2);
        //
        //     this.add(this.mDebugPoint);
        // }
    }

    public showTopDisplay(data?: ElementStateType) {
        if (!data) {
            if (this.mTopDisplay)
                this.mTopDisplay.destroy();
            this.mTopDisplay = undefined;
            return;
        }
        if (!this.mTopDisplay) this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        this.mTopDisplay.loadState(data);
    }

    public removeTopDisplay() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.removeDisplay();
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        if (!this.mTopDisplay) {
            this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        }
        this.mTopDisplay.showBubble(text, setting);
    }

    public clearBubble() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.clearBubble();
    }

    public displayCreated() {
        super.displayCreated();
        if (this.mTopDisplay) {
            this.mTopDisplay.updateOffset();
        }
        this.render.mainPeer.elementDisplayReady(this.id);
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
    }

    public doMove(moveData: any) {
    }

    public startFireMove(pos: any) {
        Logger.getInstance().log("startFireMove ===>", pos, this.x, this.y);
        this.mStartFireTween = this.scene.tweens.add({
            targets: this,
            duration: 900,
            ease: "Expo.Out",
            props: {
                x: pos.x,
                y: pos.y
            },
            onComplete: () => {
                if (this.mStartFireTween) this.mStartFireTween.stop();
                if (this.mStartFireTween) this.mStartFireTween = undefined;
            },
            onCompleteParams: [this]
        });
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

    public resetDisplayOffset() {
        if (!this.mCurAnimation) return;
        const layer = this.mCurAnimation.layer;
        if (!layer || layer.length < 1) {
            return;
        }
        // 最底层为底图
        const mainLayer = layer[0];
        const offsetLoc = mainLayer.offsetLoc;
        this.mDisplays.forEach((display) => {
            display.x -= offsetLoc.x;
            display.y -= offsetLoc.y;
        });
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
        this.render.displayManager.addToLayer(LayerName.SURFACE, display);
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

    public updateAttrs(attrs: Map<string, string | number | boolean>) {
        this.attrs = attrs;
    }

    public getAttr(key: string) {
        if (!this.attrs) return;
        return this.attrs.get(key); 
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

    // protected clearDisplay() {
    //     super.clearDisplay();

    // if (this.mMountContainer && this.mMountContainer.parentContainer) {
    //     this.mMountContainer.parentContainer.remove(this.mMountContainer);
    // }
    // }

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
        this.mMountList.forEach((value, key) => {
            value.visible = this.getMaskValue(frameVisible[index], key);
        });
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    get nickname() {
        return this.mName;
    }
}

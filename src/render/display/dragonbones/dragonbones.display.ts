import { BaseDisplay, BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { Render } from "../../render";
import { IPos, Logger, IProjection } from "utils";
import { DisplayField, ElementStateType, IDragonbonesModel, LayerName, RunningAnimation, TitleMask} from "structure";
import { IDisplayObject } from "../display.object";
import { LoadQueue } from "../../loadqueue";
import { ElementTopDisplay } from "../element.top.display";
import { FramesDisplay } from "../frames/frames.display";

export class DragonbonesDisplay extends BaseDragonbonesDisplay implements IDisplayObject {
    protected mTitleMask: number;
    protected mNodeType: number = undefined;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected mSortX: number = 0;
    protected mSortY: number = 0;

    private mLoadQueue: LoadQueue;
    private mName: string = undefined;
    private mStartFireTween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, private render: Render, id?: number, private uuid?: number, type?: number) {
        super(scene, id);

        this.mNodeType = type;

        this.mLoadQueue = new LoadQueue(scene);
        this.mLoadQueue.on("QueueProgress", this.fileComplete, this);
        this.mLoadQueue.on("QueueError", this.fileError, this);
        this.mHasInteractive = true;
    }

    public load(display: IDragonbonesModel, field?: DisplayField, useRenderTex= true): Promise<any> {
        field = !field ? DisplayField.STAGE : field;
        if (field !== DisplayField.STAGE) {
            return Promise.reject("field is not STAGE");
        }

        return super.load(display, field, useRenderTex);
    }

    get hasInteractive(): boolean {
        return this.mHasInteractive;
    }

    set hasInteractive(val) {
        this.mHasInteractive = val;
    }

    public startLoad(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.mLoadQueue || this.mCreated) {
                resolve(null);
                return;
            }
            this.mLoadQueue.once("QueueComplete", () => {
                resolve(null);
            }, this);
            this.mLoadQueue.startLoad();
        });
    }

    public destroy() {
        if (this.mLoadQueue) {
            this.mLoadQueue.off("QueueProgress", this.fileComplete, this);
            this.mLoadQueue.off("QueueError", this.fileError, this);
            this.mLoadQueue.destroy();
        }
        if (this.mStartFireTween) {
            this.mStartFireTween.stop();
            this.mStartFireTween = undefined;
        }
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        super.destroy();
    }

    public get id() {
        return this.mID;
    }

    public get nodeType() {
        return this.mNodeType;
    }

    public set titleMask(val: number) {
        this.mTitleMask = val;
    }

    public get titleMask(): number {
        return this.mTitleMask;
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

    public showGrids() {
    }

    public hideGrids() {
    }

    public updateTopDisplay() {
        if (this.mTopDisplay) this.mTopDisplay.update();
    }

    public setVisible(value: boolean): this {
        if (this.mTopDisplay) {
            if (value) this.mTopDisplay.showNickname(this.mName);
            else this.mTopDisplay.hideNickname();
        }
        return super.setVisible(value);
    }

    public showNickname(name?: string) {
        if (name === undefined) {
            name = this.mName;
        }
        this.mName = name;
        if (!this.checkShowNickname()) return;
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        }
        this.mTopDisplay.showNickname(name);
    }

    public showTopDisplay(data?: ElementStateType) {
        if (!data) {
            if (this.mTopDisplay)
                this.mTopDisplay.destroy();
            this.mTopDisplay = undefined;
            return;
        }
        if (!this.mTopDisplay) this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        this.mTopDisplay.loadState(data);
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
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
        this.render.renderEmitter("dragonBones_initialized");
    }

    public get projectionSize(): IProjection {
        if (!this.mProjectionSize) {
            this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
        }
        return this.mProjectionSize;
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
    }

    public startFireMove(pos: any) {
        this.mStartFireTween = this.scene.tweens.add({
            targets: this,
            duration: 5000,
            ease: "Linear",
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

    public doMove(moveData: any) {
    }

    public update() {
        super.update();
        this.updateTopDisplay();
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

    public mount(display: FramesDisplay | DragonbonesDisplay, index?: number) {
        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        display.x = this.topPoint.x;
        display.y = this.topPoint.y;
        if (!this.mMountContainer.parentContainer) {
            // const container = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
            // if (container) container.addAt(this.mMountContainer, index);
            this.add(this.mMountContainer);
        }
        this.mMountContainer.addAt(display, index);
        this.mMountList.set(index, display);
        display.setRootMount(this);
    }

    public unmount(display: FramesDisplay | DragonbonesDisplay) {
        if (!this.mMountContainer) {
            return;
        }
        display.setRootMount(undefined);
        display.visible = true;
        let index = -1;
        this.mMountList.forEach((val, key) => {
            if (val === display) {
                index = key;
            }
        });
        if (index >= 0) {
            this.mMountList.delete(index);
        }
        this.mMountContainer.remove(display, false);
        this.render.displayManager.addToLayer(LayerName.SURFACE, display);
    }

    public get sortX() {
        return this.mSortX;
    }

    public get sortY() {
        return this.mSortY;
    }

    protected async fetchProjection() {
        if (!this.id) return;
        this.mProjectionSize = await this.render.mainPeer.fetchProjectionSize(this.id);
    }

    protected fileComplete(progress: number, key: string, type: string) {
        if (key !== this.resourceName || type !== "image") {
            return;
        }
        this.createArmatureDisplay();
    }

    protected fileError(key: string) {
        if (key !== this.resourceName) return;
        // TODO: 根据请求错误类型，retry或catch
        this.displayCreated();
    }

    protected onArmatureLoopComplete(event: dragonBones.EventObject) {
        super.onArmatureLoopComplete(event);
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        this.render.mainPeer.completeDragonBonesAnimationQueue(this.id);
    }

    // protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string) {
    //     this.mLoadQueue.add([{
    //         type: LoadType.DRAGONBONES,
    //         key: this.resourceName,
    //         textureUrl: pngUrl,
    //         jsonUrl,
    //         boneUrl: dbbinUrl
    //     }]);
    // }

    // protected generateReplaceTextureKey() {
    //     return super.generateReplaceTextureKey() + (this.uuid || 0);
    // }

    protected checkShowNickname(): boolean {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    }

    get nickname() {
        return this.mName;
    }
}

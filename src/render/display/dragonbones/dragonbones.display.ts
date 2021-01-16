import {BaseDragonbonesDisplay} from "display";
import {Render} from "../../render";
import {IPos, Logger, ValueResolver, IProjection} from "utils";
import {DisplayField, ElementStateType, IDragonbonesModel, RunningAnimation, TitleMask} from "structure";
import {IDisplayObject} from "../display.object";
import {LoadQueue, LoadType} from "../../loadqueue";
import {ReferenceArea} from "../../editor";
import {ElementTopDisplay} from "../element.top.display";
import {DisplayMovement} from "../display.movement";
import {projectionAngle} from "gamecoreRender";

export class DragonbonesDisplay extends BaseDragonbonesDisplay implements IDisplayObject {
    protected mID: number = undefined;
    protected mTitleMask: number;
    protected mNodeType: number = undefined;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected mMovement: DisplayMovement;
    protected mSortX: number = 0;
    protected mSortY: number = 0;

    private mLoadQueue: LoadQueue;
    private mProjectionSize: IProjection;
    private mName: string = undefined;
    private mPlaceholder: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, private render: Render, id?: number, private uuid?: number, type?: number) {
        super(scene);

        this.mID = id;
        this.mNodeType = type;

        this.mLoadQueue = new LoadQueue(scene);
        this.mLoadQueue.on("QueueProgress", this.fileComplete, this);
        this.mLoadQueue.on("QueueError", this.fileError, this);

        this.mMovement = new DisplayMovement(scene, this, render);
    }

    public load(display: IDragonbonesModel, field?: DisplayField): Promise<any> {
        field = !field ? DisplayField.STAGE : field;
        if (field !== DisplayField.STAGE) {
            return Promise.reject("field is not STAGE");
        }

        return super.load(display);
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

    public setRootMount(gameObject: Phaser.GameObjects.Container) {
        super.setRootMount(gameObject);

        this.updateTopDisplay();
    }

    public showRefernceArea(area: number[][], origin: IPos) {
        if (!area || area.length <= 0 || !origin) return;
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene, this.render);
        }
        this.mReferenceArea.draw(area, origin);
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

    public created() {
        super.created();
        this.render.mainPeer.elementDisplayReady(this.id);
        this.render.renderEmitter("dragonBones_initialized");
    }

    public get projectionSize(): IProjection {
        if (!this.mProjectionSize) {
            this.mProjectionSize = {offset: {x: 0, y: 0}, width: 0, height: 0};
        }
        return this.mProjectionSize;
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
        this.updateSort();
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

    public removeEffect() {
    }

    public mount(ele: Phaser.GameObjects.Container, targetIndex?: number) {
    }

    public unmount(ele: Phaser.GameObjects.Container) {
    }

    public get sortX() {
        return this.mSortX;
    }

    public get sortY() {
        return this.mSortY;
    }

    protected createArmatureDisplay(loader?: any, totalComplete?: number, totalFailed?: number) {
        if (!this.scene) return;
        if (!this.mArmatureDisplay) {
            this.showPlaceholder();
        }
        super.createArmatureDisplay(loader, totalComplete, totalFailed);
    }

    protected refreshAvatar() {
        super.refreshAvatar();
        this.closePlaceholder();
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
        this.created();
    }

    protected onArmatureLoopComplete(event: dragonBones.EventObject) {
        super.onArmatureLoopComplete(event);
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        this.render.mainPeer.completeDragonBonesAnimationQueue(this.id);
    }

    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string) {
        this.mLoadQueue.add([{
            type: LoadType.DRAGONBONES,
            key: this.resourceName,
            textureUrl: pngUrl,
            jsonUrl,
            boneUrl: dbbinUrl
        }]);
    }

    protected generateReplaceTextureKey() {
        return super.generateReplaceTextureKey() + (this.uuid || 0);
    }

    protected checkShowNickname(): boolean {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    }

    protected updateSort() {
        const _projectionAngle = projectionAngle;
        this.mSortX = (this.x - this.projectionSize.offset.x) / (2 * _projectionAngle[0]) + ((this.y - 7.5) - this.projectionSize.offset.y) / _projectionAngle[1] + this.z;
        this.mSortY = -((this.x - this.projectionSize.offset.x) / 2 * _projectionAngle[0]) + ((this.y - 7.5) - this.projectionSize.offset.y) / (2 * _projectionAngle[1]);
    }

    protected showPlaceholder() {
        if (this.mPlaceholder) {
            this.mPlaceholder.destroy();
        }
        this.mPlaceholder = this.scene.make.image({key: "avatar_placeholder", x: -22, y: -68}).setOrigin(0);
        this.add(this.mPlaceholder);
    }

    protected closePlaceholder() {
        if (this.mPlaceholder) {
            this.mPlaceholder.destroy();
        }
        this.mPlaceholder = undefined;
    }

    get nickname() {
        return this.mName;
    }
}

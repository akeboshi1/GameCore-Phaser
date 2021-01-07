import { ReferenceArea } from "../editor/reference.area";
import { DynamicSprite, DynamicImage } from "../ui/components";
import { Url, LogicPoint, LogicPos, Logger, IPos, Size } from "utils";
import { Render } from "../render";
import { RunningAnimation, IDragonbonesModel, IFramesModel, ElementStateType } from "structure";
import { ElementTopDisplay } from "./element.top.display";
import { LoadQueue } from "../loadqueue";

export enum DisplayField {
    BACKEND = 0,
    STAGE,
    FRONTEND,
    FLAG,
    Effect
}

enum TitleMask {
    TQ_NickName = 0x00010000,
    TQ_Badge = 0x00020000,
    // TQ_   = 0x0004;
}

export class DisplayObject extends Phaser.GameObjects.Container {
    /**
     * 实际透明度，避免和tween混淆
     */
    protected mID: number;
    protected mNodeType: number = undefined;
    protected mAlpha: number = 1;
    protected mBaseLoc: Phaser.Geom.Point;
    protected mCollisionArea: number[][];
    protected mOriginPoint: LogicPoint;
    protected mReferenceArea: ReferenceArea;
    protected mChildMap: Map<string, any>;
    protected mDirection: number = 3;
    protected mAntial: boolean = false;
    protected mAnimation: RunningAnimation;
    protected mTopDisplay: ElementTopDisplay;
    protected mDisplayInfo: IDragonbonesModel | IFramesModel;
    protected mRootMount: Phaser.GameObjects.Container;
    protected moveData: any;
    protected render: Render;
    protected mName: string;
    protected mTitleMask: number;
    protected mLoadQueue: LoadQueue;
    protected mProgress: number;
    protected mInitialized: boolean = false;
    protected mCallBack: Function;
    protected mProjectionSize: IPos;
    protected mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Container> = new Map<
        DisplayField,
        Phaser.GameObjects.Sprite | Phaser.GameObjects.Image
    >();
    constructor(scene: Phaser.Scene, render: Render, id?: any, type?: number) {
        super(scene);
        this.render = render;
        this.mID = id;
        this.mNodeType = type;
        this.mLoadQueue = new LoadQueue(scene);
        this.mLoadQueue.on("QueueProgress", this.fileComplete, this);
        this.mLoadQueue.on("QueueError", this.fileError, this);
        this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
    }

    get initialize(): boolean {
        return this.mInitialized;
    }

    get progress(): number {
        return this.mProgress;
    }

    set titleMask(val: number) {
        this.mTitleMask = val;
    }

    get titleMask(): number {
        return this.mTitleMask;
    }

    startLoad(callBack?: Function): Promise<any> {
        this.mCallBack = callBack;
        return new Promise<void>((resolve, reject) => {
            if (!this.mLoadQueue || this.mInitialized) {
                resolve(null);
                return;
            }
            this.mLoadQueue.once("QueueComplete", () => {
                this.mInitialized = true;
                resolve(null);
            }, this);
            this.mLoadQueue.startLoad();
        });
    }

    isShowName(): boolean {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    }

    isShowBadge(): boolean {
        return (this.mTitleMask & TitleMask.TQ_Badge) > 0;
    }

    set direction(direction: number) {
        this.mDirection = direction;
    }

    get direction(): number {
        return this.mDirection;
    }

    public changeAlpha(val?: number) {
        if (this.mAlpha === val) {
            return;
        }
        this.alpha = val;
        this.mAlpha = val;
    }

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    fadeIn(callback?: () => void) {
    }

    fadeOut(callback?: () => void) {
    }

    load(data: IDragonbonesModel | IFramesModel, field?: DisplayField) {
    }

    play(animation: RunningAnimation, field?: DisplayField, times?: number) {
        this.fetchProjection();
    }

    mount(ele: Phaser.GameObjects.Container, targetIndex?: number) { }

    unmount(ele: Phaser.GameObjects.Container) { }

    removeEffect() {
    }

    removeDisplay(field: DisplayField) {
    }

    public displayReady(animation) { }

    public destroy(fromScene?: boolean): void {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mChildMap) {
            this.mChildMap.clear();
            this.mChildMap = null;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        if (this.mLoadQueue) {
            this.mLoadQueue.off("QueueProgress", this.fileComplete, this);
            this.mLoadQueue.off("QueueError", this.fileError, this);
            this.mLoadQueue.destroy();
        }
        // this.removeAll(true);
        super.destroy(fromScene);
    }

    public setDisplayBadges(cards) {
        // if (!this.isShowBadge()) return;
        // if (!this.mBadges) this.mBadges = [];
        // else this.clearBadges();
        // for (const card of cards) {
        //     const badge = new DynamicImage(this.scene, 0, 0);
        //     badge.load(Url.getOsdRes(card.thumbnail), this, this.layouFlag);
        //     this.flagContainer.add(badge);
        //     this.mBadges.push(badge);
        // }
    }

    public showRefernceArea(area: number[][], origin: IPos) {
        if (!area || area.length <= 0 || !origin) return;
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene, this.render);
            this.addChildMap("reference", this.mReferenceArea);
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

    public scaleTween(): void { }

    public getElement(key: string) {
        if (!this.mChildMap) {
            return;
        }
        return this.mChildMap.get(key);
    }

    public showNickname(name: string) {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
        }
        if (!this.isShowName()) return;
        this.mName = name;
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

    public updatePos(x: number, y: number, z: number) {
        this.setPosition(x, y, z);
        if (this.mTopDisplay) this.mTopDisplay.update();
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        // const scene = this.mElementManager.scene;
        // if (!scene) {
        //     return;
        // }
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render.scaleRatio);
        }
        this.mTopDisplay.showBubble(text, setting);
    }
    public clearBubble() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.clearBubble();
    }

    get nodeType(): number {
        return this.mNodeType;
    }

    public doMove(moveData: any) {
        if (!moveData.posPath) {
            return;
        }
        this.moveData = moveData;
        const line = moveData.tweenLineAnim;
        if (line) {
            line.stop();
            line.destroy();
        }
        const paths = [];
        const posPath = moveData.posPath;
        let index = 0;
        for (const path of posPath) {
            const duration = path.duration;
            const direction = path.direction;
            paths.push({
                x: path.x,
                y: path.y,
                direction,
                duration,
                onStartParams: direction,
                onCompleteParams: { duration, index },
                onStart: (tween, target, params) => {
                    this.onCheckDirection(params);
                },
                onComplete: (tween, targets, params) => {
                    this.onMovePathPointComplete(params);
                }

            });
            index++;
        }
        moveData.tweenLineAnim = this.scene.tweens.timeline({
            targets: this,
            ease: "Linear",
            tweens: paths,
            onStart: () => {
                this.onMoveStart();
            },
            onComplete: () => {
                this.onMoveComplete();
            },
            onUpdate: () => {
                this.onMoving();
            },
            onCompleteParams: [this],
        });
    }

    public stopMove() {
        if (this.moveData && this.moveData.posPath) {
            delete this.moveData.posPath;
            if (this.moveData.arrivalTime) this.moveData.arrivalTime = 0;
            if (this.moveData.tweenLineAnim) {
                this.moveData.tweenLineAnim.stop();
                this.moveData.tweenLineAnim.destroy();
            }
        }
        // this.render.mainPeer.displayStopMove(this.id);
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            this.direction = dir;
            this.play(this.mAnimation);
        }
    }

    public getPosition() {
        const pos = new LogicPos(this.x, this.y);
        if (this.mRootMount) {
            pos.x += this.mRootMount.x;
            pos.y += this.mRootMount.y;
        }
        return pos;
    }

    public setRootMount(gameObject: Phaser.GameObjects.Container) {
        this.mRootMount = gameObject;
        if (this.mTopDisplay) this.mTopDisplay.update();
    }

    public renderSetDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            this.setDirection(dir);
            Logger.getInstance().log("renderSetDirection:=====", dir);
            this.render.setDirection(this.id, dir);
        }
    }

    public addEffect(display: DisplayObject) {
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

    protected getSprite(key: DisplayField) {
        return this.mSprites.get(key);
    }

    protected allComplete(loader?: any, totalComplete?: number, totalFailed?: number) {
        this.mInitialized = true;
    }

    protected fileComplete(progress: number, key: string, type?: string) {
        this.mProgress = progress;
    }

    protected fileError(key: string) {
    }

    protected onMovePathPointComplete(params) {
        if (!this.moveData) {
            return;
        }
        this.moveData.step += 1;
    }

    protected onMoveStart() {
        // this.render.mainPeer.displayStartMove(this.id);
    }

    protected onMoveComplete() {
        if (this.moveData.tweenLineAnim) this.moveData.tweenLineAnim.stop();
        this.render.mainPeer.displayCompleteMove(this.id);
        this.stopMove();
    }

    protected onMoving() {
        const now = this.render.mainPeer.now();
        if (now - (this.moveData.tweenLastUpdate || 0) >= 50) {
            this.setDepth(0);
            this.moveData.tweenLastUpdate = now;
        }
        if (this.mTopDisplay) this.mTopDisplay.update();
        // this.mDirty = true;
    }

    // protected addEffect(target: DynamicSprite, textureURL: string, atlasURL?: string, isBack?: boolean, framerate?: number, loop?: boolean, killComplete?: boolean) {
    //     if (!target) {
    //         target = new DynamicSprite(this.scene, 0, 0);
    //     }
    //     target.load(textureURL, atlasURL);
    //     target.y = -20;
    //     if (isBack) {
    //         this.addAt(target, DisplayField.BACKEND);
    //     } else {
    //         this.addAt(target, DisplayField.FRONTEND);
    //     }
    //     // target.play(textureURL + atlasURL);
    //     target.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
    //         target.destroy();
    //     });
    // }

    protected layouFlag(offset: number = 4) {
        // if (!this.mFlagContainer) return;
        // this.mFlagContainer.y = -96;
        // this.bringToTop(this.mNickname);
        // const children = this.mFlagContainer.list;
        // let _x = 0;
        // for (const child of children) {
        //     child["x"] = _x;
        //     if (child["width"]) _x = child["width"];
        // }
    }

    protected clearBadges() {
        // if (!this.mBadges) return;
        // for (const badge of this.mBadges) {
        //     badge.destroy();
        // }
        // this.mBadges.length = 0;
    }

    // protected get flagContainer(): Phaser.GameObjects.Container {
    //     if (this.mFlagContainer) return this.mFlagContainer;
    //     this.mFlagContainer = this.scene.make.container(undefined, false);
    //     this.addAt(this.mFlagContainer, DisplayField.FLAG);
    //     return this.mFlagContainer;
    // }

    protected addChildMap(key: string, display: Phaser.GameObjects.GameObject) {
        if (!this.mChildMap) {
            this.mChildMap = new Map();
        }
        this.mChildMap.set(key, display);
    }

    protected removeChildMap(key: string) {
        if (!this.mChildMap) {
            return;
        }
        this.mChildMap.delete(key);
    }

    protected onCheckDirection(param: number) {
        if (typeof param !== "number") {
            return this.mDirection;
        }
        Logger.getInstance().log("dir:====", param);
        this.renderSetDirection(param);
    }

    protected async fetchProjection() {
        if (!this.id) return;
        this.mProjectionSize = await this.render.mainPeer.fetchProjectionSize(this.id);
    }

    get id(): number {
        return this.mID;
    }

    get topPoint(): Phaser.Geom.Point {
        return undefined;
    }

    get sortX(): number {
        return this.x;
    }

    get sortY(): number {
        return this.y;
    }

    get sortZ(): number {
        return this.z || 0;
    }

    get collisionArea() {
        return this.mCollisionArea;
    }

    get originPoint() {
        return this.mOriginPoint;
    }

    get projectionSize(): IPos {
        if (!this.mProjectionSize) {
            this.mProjectionSize = { x: 0, y: 0 };
        }
        return this.mProjectionSize;
    }
}

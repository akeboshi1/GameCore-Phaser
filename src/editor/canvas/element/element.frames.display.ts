import * as path from "path";
import * as os from "os";
import { SPRITE_SHEET_KEY, ResourcesChangeListener, IMAGE_BLANK_KEY } from "./element.editor.resource.manager";
import ElementEditorGrids from "./element.editor.grids";
import { Logger } from "structure";
import { BaseDragonbonesDisplay, BaseDisplay, BaseFramesDisplay } from "baseRender";
import { AnimationDataNode } from "game-capsule";
import { AnimationModel, RunningAnimation } from "structure";
import { DragonbonesEditorDisplay } from "./dragonbones.editor.display";
import { ElementEditorEmitType } from "./element.editor.type";
import { IEditorCanvasConfig } from "../editor.canvas";
export class ElementFramesDisplay extends BaseFramesDisplay implements ResourcesChangeListener {

    private readonly MOUNT_ANIMATION_TIME_SCALE: number = 1000 / 12;

    private mGrids: ElementEditorGrids;
    private mEmitter: Phaser.Events.EventEmitter;
    private mSelectedGameObjects = [];
    private mAnimationData: AnimationDataNode;// AnimationDataNode
    // private mMountArmatureParent: Phaser.GameObjects.Container;
    private mCurFrameIdx: number = 0;
    private mPlaying: boolean = false;
    private mCurMountAnimation: RunningAnimation = { name: "idle", flip: false };

    constructor(scene: Phaser.Scene, node: any, grids: ElementEditorGrids, emitter: Phaser.Events.EventEmitter, private mConfig: IEditorCanvasConfig) {// AnimationDataNode
        super(scene, { resPath: mConfig.LOCAL_HOME_PATH, osdPath: mConfig.osd });
        this.mGrids = grids;
        this.mEmitter = emitter;
        this.mMountList = new Map<number, BaseDisplay>();
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);
        // this.mMountArmatureParent = scene.add.container(0, 0);
        // this.add(this.mMountArmatureParent);
        this.scene.input.on("dragstart", this.onDragStartHandler, this);
        this.scene.input.on("drag", this.onDragHandler, this);
        this.scene.input.on("dragend", this.onDragEndHandler, this);
        this.scene.input.keyboard.on("keydown", this.keyboardEvent, this);

        // init data
        this.setAnimationData(node);
    }

    public setAnimationData(data: AnimationDataNode) {// AnimationDataNode
        this.clear();
        this.mAnimationData = data;
        this.mCurFrameIdx = 0;
        this.mPlaying = false;
        this.mIsInteracitve = true;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("??????????????????!");
            return;
        }

        Logger.getInstance().debug("setAnimationData: ", data);
        // this.play({ name: data.name, flip: false });
        const originPos = this.mGrids.getAnchor90Point();
        this.x = originPos.x;
        this.y = originPos.y;
        this.updatePlay();
    }

    public onResourcesLoaded() {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    }

    public onResourcesCleared() {
        this.clearDisplay();
    }

    public setFrame(frameIdx: number) {
        this.mCurFrameIdx = frameIdx;

        this.updatePlay();
    }

    public setMountAnimation(aniName: string, idx?: number) {
        this.mCurMountAnimation.name = aniName;
        if (idx !== undefined) {
            if (!this.mMountList.get(idx)) {
                Logger.getInstance().warn("wrong idx: " + idx);
                return;
            }

            const arm: BaseDragonbonesDisplay = this.mMountList.get(idx) as BaseDragonbonesDisplay;
            if (arm) arm.play(this.mCurMountAnimation);
        } else {
            this.mMountList.forEach((val) => {
                (val as BaseDragonbonesDisplay).play(this.mCurMountAnimation);
            });
        }
    }

    public updateMountDisplay() {
        this.updateMountLayerPlay();
    }

    public setPlay(playing: boolean) {
        this.mPlaying = playing;

        this.updatePlay();
    }

    public setInputEnabled(val: boolean) {
        this.mIsInteracitve = val;

        this.updateInputEnabled();

        // clear selected
        if (!val) this.mSelectedGameObjects.length = 0;
    }

    // ????????????????????????????????????
    // public setSelectedGameObjectsByLevelIdx(idxs: number[]) {
    //     let gos = [];
    //     idxs.forEach((idx) => {
    //         const layer = this.getLayerByLayerIdx(idx);
    //         if (layer.length > 0) gos = gos.concat(layer);
    //     });
    //     this.setSelectedGameObjects(gos);
    // }

    public setSelectedAnimationLayer(idxs: number[]) {
        let gos = [];
        idxs.forEach((idx) => {
            if (this.mDisplays.has(idx)) {
                gos = gos.concat(this.mDisplays.get(idx));
            }
        });
        this.setSelectedGameObjects(gos);
    }

    public setSelectedMountLayer(mountPointIndex?: number) {
        if (mountPointIndex !== undefined) {
            if (!this.mMountList.get(mountPointIndex)) {
                Logger.getInstance().warn("wrong idx: " + mountPointIndex);
                return;
            }
            this.setSelectedGameObjects(this.mMountList.get(mountPointIndex));
        } else {
            // ?????????????????????
            const arr = Array.from(this.mMountList.values());
            this.setSelectedGameObjects(arr);
        }
    }

    public updateDepth() {
        if (!this.mAnimationData) return;

        this.mAnimationData.layerDict.forEach((val, key) => {
            if (!this.mDisplays.has(key)) return;
            const display = this.mDisplays.get(key);
            if (display && display.parentContainer) {
                display.parentContainer.setDepth(val.depth);
            }
        });

        if (!this.mAnimationData.mountLayer) return;
        // if (this.mMountArmatureParent) {
        //     this.mMountArmatureParent.setDepth(this.mAnimationData.mountLayer.index);
        // }
        if (this.mMountContainer) {
            this.mMountContainer.setDepth(this.mAnimationData.mountLayer.index);
        }

        this.updateChildrenIdxByDepth();
    }

    public updatePerAnimationLayerVisible(idx: number) {
        if (!this.mAnimationData) return;
        if (!this.mAnimationData.layerDict.has(idx) || !this.mDisplays.has(idx)) return;
        if (this.mPlaying) return;

        const display = this.mDisplays.get(idx);
        const data = this.mAnimationData.layerDict.get(idx);
        if (data.frameVisible && this.mCurFrameIdx >= data.frameVisible.length) return;
        if (display) {
            display.visible = data.frameVisible ? data.frameVisible[this.mCurFrameIdx] : true;
        }
    }

    public addAnimationLayer(idx: number) {
        // this.createDisplay(idx);
        throw new Error("todo add AnimationLayer");
        this.updatePlay();
    }

    public updateAnimationLayer() {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    }

    public updateOffsetLoc(idx: number) {
        const display = this.mDisplays.get(idx);
        if (!display) {
            return;
        }
        if (!this.mAnimationData) {
            return;
        }
        const data = this.mAnimationData.layerDict.get(idx);
        if (!data) {
            return;
        }
        const baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = baseLoc.x + display.width * 0.5;
        display.y = baseLoc.y + display.height * 0.5;
    }

    public generateThumbnail(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.mAnimationData) {
                reject(null);
                return;
            }
            if (this.mAnimationData.layerDict.size === 0) {
                reject(null);
                return;
            }
            const firstLayer = this.mAnimationData.layerDict.values().next().value;
            if (firstLayer.frameName.length === 0) {
                reject(null);
                return;
            }
            const frameName = firstLayer.frameName[0];
            if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) {
                reject(null);
                return;
            }
            if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                reject(null);
                return;
            }
            if (frameName === IMAGE_BLANK_KEY) {
                reject(null);
                return;
            }
            const image = this.scene.make.image({ key: SPRITE_SHEET_KEY, frame: frameName }).setOrigin(0, 0);
            let scaleRatio = 1;
            if (image.width > 48 || image.height > 48) {
                if (image.width > image.height) {
                    scaleRatio = 48 / image.width;
                } else {
                    scaleRatio = 48 / image.height;
                }
                image.scale = scaleRatio;
            }

            const render = this.scene.make.renderTexture(
                {
                    width: image.displayWidth >> 0,
                    height: image.displayHeight >> 0
                },
                false
            );
            render.draw(image);
            render.snapshot((img: HTMLImageElement) => {
                resolve(img.src);
                image.destroy();
                render.destroy();
            });
        });
    }

    public clear() {
        this.clearDisplay();

        this.mSelectedGameObjects.length = 0;
        this.mDisplayDatas.clear();
    }

    protected clearDisplay() {
        this.mDisplays.forEach((element) => {
            if (element) {
                element.destroy();
            }
        });
        this.mDisplays.clear();
        this.mMountList.forEach((val) => {
            this.unmount(val as BaseDragonbonesDisplay);
            val.destroy(true);
        });
        this.mMountList.clear();

        super.clearDisplay();
    }

    protected makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], frameRate: number, loop: boolean, frameDuration?: number[]) {
        if (this.scene.anims.exists(key)) {
            this.scene.anims.remove(key);
        }
        super.makeAnimation(gen, key, frameName, frameVisible, frameRate, loop, frameDuration);
    }

    protected createDisplays(key?: string, ani?: any) {
        if (!this.mAnimationData) return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) return;

        super.createDisplays(SPRITE_SHEET_KEY, this.mAnimationData.createProtocolObject());
        // this.mAnimationData.layerDict.forEach((val, key) => {
        // this.createDisplay(key);
        // });
    }

    private dragonBoneLoaded() {
        // if (!this.scene.textures.exists(this.MOUNT_DRAGONBONES_KEY)) return;

        // this.scene.load.removeListener(
        //     Phaser.Loader.Events.COMPLETE,
        //     this.dragonBoneLoaded,
        //     this);
        // this.mDragonBonesLoaded = true;

        // this.createMountDisplay();
        // this.updatePlay();
    }

    private keyboardEvent(value) {
        if (!this.mAnimationData || this.mSelectedGameObjects.length <= 0) {
            return;
        }
        let operated = false;
        switch (value.keyCode) {
            case 37:
                this.mSelectedGameObjects.forEach((element) => {
                    element.x--;
                });
                operated = true;
                break;
            case 38:
                this.mSelectedGameObjects.forEach((element) => {
                    element.y--;
                });
                operated = true;
                break;
            case 39:
                this.mSelectedGameObjects.forEach((element) => {
                    element.x++;
                });
                operated = true;
                break;
            case 40:
                this.mSelectedGameObjects.forEach((element) => {
                    element.y++;
                });
                operated = true;
                break;
        }
        if (operated)
            this.syncPositionData();
    }

    private onDragStartHandler(pointer, gameObject) {
        // gameObject.alpha = 1;
        if (!this.mSelectedGameObjects.includes(gameObject)) {
            this.setSelectedGameObjects(gameObject);
        }

        if (gameObject instanceof Phaser.GameObjects.Sprite) {
            const sprite = gameObject as Phaser.GameObjects.Sprite;
            this.mDisplays.forEach((val, key) => {
                if (val === sprite) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Animation_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Animation_Layer, key);
                    return;
                }
            });
        } else if (gameObject instanceof dragonBones.phaser.display.ArmatureDisplay) {
            const arm = gameObject as dragonBones.phaser.display.ArmatureDisplay;
            this.mMountList.forEach((val, key) => {
                if (val === arm) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Mount_Layer, key);
                    return;
                }
            });
        }
    }

    private onDragHandler(pointer, gameObject, dragX, dragY) {
        const delta = { x: 0, y: 0 };
        this.mSelectedGameObjects.forEach((element) => {
            if (element === gameObject) {
                delta.x = dragX - element.x;
                delta.y = dragY - element.y;
            }
        });
        this.mSelectedGameObjects.forEach((element) => {
            element.x = element.x + delta.x;
            element.y = element.y + delta.y;
        });
    }

    private onDragEndHandler(pointer, gameobject) {
        // gameobject.alpha = 0.7;
        this.syncPositionData();

        // if (!this.mPlaying) this.generateFrameSumb();
    }

    private syncPositionData() {
        if (!this.mAnimationData) return;

        this.mDisplays.forEach((val, key) => {
            const data = this.mAnimationData.layerDict.get(key);
            // const point = { x: val.x, y: val.y };
            let { x, y } = val;
            x -= val.width * 0.5;
            y -= val.height * 0.5;
            if (!data.offsetLoc || data.offsetLoc.x !== x || data.offsetLoc.y !== y) {
                data.setOffsetLoc(x, y);
            }
        });

        const mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
        if (mountPoints) {
            for (let i = 0; i < mountPoints.length; i++) {
                const data = mountPoints[i];
                const mountObject = this.mMountList.get(i);
                const { x, y } = mountObject;
                if (x !== data.x || y !== data.y) {
                    data.x = x;
                    data.y = y;
                }
            }
        }
    }

    private updatePlay() {
        if (!this.mAnimationData) return;
        if (!this.scene) {
            Logger.getInstance().error("no scene created");
            return;
        }
        this.mDisplayDatas.clear();
        const anis = new Map();
        anis.set(this.mAnimationData.name, new AnimationModel(this.mAnimationData.createProtocolObject()));
        this.load({
            discriminator: "FramesModel",
            id: 0,
            gene: SPRITE_SHEET_KEY,
            animations: anis,
            animationName: this.mAnimationData.name
        });
        // this.mCurAnimation = this.mAnimationData.createProtocolObject();
        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            let index = 0;
            this.play({ name: this.mAnimationData.name, flip: false });
            this.mAnimationData.layerDict.forEach((val, key) => {
                const display = this.mDisplays.get(key);
                if (!display) return;
                if (!val.layerVisible) {
                    display.visible = false;
                    return;
                }
                const isSprite = display instanceof Phaser.GameObjects.Sprite;
                if (this.mPlaying) {
                    // const animationName = `${this.framesInfo.gene}_${this.mAnimationData.name}_${index}`;
                    // this.makeAnimation(SPRITE_SHEET_KEY, animationName, val.frameName, val.frameVisible, this.mAnimationData.frameRate, this.mAnimationData.loop, this.mAnimationData.frameDuration);
                    display.visible = true;
                    // if (isSprite) (<Phaser.GameObjects.Sprite>display).play(animationName);
                } else {
                    if (isSprite) (<Phaser.GameObjects.Sprite>display).anims.stop();
                    if (this.mCurFrameIdx >= val.frameName.length) {
                        Logger.getInstance().warn("wrong frame idx: " + this.mCurFrameIdx + "; frameName.length: " + val.frameName.length);
                        display.visible = false;
                        return;
                    }
                    const frameName = val.frameName[this.mCurFrameIdx];
                    if (!this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                        Logger.getInstance().warn("donot have frame: " + frameName);
                        display.visible = false;
                        return;
                    }
                    display.setTexture(SPRITE_SHEET_KEY, frameName);
                    // if (display.input) {
                    // display.input.hitArea.setSize(display.displayWidth, display.displayHeight);
                    // } else {
                    display.setInteractive();
                    // this.updateBaseLoc(display, false, val.offsetLoc);
                    // }
                    this.updatePerInputEnabled(display);
                    if (!val.frameVisible || this.mCurFrameIdx < val.frameVisible.length) {
                        display.visible = val.frameVisible ? val.frameVisible[this.mCurFrameIdx] : true;
                    }
                }
                index++;
            });
        }

        this.updateMountLayerPlay();
        // if (!this.mPlaying) this.generateFrameSumb();
    }

    private updateMountLayerPlay() {
        if (!this.mAnimationData) return;
        const firstLayer = this.mAnimationData.layerDict.values().next().value;
        const mountlayer = this.mAnimationData.mountLayer;
        if (!mountlayer || !mountlayer.mountPoint) return;
        if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
            return;
        }

        this.mMountList.forEach((val) => {
            this.unmount(val as BaseDragonbonesDisplay);
            (<DragonbonesEditorDisplay>val).dirty = true;
        });
        this.mMountList.clear();

        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (this.mMountList.get(i)) continue;
            const arm = new DragonbonesEditorDisplay(this.scene, this.mConfig.osd);
            this.mount(arm, i);
            arm.load();
            const pos = { x: mountlayer.mountPoint[i].x, y: mountlayer.mountPoint[i].y };
            arm.setPosition(pos.x, pos.y);
            arm.play(this.mCurMountAnimation);

            arm.visible = true;
        }

        // this.mMountArmatureParent.setDepth(data.index);
        this.updateChildrenIdxByDepth();
        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i)) continue;
            const armature = this.mMountList.get(i);
            if (this.mPlaying) {
                // this.mMountAnimationTimer = this.scene.time.addEvent({
                //     delay: 0,
                //     timeScale: this.MOUNT_ANIMATION_TIME_SCALE,
                //     callback: this.onMountTimerEvent,
                //     callbackScope: this,
                //     loop: this.mAnimationData.loop
                // });
            } else {
                if (mountlayer.frameVisible && this.mCurFrameIdx < mountlayer.frameVisible.length) {
                    const mountPointsVisible: number = mountlayer.frameVisible[this.mCurFrameIdx];
                    const visible: boolean = this.getMaskValue(mountPointsVisible, i);
                    armature.visible = visible;
                } else {
                    armature.visible = true;
                }
            }
        }
    }

    private onMountTimerEvent() {
        if (!this.mAnimationData || !this.mAnimationData.mountLayer || !this.mAnimationData.mountLayer.mountPoint) {
            Logger.getInstance().error("no data");
            return;
        }

        const mountlayer = this.mAnimationData.mountLayer;
        const frameDuration = [];
        const firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (!firstLayer) {
            Logger.getInstance().error("no layer data");
            return;
        }
        if (firstLayer.frameName.length === 0) {
            Logger.getInstance().error("wrong frame length");
            return;
        }
        if (this.mAnimationData.frameDuration && this.mAnimationData.frameDuration.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; frameDuration.length: " + this.mAnimationData.frameDuration.length);
            return;
        }
        for (let i = 0; i < firstLayer.frameName.length; i++) {
            const dur = this.mAnimationData.frameDuration ? this.mAnimationData.frameDuration[i] : 0;
            frameDuration.push(1 / this.mAnimationData.frameRate + dur);
        }

        const t = 0;
        const f = 0;
        const curFrame = 0;
        // frameDuration.forEach((dur) => {
        //     t += dur;
        //     if (this.mMountAnimationTimer.getElapsedSeconds() < t) {
        //         curFrame = f;
        //         return;
        //     }
        //     f++;
        // });

        // TODO
        // if (mountlayer.frameVisible && mountlayer.frameVisible.length <= curFrame) {
        //     Logger.getInstance().error("wrong frame idx: " + curFrame);
        //     return;
        // }

        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i)) continue;
            const armature = this.mMountList.get(i);
            if (mountlayer.frameVisible) {
                const mountPointsVisible: number = mountlayer.frameVisible[curFrame];
                const visible: boolean = this.getMaskValue(mountPointsVisible, i);
                armature.visible = visible;
            } else {
                armature.visible = true;
            }
        }
    }

    private setSelectedGameObjects(gos: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mSelectedGameObjects.length = 0;
        this.mSelectedGameObjects = [].concat(gos);
        // ??????????????????

        Logger.getInstance().debug("select game objects: ", this.mSelectedGameObjects);
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    private updateInputEnabled() {
        this.mDisplays.forEach((display) => {
            this.updatePerInputEnabled(display);
        });
        this.mMountList.forEach((arm) => {
            (arm as DragonbonesEditorDisplay).setDraggable(this.mIsInteracitve);
        });
    }

    private updatePerInputEnabled(element: DragonbonesEditorDisplay | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
        if (element.input) this.scene.input.setDraggable(element, this.mIsInteracitve);
    }

    private updateChildrenIdxByDepth() {
        this.list = this.list.sort((a, b) => {
            const ac = a as Phaser.GameObjects.Container;
            const bc = b as Phaser.GameObjects.Container;
            return ac.depth - bc.depth;
        });
    }
}

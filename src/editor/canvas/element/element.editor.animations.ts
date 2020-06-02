import { ElementNode, AnimationsNode, AnimationDataNode, DisplayNode } from "game-capsule";
import { Logger } from "../../../utils/log";
import { IPoint } from "game-capsule/lib/helpers";
import { ElementEditorCanvas, ElementEditorEmitType } from "./element.editor.canvas";
import * as path from "path";
import * as os from "os";
import { SPRITE_SHEET_KEY, ResourcesChangeListener, IMAGE_BLANK_KEY } from "./element.editor.resource.manager";
import ElementEditorGrids from "./element.editor.grids";

export const LOCAL_HOME_PATH: string = path.resolve(os.homedir(), ".pixelpai");

export default class ElementEditorAnimations extends Phaser.GameObjects.Container implements ResourcesChangeListener {

    private readonly MOUNT_ARMATURE_KEY: string = "Armature";
    private readonly MOUNT_DRAGONBONES_KEY: string = "bones_human01";
    private readonly MOUNT_ANIMATION_TIME_SCALE: number = 1000 / 12;

    private mGrids: ElementEditorGrids;
    private mEmitter: Phaser.Events.EventEmitter;
    private mDisplays: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
    private mSelectedGameObjects = [];
    private mAnimationData: AnimationDataNode;
    private mMountArmatureParent: Phaser.GameObjects.Container;
    private mMountArmatures: dragonBones.phaser.display.ArmatureDisplay[] = [];// 互动模拟骨架
    private mDragonBonesLoaded: boolean = false;
    private mCurFrameIdx: number = 0;
    private mPlaying: boolean = false;
    private mInteractive: boolean = true;
    private mMountAnimationTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, node: AnimationDataNode, grids: ElementEditorGrids, emitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.mGrids = grids;
        this.mEmitter = emitter;
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);
        this.mMountArmatureParent = scene.add.container(0, 0);
        this.add(this.mMountArmatureParent);
        this.scene.input.on("dragstart", this.onDragStartHandler, this);
        this.scene.input.on("drag", this.onDragHandler, this);
        this.scene.input.on("dragend", this.onDragEndHandler, this);
        this.scene.input.keyboard.on("keydown", this.keyboardEvent, this);
        this.loadMountDragonBones();

        // init data
        this.setAnimationData(node);
    }

    public setAnimationData(data: AnimationDataNode) {
        this.clear();
        this.mAnimationData = data;
        this.mCurFrameIdx = 0;
        this.mPlaying = false;
        this.mInteractive = true;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("选择动画错误!");
            return;
        }

        Logger.getInstance().log("setAnimationData: ", data);

        this.createDisplays();
        this.createMountDisplay();
        this.updatePlay();
    }

    public onResourcesLoaded() {
        this.clearDisplays();
        this.createDisplays();
        this.updatePlay();
    }
    public onResourcesCleared() {
        this.clearDisplays();
    }

    public setFrame(frameIdx: number) {
        this.mCurFrameIdx = frameIdx;

        this.updatePlay();
    }

    public setMountAnimation(aniName: string, idx?: number) {
        if (idx !== undefined) {
            if (this.mMountArmatures.length <= idx) {
                Logger.getInstance().warn("wrong idx: " + idx + "; length: " + this.mMountArmatures.length);
                return;
            }

            const arm = this.mMountArmatures[idx];
            if (aniName && arm.animation.hasAnimation(aniName)) {
                arm.animation.play(aniName);
            } else {
                arm.animation.stop();
            }
        } else {
            this.mMountArmatures.forEach((arm) => {
                if (aniName && arm.animation.hasAnimation(aniName)) {
                    arm.animation.play(aniName);
                } else {
                    arm.animation.stop();
                }
            });
        }
    }

    public updateMountDisplay() {
        this.createMountDisplay();
        this.updatePlay();
    }

    public setPlay(playing: boolean) {
        this.mPlaying = playing;

        this.updatePlay();
    }

    public setInputEnabled(val: boolean) {
        this.mInteractive = val;

        this.updateInputEnabled();

        // clear selected
        if (!val) this.mSelectedGameObjects.length = 0;
    }

    // 根据图层索引设置选中图层
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
            if (this.mMountArmatures.length <= mountPointIndex) {
                Logger.getInstance().warn("wrong idx: " + mountPointIndex + "; length: " + this.mMountArmatures.length);
                return;
            }
            this.setSelectedGameObjects(this.mMountArmatures[mountPointIndex]);
        } else {
            // 全选所有挂载点
            this.setSelectedGameObjects(this.mMountArmatures);
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
        if (this.mMountArmatureParent) {
            this.mMountArmatureParent.setDepth(this.mAnimationData.mountLayer.index);
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

    // public addAnimationLayer(idx: number) {
    //     this.createDisplay(idx);
    //     this.updatePlay();
    // }

    // public deleteAnimationLayer(idx: number) {
    //     if (!this.mDisplays.has(idx)) return;

    //     const display = this.mDisplays.get(idx);
    //     if (display) {
    //         display.parentContainer.destroy();
    //         display.destroy();
    //     }
    //     this.mDisplays.delete(idx);
    // }

    public updateAnimationLayer() {
        this.clearDisplays();
        this.createDisplays();
        this.updatePlay();
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
        this.clearDisplays();

        length = this.mMountArmatures.length;
        for (let i = length - 1; i >= 0; i--) {
            const element = this.mMountArmatures[i];
            element.destroy();
        }
        this.mMountArmatures.length = 0;

        this.mSelectedGameObjects.length = 0;

        if (this.mMountAnimationTimer) {
            this.mMountAnimationTimer.remove();
            this.mMountAnimationTimer = null;
        }
    }

    public clearDisplays() {
        this.mDisplays.forEach((element) => {
            if (element) {
                element.parentContainer.destroy();
                element.destroy();
            }
        });
        this.mDisplays.clear();
    }

    private loadMountDragonBones() {
        const res = "./resources/dragonbones";
        const pngUrl = `${res}/${this.MOUNT_DRAGONBONES_KEY}_tex.png`;
        const jsonUrl = `${res}/${this.MOUNT_DRAGONBONES_KEY}_tex.json`;
        const dbbinUrl = `${res}/${this.MOUNT_DRAGONBONES_KEY}_ske.dbbin`;
        this.scene.load.dragonbone(
            this.MOUNT_DRAGONBONES_KEY,
            pngUrl,
            jsonUrl,
            dbbinUrl,
            null,
            null,
            { responseType: "arraybuffer" },
        );
        this.scene.load.addListener(
            Phaser.Loader.Events.COMPLETE,
            this.dragonBoneLoaded,
            this
        );
        this.scene.load.start();
    }

    private dragonBoneLoaded() {
        if (!this.scene.textures.exists(this.MOUNT_DRAGONBONES_KEY)) return;

        this.scene.load.removeListener(
            Phaser.Loader.Events.COMPLETE,
            this.dragonBoneLoaded,
            this);
        this.mDragonBonesLoaded = true;

        this.createMountDisplay();
        this.updatePlay();
    }

    private createMountDisplay() {
        if (!this.mAnimationData) return;
        if (!this.mDragonBonesLoaded) return;

        const data = this.mAnimationData.mountLayer;
        if (!data) {
            this.mMountArmatures.forEach((element) => {
                element.visible = false;
            });
            return;
        }
        if (!this.mDragonBonesLoaded) return;

        if (data.mountPoint && this.mMountArmatures.length < data.mountPoint.length) {
            const count = data.mountPoint.length - this.mMountArmatures.length;
            for (let i = 0; i < count; i++) {
                const arm = this.scene.add.armature(
                    this.MOUNT_ARMATURE_KEY,
                    this.MOUNT_DRAGONBONES_KEY,
                );
                this.mMountArmatureParent.add(arm);
                this.mMountArmatures.push(arm);

                arm.setInteractive(new Phaser.Geom.Rectangle(-42, -85, 85, 85), Phaser.Geom.Rectangle.Contains);
                this.updatePerInputEnabled(arm);
            }
        }

        const originPos = this.mGrids.getAnchor90Point();
        for (let i = 0; i < this.mMountArmatures.length; i++) {
            const element = this.mMountArmatures[i];
            if (!data.mountPoint || i >= data.mountPoint.length) {
                element.visible = false;
                continue;
            }
            const pos = { x: data.mountPoint[i].x + originPos.x, y: data.mountPoint[i].y + originPos.y };
            element.setPosition(pos.x, pos.y);

            element.visible = true;
        }

        this.mMountArmatureParent.setDepth(data.index);
        this.updateChildrenIdxByDepth();
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
                    Logger.getInstance().log(ElementEditorEmitType.Active_Animation_Layer, key);
                    return;
                }
            });
        } else if (gameObject instanceof dragonBones.phaser.display.ArmatureDisplay) {
            const arm = gameObject as dragonBones.phaser.display.ArmatureDisplay;
            for (let i = 0; i < this.mMountArmatures.length; i++) {
                const element = this.mMountArmatures[i];
                if (element === arm) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, i);
                    Logger.getInstance().log(ElementEditorEmitType.Active_Mount_Layer, i);
                    return;
                }
            }
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

        const originPos = this.mGrids.getAnchor90Point();
        this.mDisplays.forEach((val, key) => {
            const data = this.mAnimationData.layerDict.get(key);
            const point = { x: val.x - originPos.x, y: val.y - originPos.y };
            if (!data.offsetLoc || data.offsetLoc.x !== point.x || data.offsetLoc.y !== point.y) {
                data.setOffsetLoc(point.x, point.y);
            }
        });

        const mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
        if (mountPoints) {
            for (let i = 0; i < mountPoints.length; i++) {
                const data = mountPoints[i];
                const armature = this.mMountArmatures[i];
                const point = { x: armature.x - originPos.x, y: armature.y - originPos.y };
                if (point.x !== data.x || point.y !== data.y) {
                    data.x = point.x;
                    data.y = point.y;
                }
            }
        }
    }

    private createDisplays() {
        if (!this.mAnimationData) return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) return;

        this.mAnimationData.layerDict.forEach((val, key) => {
            this.createDisplay(key);
        });
    }
    private createDisplay(idx: number) {
        if (!this.mAnimationData) return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY)) return;

        if (!this.mAnimationData.layerDict.has(idx)) return;
        if (this.mDisplays.has(idx)) return;

        const data = this.mAnimationData.layerDict.get(idx);
        const originPos = this.mGrids.getAnchor90Point();
        const parentCon = this.scene.add.container(0, 0);
        this.add(parentCon);
        parentCon.setDepth(data.depth);
        this.updateChildrenIdxByDepth();
        const display = this.scene.make
            .sprite(undefined, false)
            .setOrigin(0, 0);
        // .setAlpha(0.7);
        parentCon.add(display);
        this.mDisplays.set(idx, display);

        const baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = originPos.x + baseLoc.x;
        display.y = originPos.y + baseLoc.y;
    }

    private updatePlay() {
        if (!this.mAnimationData) return;
        if (!this.scene) {
            Logger.getInstance().error("no scene created");
            return;
        }

        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            this.mAnimationData.layerDict.forEach((val, key) => {
                if (!this.mDisplays.has(key)) return;
                const display = this.mDisplays.get(key);
                if (!val.layerVisible) {
                    display.visible = false;
                    return;
                }
                if (this.mPlaying) {
                    const animationName = this.mAnimationData.name + "_" + key;
                    this.makeAnimation(animationName, val.frameName, val.frameVisible, this.mAnimationData.frameRate, this.mAnimationData.frameDuration, this.mAnimationData.loop);
                    display.visible = true;
                    display.play(animationName);
                } else {
                    display.anims.stop();
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
                    if (display.input) {
                        display.input.hitArea.setSize(display.displayWidth, display.displayHeight);
                    } else {
                        display.setInteractive();
                    }
                    this.updatePerInputEnabled(display);
                    if (!val.frameVisible || this.mCurFrameIdx < val.frameVisible.length) {
                        display.visible = val.frameVisible ? val.frameVisible[this.mCurFrameIdx] : true;
                    }
                }
            });
        }

        if (this.mMountAnimationTimer) {
            this.mMountAnimationTimer.remove();
            this.mMountAnimationTimer = null;
        }
        const mountlayer = this.mAnimationData.mountLayer;
        if (!mountlayer || !mountlayer.mountPoint) return;
        const firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
            return;
        }
        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (i >= this.mMountArmatures.length) continue;
            const armature = this.mMountArmatures[i];
            if (this.mPlaying) {
                this.mMountAnimationTimer = this.scene.time.addEvent({
                    delay: 0,
                    timeScale: this.MOUNT_ANIMATION_TIME_SCALE,
                    callback: this.onMountTimerEvent,
                    callbackScope: this,
                    loop: this.mAnimationData.loop
                });
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

        // if (!this.mPlaying) this.generateFrameSumb();
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

        let t = 0;
        let f = 0;
        let curFrame = 0;
        frameDuration.forEach((dur) => {
            t += dur;
            if (this.mMountAnimationTimer.getElapsedSeconds() < t) {
                curFrame = f;
                return;
            }
            f++;
        });

        if (mountlayer.frameVisible && mountlayer.frameVisible.length <= curFrame) {
            Logger.getInstance().error("wrong frame idx: " + curFrame);
            return;
        }

        for (let i = 0; i < mountlayer.mountPoint.length; i++) {
            if (i >= this.mMountArmatures.length) continue;
            const armature = this.mMountArmatures[i];
            if (mountlayer.frameVisible) {
                const mountPointsVisible: number = mountlayer.frameVisible[curFrame];
                const visible: boolean = this.getMaskValue(mountPointsVisible, i);
                armature.visible = visible;
            } else {
                armature.visible = true;
            }
        }
    }

    private makeAnimation(animationName: string, frameName: string[], frameVisible: boolean[], frameRate: number, frameDuration: number[], loop: boolean) {
        if (frameVisible && frameName.length !== frameVisible.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameVisible.length: " + frameVisible.length);
            return;
        }
        if (frameDuration && frameName.length !== frameDuration.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameDuration.length: " + frameDuration.length);
            return;
        }
        if (this.scene.anims.exists(animationName)) {
            this.scene.anims.remove(animationName);
        }
        const frames = [];
        for (let i = 0; i < frameName.length; i++) {
            const frame = frameName[i];
            const visible = frameVisible ? frameVisible[i] : true;
            if (frameDuration) {
                frames.push({ key: SPRITE_SHEET_KEY, frame, duration: frameDuration[i] * 1000, visible });
            } else {
                frames.push({ key: SPRITE_SHEET_KEY, frame, visible });
            }
        }
        const repeat: number = loop ? -1 : 1;
        const config: Phaser.Types.Animations.Animation = {
            key: animationName,
            frames,
            frameRate,
            repeat
        };
        this.scene.anims.create(config);
    }

    private setSelectedGameObjects(gos: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mSelectedGameObjects.length = 0;
        this.mSelectedGameObjects = [].concat(gos);
        // 显示选中状态

        Logger.getInstance().log("select game objects: ", this.mSelectedGameObjects);
    }

    // // 转换数组idx为深度/层序列
    // private getDepthByArrayIdx(idx: number): number {
    //     if (!this.mAnimationData) return 0;
    //     if (!this.mAnimationData.mountLayer) return idx;
    //     const mountIdx = this.mAnimationData.mountLayer.index;
    //     const depth = idx <= mountIdx ? idx : idx + 1;
    //     return depth;
    // }
    // // 根据换层序列获取层（序列帧层/互动点层）
    // private getLayerByLayerIdx(val: number) {
    //     let layers = [];
    //     if (!this.mAnimationData) return layers;
    //     if (!this.mAnimationData.mountLayer) {
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     }
    //     const mountIdx = this.mAnimationData.mountLayer.index;
    //     if (val === mountIdx + 1) {
    //         layers = layers.concat(this.mMountArmatures);
    //     } else if (val < mountIdx + 1) {
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     } else {// val > mountIdx + 1
    //         val = val - 1;
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     }
    //     return layers;
    // }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    private generateFrameSumb() {
        this.mGrids.visible = false;
        this.scene.game.renderer.snapshot((img: HTMLImageElement) => {
            this.mEmitter.emit(ElementEditorEmitType.Update_Frame_Sumb, this.mCurFrameIdx, img.src);
            this.mGrids.visible = true;
        });
    }

    private updateInputEnabled() {
        this.mDisplays.forEach((display) => {
            this.updatePerInputEnabled(display);
        });
        this.mMountArmatures.forEach((arm) => {
            this.updatePerInputEnabled(arm);
        });
    }
    private updatePerInputEnabled(element: dragonBones.phaser.display.ArmatureDisplay | Phaser.GameObjects.Sprite) {
        if (element.input) this.scene.input.setDraggable(element, this.mInteractive);
    }

    private updateChildrenIdxByDepth() {
        this.list = this.list.sort((a, b) => {
            const ac = a as Phaser.GameObjects.Container;
            const bc = b as Phaser.GameObjects.Container;
            return ac.depth - bc.depth;
        });
    }
}

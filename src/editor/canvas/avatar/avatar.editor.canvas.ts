import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { Scene } from "tooqinggamephaser";
import { Logger } from "utils";

/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn2zhhTyXaB3HYm69a0sIYhh
 * 尺寸规范链接：https://dej4esdop1.feishu.cn/docs/doccn5QVnqQ9XQz5baCBayOy49f?from=from_copylink
 */
export class AvatarEditorCanvas extends EditorCanvas {

    public mData: AvatarEditorConfigNode;

    private readonly SCENEKEY: string = "AvatarEditorScene";
    private readonly SCENEKEY_SNAPSHOT: string = "AvatarEditorSnapshotScene";

    private mDragonbone: AvatarEditorDragonbone;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().log("AvatarEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);

        // start
        this.mData = config.node as AvatarEditorConfigNode;
        this.mGame.scene.start(this.SCENEKEY, { onCreated: this.onSceneCreated.bind(this), onUpdate: this.update.bind(this), onDestroy: this.onSceneDestroy.bind(this) });
    }

    public destroy() {
        Logger.getInstance().log("AvatarEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
        }

        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }

        super.destroy();
    }

    public getScene() {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);

        return null;
    }

    public onSceneCreated(scene: Phaser.Scene) {
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mData.WEB_AVATAR_PATH, this.mEmitter, true);
    }
    public update() {

    }
    public onSceneDestroy() {
        this.mData = null;
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
    }

    public loadLocalResources(img: any, part: string, dir: string, layer?: string) {// IImage
        if (this.mDragonbone) this.mDragonbone.loadLocalResources(img, part, dir);
    }

    public toggleFacing(dir: number) {
        if (this.mDragonbone) this.mDragonbone.setDir(dir);
    }

    public play(animationName: string) {
        if (this.mDragonbone) this.mDragonbone.play(animationName);
    }

    public clearParts() {
        if (this.mDragonbone) this.mDragonbone.clearParts();
    }

    public mergeParts(sets: any[]) {// IAvatarSet
        if (this.mDragonbone) this.mDragonbone.mergeParts(sets);
    }

    public cancelParts(sets: any[]) {// IAvatarSet
        if (this.mDragonbone) this.mDragonbone.cancelParts(sets);
    }

    public generateShopIcon(width: number, height: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // 使用width height 创建新的场景
            const curScene = this.getScene();
            const curSets = this.mDragonbone.curSets;
            if (this.mGame.scene.getScene(this.SCENEKEY_SNAPSHOT)) {
                // is running
                Logger.getInstance().error("generating!");
                reject("generating!");
                return;
            }

            // resize game
            this.mGame.scale.resize(width, height);

            this.mGame.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            curScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
                onCreated: (s: Scene) => {
                    const a = new AvatarEditorDragonbone(s, this.mData.WEB_AVATAR_PATH, this.mEmitter, true, curSets,
                        (dragonbone) => {
                            dragonbone.generateShopIcon(width, height).then((src) => {
                                resolve(src);

                                // resize game
                                this.mGame.scale.resize(this.mConfig.width, this.mConfig.height);
                                this.mGame.scene.stop(this.SCENEKEY_SNAPSHOT);
                                this.mGame.scene.remove(this.SCENEKEY_SNAPSHOT);
                            });
                        });
                }
            });
        });
    }

    public generateHeadIcon(width: number, height: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // 使用width height 创建新的场景
            const curScene = this.getScene();
            const curSets = this.mDragonbone.curSets;
            if (this.mGame.scene.getScene(this.SCENEKEY_SNAPSHOT)) {
                // is running
                Logger.getInstance().error("generating!");
                reject("generating!");
                return;
            }

            this.mGame.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            curScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
                onCreated: (s: Scene) => {
                    this.mGame.scene.sendToBack(this.SCENEKEY_SNAPSHOT);
                    const a = new AvatarEditorDragonbone(s, this.mData.WEB_AVATAR_PATH, this.mEmitter, false, curSets,
                        (dragonbone) => {
                            dragonbone.generateHeadIcon().then((src) => {
                                resolve(src);

                                this.mGame.scene.stop(this.SCENEKEY_SNAPSHOT);
                                this.mGame.scene.remove(this.SCENEKEY_SNAPSHOT);
                            });
                        });
                }
            });
        });
    }

    // 监听事件
    public on(event: AvatarEditorEmitType, fn: Function, context?: any) {
        this.mEmitter.on(event, fn, context);
    }
    public off(event: AvatarEditorEmitType, fn?: Function, context?: any, once?: boolean) {
        this.mEmitter.off(event, fn, context, once);
    }
}

export class AvatarEditorScene extends Phaser.Scene {

    private onSceneCreated: (scene: Phaser.Scene) => any;
    private onSceneUpdate: () => any;
    private onSceneDestroy: () => any;

    public preload() {
        Logger.getInstance().log("AvatarEditorScene preload");

        this.game.plugins.installScenePlugin("DragonBones", dragonBones.phaser.plugin.DragonBonesScenePlugin, "dragonbone", this, true);
    }

    public init(data: { onCreated?: (scene: Phaser.Scene) => any, onUpdate?: () => any, onDestroy?: () => any }): void {
        this.onSceneCreated = data.onCreated;
        this.onSceneUpdate = data.onUpdate;
        this.onSceneDestroy = data.onDestroy;
    }

    public create(): void {
        if (this.onSceneCreated) this.onSceneCreated(this);
    }

    public update() {
        if (this.onSceneUpdate) this.onSceneUpdate();
    }

    public destroy() {
        if (this.onSceneDestroy) this.onSceneDestroy();
    }
}

export interface AvatarEditorConfigNode {
    WEB_AVATAR_PATH: string;
}

export enum AvatarEditorEmitType {
    ERROR = "error",
}

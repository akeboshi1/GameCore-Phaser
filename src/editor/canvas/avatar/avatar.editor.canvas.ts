import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { Scene } from "tooqingphaser";
import { Logger } from "structure";

export interface IAvatarEditorCanvasConfig extends IEditorCanvasConfig {
    node: any;
}

/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn2zhhTyXaB3HYm69a0sIYhh
 * 尺寸规范链接：https://dej4esdop1.feishu.cn/docs/doccn5QVnqQ9XQz5baCBayOy49f?from=from_copylink
 */
export class AvatarEditorCanvas extends EditorCanvas {

    public mData: any;

    private readonly SCENEKEY: string = "AvatarEditorScene";
    private readonly SCENEKEY_SNAPSHOT: string = "AvatarEditorSnapshotScene";

    private mDragonbone: AvatarEditorDragonbone;

    constructor(config: IAvatarEditorCanvasConfig) {
        super(config);
        Logger.getInstance().debug("AvatarEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);

        // start
        this.mConfig.osd = config.osd || "https://osd-alpha.tooqing.com/";
        this.mData = config.node;
        this.mGame.scene.start(this.SCENEKEY, { onCreated: this.onSceneCreated.bind(this), onUpdate: this.update.bind(this), onDestroy: this.onSceneDestroy.bind(this), resPath: this.mConfig.LOCAL_HOME_PATH });
    }

    public destroy() {
        Logger.getInstance().debug("AvatarEditorCanvas.destroy()");
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
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, true);
    }
    public update() {

    }
    public onSceneDestroy() {
        this.mData = null;
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
    }

    public loadLocalResources(img: any, part: string, dir: string, layer?: string): Promise<string> {
        if (this.mDragonbone) return this.mDragonbone.loadLocalResources(img, part, dir);

        return Promise.reject("not init yet");
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
                    const a = new AvatarEditorDragonbone(s, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, true, curSets,
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
                    const a = new AvatarEditorDragonbone(s, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, false, curSets,
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
    private resPath: string;
    public preload() {
        Logger.getInstance().debug("AvatarEditorScene preload");

        this.game.plugins.installScenePlugin("DragonBones", dragonBones.phaser.plugin.DragonBonesScenePlugin, "dragonbone", this, true);

        this.load.image("avatar_placeholder", this.resPath+"dragonbones/avatar.png");
    }

    public init(data: { onCreated?: (scene: Phaser.Scene) => any, onUpdate?: () => any, onDestroy?: () => any, resPath?: string }): void {
        this.onSceneCreated = data.onCreated;
        this.onSceneUpdate = data.onUpdate;
        this.onSceneDestroy = data.onDestroy;
        this.resPath = data.resPath;
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

export enum AvatarEditorEmitType {
    ERROR = "error",
}

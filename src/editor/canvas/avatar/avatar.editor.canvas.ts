import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { Logger } from "../../../utils/log";
import { AvatarNode, IImage } from "game-capsule";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { IAvatarSet } from "game-capsule/lib/configobjects/avatar";
import AvatarEditorResourceManager from "./avatar.editor.resource.manager";

export class AvatarEditorCanvas extends EditorCanvas {

    public mData: IAvatarCanvasData;

    private readonly SCENEKEY: string = "AvatarEditorScene";

    private mDragonbone: AvatarEditorDragonbone;
    private mResourceManager: AvatarEditorResourceManager;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().log("AvatarEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);

        this.mResourceManager = new AvatarEditorResourceManager(this.mEmitter);

        // start
        this.mData = config.node as IAvatarCanvasData;
        this.mGame.scene.start(this.SCENEKEY, this);
    }

    public destroy() {
        Logger.getInstance().log("AvatarEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
        }

        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
        if (this.mResourceManager) {
            this.mResourceManager.destroy();
        }

        super.destroy();
    }

    public getScene() {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);

        return null;
    }

    public onSceneCreated() {
        const scene = this.getScene();
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mData.dbRes);
        this.mResourceManager.init(scene);
        this.mResourceManager.addResourcesChangeListener(this.mDragonbone);
    }
    public update() {

    }
    public onSceneDestroy() {
        this.mData = null;
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
        if (this.mResourceManager) {
            this.mResourceManager.destroy();
        }
    }

    public generateSpriteSheet(images: IImage[]): Promise<{ url: string, json: string }> {
        return this.mResourceManager.generateSpriteSheet(images);
    }

    public loadLocalResources(texturePath: string, dataPath: string) {
        this.mResourceManager.loadResources(texturePath, dataPath);
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

    public mergeParts(sets: IAvatarSet[]) {
        if (this.mDragonbone) this.mDragonbone.mergeParts(sets);
    }

    public cancelParts(set: IAvatarSet) {
        if (this.mDragonbone) this.mDragonbone.spliceParts(set);
    }

    public snapshoot(): Promise<string> {
        if (this.mDragonbone) {
            return this.mDragonbone.snapshoot();
        }
    }
}

class AvatarEditorScene extends Phaser.Scene {

    private mCanvas: AvatarEditorCanvas;

    public init(canvas: AvatarEditorCanvas): void {
        this.mCanvas = canvas;
    }

    public create(game: Phaser.Scene): void {
        if (this.mCanvas) this.mCanvas.onSceneCreated();
    }

    public update() {
        if (this.mCanvas) this.mCanvas.update();
    }

    public destroy() {
        if (this.mCanvas) this.mCanvas.onSceneDestroy();
    }
}

export interface IAvatarCanvasData {
    dbRes: number;
}

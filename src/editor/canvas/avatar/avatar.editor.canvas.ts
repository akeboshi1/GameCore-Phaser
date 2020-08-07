import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { Logger } from "../../../utils/log";
import { AvatarNode, IImage } from "game-capsule";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { IAvatarSet } from "game-capsule/lib/configobjects/avatar";

export class AvatarEditorCanvas extends EditorCanvas {

    public mData: AvatarEditorConfigNode;

    private readonly SCENEKEY: string = "AvatarEditorScene";

    private mDragonbone: AvatarEditorDragonbone;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().log("AvatarEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);

        // start
        this.mData = config.node as AvatarEditorConfigNode;
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

        super.destroy();
    }

    public getScene() {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);

        return null;
    }

    public onSceneCreated() {
        const scene = this.getScene();
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mData.WEB_AVATAR_PATH);
    }
    public update() {

    }
    public onSceneDestroy() {
        this.mData = null;
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
    }

    public loadLocalResources(img: IImage, part: string, dir: string, layer?: string) {
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

    public mergeParts(sets: IAvatarSet[]) {
        if (this.mDragonbone) this.mDragonbone.mergeParts(sets);
    }

    public cancelParts(set: IAvatarSet) {
        if (this.mDragonbone) this.mDragonbone.spliceParts(set);
    }

    public generateShopIcon(width: number, height: number): Promise<string> {
        if (this.mDragonbone) {
            return this.mDragonbone.generateShopIcon(width, height);
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

export interface AvatarEditorConfigNode {
    WEB_AVATAR_PATH: string;
}

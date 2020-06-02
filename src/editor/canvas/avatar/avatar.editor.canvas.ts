import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { Logger } from "../../../utils/log";
import { AvatarNode } from "game-capsule";
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";

export class AvatarEditorCanvas extends EditorCanvas {

    public mData: AvatarNode;

    private readonly SCENEKEY: string = "AvatarEditorScene";

    private mDragonbone: AvatarEditorDragonbone;

    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().log("AvatarEditorCanvas.constructor()");

        this.mGame.scene.add(this.SCENEKEY, AvatarEditorScene);

        // start
        this.mData = config.node as AvatarNode;
        this.mGame.scene.start(this.SCENEKEY, this);
    }

    public destroy() {
        Logger.getInstance().log("AvatarEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
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
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mData);
    }
    public update() {
        if (this.mData && this.mDragonbone) {
            this.mDragonbone.update();
        }
    }
    public onSceneDestroy() {
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
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

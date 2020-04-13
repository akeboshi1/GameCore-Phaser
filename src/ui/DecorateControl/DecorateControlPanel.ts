import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class DecorateControlPanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private mExitBtn: Phaser.GameObjects.Image;
    private mRecycleAllBtn: Phaser.GameObjects.Image;
    private mRedoBtn: Phaser.GameObjects.Image;
    private mFurniBtn: Phaser.GameObjects.Image;
    private mSaveBtn: Phaser.GameObjects.Image;
    private mTopBtns: Phaser.GameObjects.Image[];
    private mDoorBtn: Phaser.GameObjects.Image;
    private mStairBtn: Phaser.GameObjects.Image;
    private mMenuContainer: Phaser.GameObjects.Container;
    private readonly key = "decorateControl";

    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.setTween(false);
    }

    public addListen() {
        this.mExitBtn.on("pointerup", this.onExitHandler, this);
        this.mRecycleAllBtn.on("pointerup", this.onRecycleAllHandler, this);
        this.mRedoBtn.on("pointerup", this.onRedoHandler, this);
        this.mFurniBtn.on("pointerup", this.onShowFurniHandler, this);
        this.mSaveBtn.on("pointerup", this.onSaveHandler, this);
        this.mDoorBtn.on("pointerup", this.onGetDoorHandler, this);
    }

    public removeListen() {
        this.mExitBtn.off("pointerup", this.onExitHandler, this);
        this.mRecycleAllBtn.off("pointerup", this.onRecycleAllHandler, this);
        this.mRedoBtn.off("pointerup", this.onRedoHandler, this);
        this.mFurniBtn.off("pointerup", this.onShowFurniHandler, this);
        this.mSaveBtn.off("pointerup", this.onSaveHandler, this);
        this.mDoorBtn.off("pointerup", this.onGetDoorHandler, this);
    }

    public resize(w: number, h: number) {
        this.setSize(w, 131 * this.dpr);
        // this.x = this.width * this.originX;
        // this.y = this.height * this.originY;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.6);
        this.mBackground.fillRect(0, 0, this.width, this.height);
        super.resize(w, h);
    }

    protected preload() {
        this.addAtlas(this.key, "decorate_control/decorate_control.png", "decorate_control/decorate_control.json");
        super.preload();
    }

    protected init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.mBackground = this.scene.make.graphics(undefined, false);

        this.mTopBtns = [];
        this.mExitBtn = this.scene.make.image({
            key: this.key,
            frame: "exitBtn.png",
        }, false).setOrigin(0).setInteractive();

        this.mRecycleAllBtn = this.scene.make.image({
            key: this.key,
            frame: "recycleAllBtn.png",
        }, false).setOrigin(0).setInteractive();

        this.mRedoBtn = this.scene.make.image({
            key: this.key,
            frame: "redoBtn.png",
        }, false).setOrigin(0).setInteractive();

        this.mFurniBtn = this.scene.make.image({
            key: this.key,
            frame: "furniBtn.png",
        }, false).setOrigin(0).setInteractive();

        this.mSaveBtn = this.scene.make.image({
            key: this.key,
            frame: "saveBtn.png"
        }, false).setOrigin(0).setInteractive();

        this.mDoorBtn = this.scene.make.image({
            x: 10 * this.dpr,
            y: 83 * this.dpr,
            key: this.key,
            frame: "doorBtn.png",
        }, false).setOrigin(0).setInteractive();

        this.mStairBtn = this.scene.make.image({
            x: 64 * this.dpr,
            y: 83 * this.dpr,
            key: this.key,
            frame: "stairBtn.png"
        }, false).setOrigin(0);

        this.mTopBtns = [this.mExitBtn, this.mRecycleAllBtn, this.mRedoBtn, this.mFurniBtn, this.mSaveBtn];
        this.add(this.mBackground);
        this.add(this.mTopBtns);
        this.add([this.mDoorBtn, this.mStairBtn]);

        const zoom = this.mWorld.uiScaleNew;
        let totalWidth = w - 10 * 2 * this.dpr * zoom;
        this.mTopBtns.map((btn) => totalWidth -= btn.width * zoom);
        const space = totalWidth / (this.mTopBtns.length - 1) / zoom;

        for (let i = 0; i < this.mTopBtns.length; i++) {
            if (i > 0) {
                this.mTopBtns[i].x = space + (this.mTopBtns[i - 1].width) + this.mTopBtns[i - 1].x;
            } else {
                this.mTopBtns[i].x = 10 * this.dpr;
            }
            this.mTopBtns[i].y = 11 * this.dpr;
        }
        this.resize(w, h);
        super.init();
    }

    private onExitHandler() {
        this.emit("exit");
    }

    private onRecycleAllHandler() {
        this.emit("recycleAll");
    }

    private onRedoHandler() {
        this.emit("redo");
    }

    private onShowFurniHandler() {
        this.emit("showFurni");
    }

    private onSaveHandler() {
        this.emit("save");
    }

    private onGetDoorHandler() {
        this.emit("getDoor");
    }
}

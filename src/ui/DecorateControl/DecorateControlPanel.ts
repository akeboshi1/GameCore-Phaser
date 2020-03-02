import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";

export class DecorateControlPanel extends Panel {
    private mBackground: Phaser.GameObjects.Graphics;
    private mExitBtn: Phaser.GameObjects.Image;
    private mRecycleAllBtn: Phaser.GameObjects.Image;
    private mRedoBtn: Phaser.GameObjects.Image;
    private mFurniBtn: Phaser.GameObjects.Image;
    private mSaveBtn: Phaser.GameObjects.Image;
    private mTopBtns: Phaser.GameObjects.Image[];
    private mDoorBtn: Phaser.GameObjects.Image;
    private mStairBtn: Phaser.GameObjects.Image;
    private readonly key = "decorateControl";

    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.setTween(false);
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

        let totalWidth = w - 10 * 2 * this.dpr;
        this.mTopBtns.map((btn) => totalWidth -= btn.width);
        const space = totalWidth / (this.mTopBtns.length - 1);
        for (let i = 0; i < this.mTopBtns.length; i++) {
            if (i > 0) {
                this.mTopBtns[i].x = space + (i > 0 ? this.mTopBtns[i - 1].width + this.mTopBtns[i - 1].x : 0);
            } else {
                this.mTopBtns[i].x = 10 * this.dpr;
            }
            this.mTopBtns[i].y = 11 * this.dpr;
        }

        this.addActionListener();

        this.resize(w, h);
        super.init();
    }

    private addActionListener() {
        this.mExitBtn.on("pointerup", this.onExitHandler, this);
        this.mRecycleAllBtn.on("pointerup", this.onRecycleAllHandler, this);
        this.mRedoBtn.on("pointerup", this.onRedoHandler, this);
        this.mFurniBtn.on("pointerup", this.onShowFurniHandler, this);
        this.mSaveBtn.on("pointerup", this.onSaveHandler, this);
        this.mDoorBtn.on("pointerup", this.onGetDoorHandler, this);
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
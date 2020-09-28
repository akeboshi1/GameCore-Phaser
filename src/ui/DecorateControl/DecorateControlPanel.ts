import { Button, ClickEvent } from "apowophaserui";
import { WorldService } from "../../game/world.service";
import { BasePanel } from "../components/BasePanel";

export class DecorateControlPanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private mExitBtn: Button;
    private mRecycleAllBtn: Button;
    private mRedoBtn: Button;
    private mFurniBtn: Button;
    private mSaveBtn: Button;
    private mTopBtns: Button[];
    private mDoorBtn: Button;
    private mStairBtn: Button;
    private mSaving: boolean = false;
    private mMenuContainer: Phaser.GameObjects.Container;
    private readonly key = "decorateControl";

    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mExitBtn.on(ClickEvent.Tap, this.onExitHandler, this);
        this.mRecycleAllBtn.on(ClickEvent.Tap, this.onRecycleAllHandler, this);
        this.mRedoBtn.on(ClickEvent.Tap, this.onRedoHandler, this);
        this.mFurniBtn.on(ClickEvent.Tap, this.onShowFurniHandler, this);
        this.mSaveBtn.on(ClickEvent.Tap, this.onSaveHandler, this);
        this.mDoorBtn.on(ClickEvent.Tap, this.onGetDoorHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mExitBtn.off(ClickEvent.Tap, this.onExitHandler, this);
        this.mRecycleAllBtn.off(ClickEvent.Tap, this.onRecycleAllHandler, this);
        this.mRedoBtn.off(ClickEvent.Tap, this.onRedoHandler, this);
        this.mFurniBtn.off(ClickEvent.Tap, this.onShowFurniHandler, this);
        this.mSaveBtn.off(ClickEvent.Tap, this.onSaveHandler, this);
        this.mDoorBtn.off(ClickEvent.Tap, this.onGetDoorHandler, this);
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
        this.mExitBtn = new Button(this.scene, this.key, "exitBtn.png");
        this.mRecycleAllBtn = new Button(this.scene, this.key, "recycleAllBtn.png");
        this.mRedoBtn = new Button(this.scene, this.key, "redoBtn.png");
        this.mFurniBtn = new Button(this.scene, this.key, "furniBtn.png");
        this.mSaveBtn = new Button(this.scene, this.key, "saveBtn.png");

        this.mDoorBtn = new Button(this.scene, this.key, "doorBtn.png");
        this.mDoorBtn.setPosition(10 * this.dpr + this.mDoorBtn.width * 0.5, 83 * this.dpr + this.mDoorBtn.height * 0.5);
        this.mStairBtn = new Button(this.scene, this.key, "stairBtn.png");
        this.mStairBtn.setPosition(64 * this.dpr + this.mStairBtn.width * 0.5, 83 * this.dpr + this.mStairBtn.height * 0.5);

        this.mTopBtns = [this.mExitBtn, this.mRecycleAllBtn, this.mRedoBtn, this.mFurniBtn, this.mSaveBtn];
        this.add(this.mBackground);
        this.add(this.mTopBtns);
        this.add([this.mDoorBtn, this.mStairBtn]);

        const zoom = this.mWorld.uiScale;
        let totalWidth = w - 10 * 2 * this.dpr * zoom;
        this.mTopBtns.map((btn) => totalWidth -= btn.width * zoom);
        const space = totalWidth / (this.mTopBtns.length - 1) / zoom;

        for (let i = 0; i < this.mTopBtns.length; i++) {
            if (i > 0) {
                this.mTopBtns[i].x = space + (this.mTopBtns[i - 1].width * 0.5) + this.mTopBtns[i - 1].x + this.mTopBtns[i].width * 0.5;
            } else {
                this.mTopBtns[i].x = 10 * this.dpr + this.mTopBtns[i].width * 0.5;
            }
            this.mTopBtns[i].y = 11 * this.dpr + this.mTopBtns[i].height * 0.5;
        }
        this.resize(w, h);
        this.mSaving = false;
        super.init();
    }

    private onExitHandler() {
        if (this.mSaving) {
            return;
        }
        this.mSaving = true;
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
        if (this.mSaving) {
            return;
        }
        this.mSaving = true;
        this.emit("save");
    }

    private onGetDoorHandler() {
        this.emit("getDoor");
    }
}

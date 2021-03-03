import {Button, ClickEvent} from "apowophaserui";
import {BasePanel, DragonbonesDisplay, FramesDisplay, UiManager} from "gamecoreRender";
import {MessageType, ModuleName, RENDER_PEER} from "structure";
import {IPos, Logger} from "utils";
import {UIAtlasName} from "picaRes";
import {PicaBasePanel} from "../pica.base.panel";

export class PicaDecorateControlPanel extends PicaBasePanel {
    private mSaveBtn: Button;
    private mRotateBtn: Button;
    private mRecycleBtn: Button;
    private mAutoPlaceBtn: Button;
    private mExitBtn: Button;
    private mBtns: Button[];
    private mTarget: FramesDisplay | DragonbonesDisplay;

    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICADECORATECONTROL_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.effectcommon];
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mSaveBtn.on(ClickEvent.Tap, this.onSaveHandler, this);
        this.mRotateBtn.on(ClickEvent.Tap, this.onRotateHandler, this);
        this.mRecycleBtn.on(ClickEvent.Tap, this.onRecycleAllHandler, this);
        this.mAutoPlaceBtn.on(ClickEvent.Tap, this.onAutoPlaceHandler, this);
        this.mExitBtn.on(ClickEvent.Tap, this.onExitHandler, this);

        this.render.emitter.on(MessageType.UPDATE_SELECTED_DECORATE_ELEMENT_POSITION, this.updatePosition, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mSaveBtn.off(ClickEvent.Tap, this.onSaveHandler, this);
        this.mRotateBtn.off(ClickEvent.Tap, this.onRotateHandler, this);
        this.mRecycleBtn.off(ClickEvent.Tap, this.onRecycleAllHandler, this);
        this.mAutoPlaceBtn.off(ClickEvent.Tap, this.onAutoPlaceHandler, this);
        this.mExitBtn.off(ClickEvent.Tap, this.onExitHandler, this);

        this.render.emitter.off(MessageType.UPDATE_SELECTED_DECORATE_ELEMENT_POSITION, this.updatePosition, this);
    }

    public resize(w: number, h: number) {
        this.setSize(w, 131 * this.dpr);
        super.resize(w, h);
    }

    public updateCanPlace(canPlace: boolean) {
        if (this.mSaveBtn) this.mSaveBtn.enable = canPlace;
    }

    protected init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        this.mBtns = [];
        this.mSaveBtn = new Button(this.scene, ModuleName.PICADECORATE_NAME, "room_decorate_confirm.png");
        this.mRotateBtn = new Button(this.scene, ModuleName.PICADECORATE_NAME, "room_decorate_Spin.png");
        this.mRecycleBtn = new Button(this.scene, ModuleName.PICADECORATE_NAME, "room_decorate_put.png");
        this.mAutoPlaceBtn = new Button(this.scene, ModuleName.PICADECORATE_NAME, "room_decorate_tiled.png");
        this.mExitBtn = new Button(this.scene, ModuleName.PICADECORATE_NAME, "room_decorate_closed.png");

        this.mBtns = [this.mSaveBtn, this.mRotateBtn, this.mRecycleBtn, this.mAutoPlaceBtn, this.mExitBtn];
        this.add(this.mBtns);

        const zoom = this.render.uiScale;
        let totalWidth = w - 10 * 2 * this.dpr * zoom;
        this.mBtns.map((btn) => totalWidth -= btn.width * zoom);
        const space = totalWidth / (this.mBtns.length - 1) / zoom;

        for (let i = 0; i < this.mBtns.length; i++) {
            if (i > 0) {
                this.mBtns[i].x = space + (this.mBtns[i - 1].width * 0.5) + this.mBtns[i - 1].x + this.mBtns[i].width * 0.5;
            } else {
                this.mBtns[i].x = 10 * this.dpr + this.mBtns[i].width * 0.5;
            }
            this.mBtns[i].y = 11 * this.dpr + this.mBtns[i].height * 0.5;
        }
        this.resize(w, h);
        super.init();

        const {id, pos, canPlace} = this.mShowData;
        const display = this.render.displayManager.getDisplay(id);
        if (display) {
            this.mTarget = display;
        } else {
            Logger.getInstance().error("cannot find display: ", id);
        }
        this.updateCanPlace(canPlace);
        this.updatePosition();
    }

    private updatePosition() {
        if (!this.mTarget) {
            this.mediator.hide();
            return;
        }

        this.y = this.mTarget.y * this.dpr;
    }

    private onSaveHandler() {
        this.mediator.ensureChanges();
    }

    private onRotateHandler() {
        this.mediator.rotate();
    }

    private onRecycleAllHandler() {
        this.mediator.recycle();
    }

    private onAutoPlaceHandler() {
        this.mediator.autoPlace();
    }

    private onExitHandler() {
        this.mediator.exit();
    }

    private get mediator() {
        return this.render.mainPeer[this.key];
    }
}

import { Button, ClickEvent } from "apowophaserui";
import { BasePanel, PlayScene, UiManager } from "gamecoreRender";
import { MessageType, ModuleName, RENDER_PEER } from "structure";
import { Direction, IPosition45Obj, LogicPos, Position45 } from "utils";
export class PicaDecoratePanel extends BasePanel {
    private readonly resKey = "decorate";
    private readonly minGrid: number = 2;
    private readonly maxGrid: number = 10;
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Button;
    private mRecycleBtn: Button;
    private mOkBtn: Button;
    private mCancelBtn: Button;
    private mMenuContainer: Phaser.GameObjects.Container;
    private mMainMenus: Button[];

    private mHorizontalBtn: Button;
    private mMoveBtn: Button;
    private mRepeatBtn: Button;
    private mExtendBtn: Button;
    private mSubMenus: Phaser.GameObjects.Container;

    private mMoveMenuContainer: MoveMenu;
    private mRepeatMenuContainer: MoveMenu;
    private mDisplayObject;
    private mSprite;
    private offset: LogicPos = new LogicPos();
    private mScaleRatio: number = 1;

    private mCanPut: boolean;

    constructor(uiManager: UiManager) {
        super(uiManager.render.sceneManager.getMainScene(), uiManager.render);
        this.key = ModuleName.PICADECORATE_NAME;
        this.mScaleRatio = uiManager.render.scaleRatio;
    }

    public show(param?: any) {
        this.mShowData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        (<PlayScene>this.scene).layerManager.addToLayer("sceneUILayer", this);
    }

    public addListen() {
        if (this.mCancelBtn) this.mCancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.on(ClickEvent.Tap, this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.on(ClickEvent.Tap, this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.on(ClickEvent.Tap, this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.on(ClickEvent.Tap, this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.on(ClickEvent.Tap, this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.on(ClickEvent.Tap, this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.register();
            this.mMoveMenuContainer.on(ClickEvent.Tap, this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.register();
            this.mRepeatMenuContainer.on(ClickEvent.Tap, this.onRepeatHandler, this);
            this.mRepeatMenuContainer.on(ClickEvent.Hold, this.onHoldRepeatHandler, this);
        }
    }

    public removeListen() {
        if (this.mCancelBtn) this.mCancelBtn.off(ClickEvent.Tap, this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.off(ClickEvent.Tap, this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.off(ClickEvent.Tap, this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.off(ClickEvent.Tap, this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.off(ClickEvent.Tap, this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.off(ClickEvent.Tap, this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.off(ClickEvent.Tap, this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.unRegister();
            this.mMoveMenuContainer.off(ClickEvent.Tap, this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.unRegister();
            this.mRepeatMenuContainer.off(ClickEvent.Tap, this.onRepeatHandler, this);
            this.mRepeatMenuContainer.off(ClickEvent.Hold, this.onHoldRepeatHandler, this);
        }
    }

    public setElement(id: number) {
        this.mDisplayObject = this.render.displayManager.getDisplay(id);
        if (!this.mInitialized) {
            return;
        }
        this.setPos(this.mDisplayObject.x, this.mDisplayObject.y);

        this.addListen();
    }

    public canPut(val: boolean) {
        if (val !== this.mCanPut) {
            this.mCanPut = val;
            if (!this.mOkBtn) {
                return;
            }
            this.mOkBtn.enable = val;
        }
    }

    public setPos(x: number, y?: number, z?: number) {
        this.x = x * this.mScaleRatio;
        this.y = (y + this.offset.y) * this.mScaleRatio;
        this.z = z || 0;
    }

    public setOffset(x: number, y: number) {
        this.offset.x = x;
        this.offset.y = y;
        if (this.mDisplayObject) this.setPos(this.mDisplayObject.x, this.mDisplayObject.y);
    }

    public destroy() {
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.destroy();
        }
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.destroy();
        }
        super.destroy();
    }

    protected preload() {
        this.addAtlas(this.key, "decorate_edit_menu/decorate_edit_menu.png", "decorate_edit_menu/decorate_edit_menu.json");
        super.preload();
    }

    protected init() {
        const w = this.scene.cameras.main.width / this.scale;
        const h = this.scene.cameras.main.height / this.scale;

        this.mMainMenus = [];
        this.mMenuContainer = this.scene.make.container({
            x: w >> 1,
        }, false);
        this.mSubMenus = this.scene.make.container({
            x: w >> 1,
            y: 60 * this.dpr
        }, false);

        this.mOkBtn = new Button(this.scene, this.key, "ok_btn.png");
        this.mRecycleBtn = new Button(this.scene, this.key, "recycly_btn.png");
        this.mTurnBtn = new Button(this.scene, this.key, "turn_btn.png");
        this.mCancelBtn = new Button(this.scene, this.key, "cancel_btn.png");
        this.mMenuContainer.y = this.mOkBtn.height * 0.5;
        this.mSubMenus.y = this.mMenuContainer.y + 60 * this.dpr;

        this.mHorizontalBtn = new Button(this.scene, this.key, "horizontal_btn.png");
        this.mMoveBtn = new Button(this.scene, this.key, "move_btn.png");
        this.mRepeatBtn = new Button(this.scene, this.key, "repeat_btn.png");
        this.mExtendBtn = new Button(this.scene, this.key, "extend_btn.png");

        this.mMoveMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mMoveMenuContainer.y = this.mSubMenus.y + 15 * this.dpr + this.mMoveMenuContainer.height;

        this.mRepeatMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mRepeatMenuContainer.y = this.mMoveMenuContainer.y;

        const zoom = this.scale;

        this.add([this.mMenuContainer, this.mSubMenus]);
        this.mMenuContainer.add([this.mOkBtn, this.mTurnBtn, this.mRecycleBtn, this.mCancelBtn]);
        this.mSubMenus.add([this.mHorizontalBtn, this.mMoveBtn, this.mRepeatBtn, this.mExtendBtn]);
        // this.add(this.mSubMenus);
        let mainMenuW = w - 55 * this.dpr * this.mWorld.uiScale * 2;
        this.mMenuContainer.x = -mainMenuW >> 1;
        const list = this.mMenuContainer.list;
        list.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        let margin = mainMenuW / (list.length - 1) / zoom;
        for (let i = 1; i < list.length; i++) {
            const preButton = <Phaser.GameObjects.Image>list[i - 1];
            const button = <Phaser.GameObjects.Image>list[i];
            button.x = preButton.width + preButton.x + margin;
        }

        mainMenuW = w - 70 * this.dpr * this.mWorld.uiScale * 2;
        this.mSubMenus.x = -mainMenuW >> 1;
        const subList = this.mSubMenus.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        margin = mainMenuW / (subList.length - 1) / zoom;
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image>subList[i - 1];
            const button = <Phaser.GameObjects.Image>subList[i];
            button.x = preButton.width + preButton.x + margin;
        }

        this.mMoveMenuContainer.x = this.mSubMenus.x + this.mMoveBtn.x + 29 * this.dpr;
        this.mRepeatMenuContainer.x = this.mSubMenus.x + this.mRepeatBtn.x + 29 * this.dpr;

        this.mOkBtn.enable = this.mCanPut;

        super.init();

        if (this.mDisplayObject) this.setElement(this.mDisplayObject);
    }

    private onTurnHandler() {
        const mediator = this.mediator;
        if (mediator) {
            mediator.turn();
        }
    }

    private onRecycleHandler() {
        const mediator = this.mediator;
        if (mediator) {
            mediator.recycle();
        }
    }

    private onCancelHandler() {
        const mediator = this.mediator;
        if (mediator) {
            mediator.cancel();
        }
    }

    private onAddHandler() {
        if (this.mCanPut) {
            const mediator = this.mediator;
            if (mediator) mediator.putElement();
        }
    }

    private onMoveHandler(dir: number) {
        if (typeof dir !== "number") {
            return;
        }
        const mediator = this.mediator;
        if (mediator) mediator.moveDir(dir);
    }

    private onRepeatHandler(dir: Direction) {
        const mediator = this.mediator;
        if (!mediator) return;
        mediator.repeatAdd(dir, 2);
    }

    private onHoldRepeatHandler(dir: Direction) {
        const mediator = this.mediator;
        if (!mediator) return;
        mediator.repeatAdd(dir, 10);
    }

    private onShowMoveMenuHandler() {
        this.add(this.mMoveMenuContainer);
        this.remove(this.mRepeatMenuContainer);
    }

    private onShowRepeatHandler() {
        this.add(this.mRepeatMenuContainer);
        this.remove(this.mMoveMenuContainer);
    }

    private onShowExtendsHandler() {
    }

    get mediator() {
        return this.render.mainPeer[ModuleName.PICADECORATE_NAME];
    }
}

class MoveMenu extends Phaser.GameObjects.Container {
    private mBtns: any[];
    private mArrow1: Button;
    private mArrow3: Button;
    private mArrow5: Button;
    private mArrow7: Button;
    constructor(scene: Phaser.Scene, key: string, dpr: number = 1, uiScale: number = 1) {
        super(scene);
        const bg = scene.make.image({
            key,
            frame: "bg.png"
        }, false);
        this.setSize(bg.displayWidth, bg.displayHeight);

        this.mArrow1 = new Button(this.scene, key, "arrow_1.png");
        this.mArrow1.setData("dir", Direction.north_west);
        this.mArrow3 = new Button(this.scene, key, "arrow_3.png");
        this.mArrow3.setData("dir", Direction.west_south);
        this.mArrow5 = new Button(this.scene, key, "arrow_5.png");
        this.mArrow5.setData("dir", Direction.south_east);
        this.mArrow7 = new Button(this.scene, key, "arrow_7.png");
        this.mArrow7.setData("dir", Direction.east_north);
        this.mBtns = [this.mArrow1, this.mArrow3, this.mArrow5, this.mArrow7];
        this.add(bg);
        this.add(this.mBtns);

        const w = this.width;
        let totalWidth = this.width - 20 * dpr;
        this.mBtns.map((btn) => totalWidth -= btn.displayWidth);
        const space = totalWidth = totalWidth / (this.mBtns.length - 1);
        const arrowH = (3 * dpr);
        for (let i = 0; i < this.mBtns.length; i++) {
            if (i === 0) {
                this.mBtns[i].x = 10 * dpr + this.mBtns[i].width / 2 - this.width / 2;
            } else {
                this.mBtns[i].x = space + this.mBtns[i - 1].x + this.mBtns[i - 1].width;
            }
            this.mBtns[i].y = arrowH;
        }
        this.setInteractive();
    }

    public register() {
        this.mArrow1.on(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow1.on(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow3.on(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow3.on(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow5.on(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow5.on(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow7.on(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow7.on(ClickEvent.Tap, this.onClickHandler, this);
    }

    public unRegister() {
        this.mArrow1.off(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow1.off(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow3.off(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow3.off(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow5.off(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow5.off(ClickEvent.Tap, this.onClickHandler, this);
        this.mArrow7.off(ClickEvent.Hold, this.onHoldHandler, this);
        this.mArrow7.off(ClickEvent.Tap, this.onClickHandler, this);
    }

    private onHoldHandler(gameobject) {
        this.emit(ClickEvent.Hold, gameobject.getData("dir"));
    }

    private onClickHandler(pointer, gameobject) {
        this.emit(ClickEvent.Tap, gameobject.getData("dir"));
    }
}

import { GameScroller } from "apowophaserui";
import { BasePanel } from "../components/base.panel";
import { UiManager } from "../ui.manager";
import { ModuleName } from "structure";

export class ActivityPanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mGameScroll: GameScroller;
    private activeUIData: any;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.ACTIVITY_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width - 20 * this.dpr;
        this.content.y = this.content.height * 0.5 + 90 * this.dpr;
        this.setSize(w, h);
        this.mGameScroll.refreshMask();
    }

    show(param?: any) {
        super.show(param);
        if (!this.activeUIData) this.checkUpdateActive();
        if (this.mInitialized) {
            this.setInteractive();
            if (this.activeUIData) this._updateUIState(this.activeUIData);
        }
    }

    updateUIState(active?: any) {
        if (!this.mInitialized) {
            return;
        }
        if (active.name === "activity.taskbtn") {
            const btn = <Phaser.GameObjects.Image>(this.mGameScroll.getItemAt(3));
            btn.visible = active.visible;
            this.mGameScroll.Sort();
        }
    }

    protected preload() {
        this.addAtlas(this.key, "activity/activity.png", "activity/activity.json");
        super.preload();
    }

    protected init() {
        const conWidth = 60 * this.dpr, conHeight = 300 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        const img = this.scene.make.image({ key: this.key, frame: "home_more" });
        this.content.add(img);
        img.y = -conHeight * 0.5 + img.height * 0.5;
        this.add(this.content);
        this.mGameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: this.content.width,
            height: this.content.height - 50 * this.dpr,
            zoom: this.scale,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 10 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.content.add(this.mGameScroll);
        for (let i = 0; i < 4; i++) {
            const frame = `icon_${i + 1}`;
            const image = this.scene.make.image({ key: this.key, frame });
            image.name = i + 1 + "";
            this.mGameScroll.addItem(image);
        }
        this.mGameScroll.Sort();
        this.resize(conWidth, conHeight);
        super.init();
    }

    private onClickHandler(name: string) {
        if (name === "4") {
            this.emit("showPanel", "Task");
        } else if (name === "3") {
            this.emit("showPanel", "PicFriend");
        } else if (name === "2") {
            this.emit("showPanel", "PicOrder");
        }
    }
    private async checkUpdateActive() {
        this.activeUIData = await this.render.mainPeer.getActiveUIData("Activity");
        if (!this.mInitialized) return;
        this._updateUIState(this.activeUIData);
    }

    private _updateUIState(data: any) {
        if (!data) return;
        for (const tmpData of data) {
            this.updateUIState(tmpData);
        }
    }

    private onPointerUpHandler(gameobject) {
        const name = gameobject.name;
        this.onClickHandler(name);
    }
}

import { GameScroller } from "apowophaserui";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";

export class ActivityPanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mGameScroll: GameScroller;
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
        if (this.mInitialized) {
            this.setInteractive();
        }
        super.show(param);
        this.checkUpdateActive();
    }

    addListen() {
        if (!this.mInitialized) return;
        this.mGameScroll.addListen();
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.mGameScroll.removeListen();
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
        const conWidth = 60 * this.dpr, conHeight = 270 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
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
        const img = this.scene.make.image({ key: this.key, frame: "home_more" });
        img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.content.add(img);
        img.y = conHeight * 0.5 - img.height * 0.5;
        for (let i = 0; i < 4; i++) {
            const frame = `icon_${i + 1}`;
            const image = this.scene.make.image({ key: this.key, frame });
            image.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            image.name = i + 1 + "";
            this.mGameScroll.addItem(image);
        }
        this.mGameScroll.Sort();
        this.resize(conWidth, conHeight);
        super.init();
    }

    private onClickHandler(name: string) {
        if (name === "4") {
            this.render.renderEmitter("showPanel", ModuleName.PICATASK_NAME);
        } else if (name === "3") {
            this.render.renderEmitter("showPanel", ModuleName.PICAFRIEND_NAME);
        } else if (name === "2") {
            this.render.renderEmitter("showPanel", ModuleName.PICAORDER_NAME);
        } else if (name === "1") {
            this.render.renderEmitter("showPanel", "PicaRecharge");
        }
    }
    private async checkUpdateActive() {
        const arr = await this.render.mainPeer.getActiveUIData("Activity");
        if (arr) {
            for (const data of arr) {
                this.updateUIState(data);
            }
        }
    }

    private onPointerUpHandler(gameobject) {
        const name = gameobject.name;
        this.onClickHandler(name);
    }
}

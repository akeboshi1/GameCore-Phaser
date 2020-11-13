import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Handler, i18n } from "utils";
import { PicaManorContentPanel } from "./PicaManorContentPanel";
import { PicaManorScrollPanel } from "./PicaManorScrollPanel";

export class PicaManorListPanel extends BasePanel {
    private content: PicaManorContentPanel;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picScrollPanel: PicaManorScrollPanel;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAMANORLIST_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
    }

    public show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
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
        this.setInteractive();
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "manor/manor.png", "manor/manor.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        const zoom = this.scale;
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0);
        this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.add(this.mBackGround);
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        const conWidth = 295 * this.dpr;
        const conHeight = hei - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = wid * 0.5;
        this.content = new PicaManorContentPanel(this.scene, conX, conY, conWidth, conHeight, this.dpr, this.key);
        this.content.setCloseHandler(new Handler(this, this.OnCloseHandler));
        this.add(this.content);
        this.resize(wid, hei);
        super.init();
        this.openManorList();
    }

    public setManorList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_STREET_LIST
        this.picScrollPanel.setManorListData(content);
    }
    public destroy() {

        super.destroy();
    }

    private openManorList() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querylist");
        this.showScrollPanel();
        this.content.setTitleText(i18n.t("manor.title"));
    }

    private showScrollPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picScrollPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picScrollPanel = new PicaManorScrollPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picScrollPanel.setHandler(new Handler(this, (roomid) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenter", roomid);
            }));
        }
        this.content.add(this.picScrollPanel);
        this.picScrollPanel.resetMask();
    }

    private hideScrollPanel() {
        this.content.remove(this.picScrollPanel);
    }

    private setContentSize(topoffset: number, bottomoffset: number) {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 334 * this.dpr;
        const conHeight = 452 * this.dpr;// height - topoffset - bottomoffset;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
    }

    private OnCloseHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
    }

    private onSelectItemHandler(item) {

    }
}

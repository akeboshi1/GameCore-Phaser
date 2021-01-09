import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Handler } from "utils";
import { PicaTreasureAllOpenPanel } from "./PicaTreasureAllOpenPanel";
import { PicaTreasureOpenPanel } from "./PicaTreasureOpenPanel";
import { PicaTreasurePreviewPanel } from "./PicaTreasurePreviewPanel";
export class PicaTreasurePanel extends BasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private previewPanel: PicaTreasurePreviewPanel;
    private treasureOpenPanel: PicaTreasureOpenPanel;
    private treasureAllOpenPanel: PicaTreasureAllOpenPanel;
    private content: Phaser.GameObjects.Container;
    private trasureData: any;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICATREASURE_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.88);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.content.x = width / 2;
        this.content.y = height / 2;
        this.setSize(width * this.scale, height * this.scale);
    }

    onShow() {
        this.setInteractive();
        this.setTreasureData(this.showData);
    }
    preload() {
        this.addAtlas(this.key, "treasure/treasure.png", "treasure/treasure.json");
        this.addAtlas(UIAtlasName.circleeffect, "circleeffect/circleeffect.png", "circleeffect/circleeffect.json");
        this.addAtlas(UIAtlasName.stareffect, "stareffect/stareffect.png", "stareffect/stareffect.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.textureUrl(UIAtlasName.commonUrl), UIAtlasName.jsonUrl(UIAtlasName.commonUrl));
        this.addAtlas(UIAtlasKey.common3Key, UIAtlasName.textureUrl(UIAtlasName.common3Url), UIAtlasName.jsonUrl(UIAtlasName.common3Url));
        super.preload();
    }
    public destroy() {
        super.destroy();
        if (this.previewPanel) this.previewPanel.destroy();
        if (this.treasureOpenPanel) this.treasureOpenPanel.destroy();
        if (this.treasureAllOpenPanel) this.treasureAllOpenPanel.destroy();
    }
    init() {
        const width = this.cameraWidth;
        const height = this.cameraHeight;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width / this.scale, height / this.scale), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    setTreasureData(data: any) {
        this.trasureData = data;
        if (!this.mInitialized) return;
        if (!data) return;
        if (data.type === "preview") {
            this.setPreviewData(data.data);
        } else if (data.type === "open") {
            this.setTreasureOpenData(data.data);
        } else if (data.type === "roamdraw") {
            this.setTreasureAllOpenData(data.data);
        } else {
            this.setPreviewData(data.data);
        }
    }

    setPreviewData(data: any) {
        this.openPreviewPanel();
        this.previewPanel.setTreasureData(data);
    }
    setTreasureOpenData(datas: any[]) {
        this.openTreasureOpenPanel();
        this.treasureOpenPanel.setTreasureData(datas);
    }
    setTreasureAllOpenData(datas: any[]) {
        this.openTreasureAllOpenPanel();
        this.treasureAllOpenPanel.setTreasureData(datas);
    }
    openPreviewPanel() {
        const wid = 334 * this.dpr;
        const hei = 353 * this.dpr;
        if (!this.previewPanel) {
            this.previewPanel = new PicaTreasurePreviewPanel(this.scene, this.render, wid, hei, this.key, this.dpr, this.scale);
            this.previewPanel.setHandler(new Handler(this, () => {
                this.hidePreviewPanel();
                this.setTreasureOpenData(new Array(6));
            }), new Handler(this, this.OnCloseHandler));
        }
        this.content.add(this.previewPanel);
        this.previewPanel.resize(wid, hei);
        this.previewPanel.addListen();
    }

    hidePreviewPanel() {
        this.content.remove(this.previewPanel);
        this.previewPanel.removeListen();
    }

    openTreasureOpenPanel() {
        const wid = this.width;
        const hei = 310 * this.dpr;
        if (!this.treasureOpenPanel) {
            this.treasureOpenPanel = new PicaTreasureOpenPanel(this.scene, wid, hei, this.key, this.dpr, this.scale);
            this.treasureOpenPanel.setHandler(new Handler(this, this.OnCloseHandler));
            this.treasureOpenPanel.y = -20 * this.dpr;
        }
        this.content.add(this.treasureOpenPanel);
        this.treasureOpenPanel.resize(wid, hei);
        this.treasureOpenPanel.addListen();
    }

    hideOpenPanel() {
        this.content.remove(this.treasureOpenPanel);
        this.treasureOpenPanel.removeListen();
    }

    openTreasureAllOpenPanel() {
        const wid = this.width;
        const hei = 320 * this.dpr;
        if (!this.treasureAllOpenPanel) {
            this.treasureAllOpenPanel = new PicaTreasureAllOpenPanel(this.scene, wid, hei, this.key, this.dpr, this.scale);
            this.treasureAllOpenPanel.setHandler(new Handler(this, this.OnCloseHandler));
            this.treasureAllOpenPanel.y = -20 * this.dpr;
        }
        this.content.add(this.treasureAllOpenPanel);
        this.treasureAllOpenPanel.resize(wid, hei);
        this.treasureAllOpenPanel.addListen();
    }

    hideAllOpenPanel() {
        this.content.remove(this.treasureAllOpenPanel);
        this.treasureAllOpenPanel.removeListen();
    }
    private OnCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}

import { NineSlicePatch, GameGridTable, Button } from "apowophaserui";
import { BasePanel, DynamicImage, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "../../../res";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, i18n, Url } from "utils";
export class PicaElevatorPanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Button;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    // private itemsPanel: ItemsConsumeFunPanel;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAELEVATOR_NAME;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.5);
        this.mBackground.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mGameGrid.resetMask();
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
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
        this.setElevtorDataList(this.mShowData);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        //   this.mBackground.on("pointerup", this.OnClosePanel, this);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        this.content.add(this.bg);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close", "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5, -this.bg.height * 0.5 + this.dpr * 5);
        this.content.add(this.closeBtn);
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: conWdith - 20 * this.dpr,
                height: conHeight - 30 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 20 * this.dpr,
                cellHeight: 85 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ElevatorItem(this.scene, this.key, this.dpr);
                }
                cellContainer.setFloorData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell.floorData);
        });
        this.content.add(this.mGameGrid);
        this.resize();
        super.init();
    }

    public setElevtorDataList(ui: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI
        const arr = ui.button.reverse();
        this.mGameGrid.setItems(arr);
        this.mGameGrid.setT(1);
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.render.renderEmitter(RENDER_PEER + this.key + "_hide");
    }

    private onSendHandler() {

    }
    private onSelectItemHandler(floorData: any) {// op_gameconfig_01.IButton
        const ui: any = this.showData;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI
        const texs = floorData.text.split("#");
        const enabletag = texs[1];
        const bool = enabletag === "false" ? false : true;
        this.render.renderEmitter(RENDER_PEER + this.key + "_queryui", { uiId: ui.id, componentId: floorData.node.id });
    }
}

class ElevatorItem extends Phaser.GameObjects.Container {
    private floorData: any;// op_gameconfig_01.IButton
    private key: string;
    private dpr: number;
    private bg: DynamicImage;
    private namebg: NineSlicePatch;
    private nameTex: Phaser.GameObjects.Text;
    private levelbg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = new DynamicImage(scene, 0, 0);
        this.add(this.bg);
        this.setSize(268 * dpr, 81 * dpr);
        this.namebg = new NineSlicePatch(this.scene, 0, 0, 82 * dpr, 22 * dpr, UIAtlasKey.common2Key, "floor_title_bg", {
            left: 15 * this.dpr,
            top: 0 * this.dpr,
            right: 15 * this.dpr,
            bottom: 0 * this.dpr
        }, undefined, undefined, 0);
        this.namebg.x = this.width * 0.5 - this.namebg.width * 0.5 - 10 * dpr;
        this.namebg.y = -this.height * 0.5 + this.namebg.height * 0.5 + 10 * dpr;
        this.add(this.namebg);
        this.nameTex = this.scene.make.text({
            x: this.namebg.x, y: this.namebg.y, text: "",
            style: { color: "#22E2FF", fontFamily: Font.DEFULT_FONT, fontSize: 12 * this.dpr }
        }).setOrigin(0.5);
        this.add(this.nameTex);
        this.levelbg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "floor_number_unlock" });
        this.levelbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.levelbg.x = -this.width * 0.5 + this.levelbg.width * 0.5 + 5 * dpr;
        this.levelbg.y = this.height * 0.5 - this.levelbg.height * 0.5 - 5 * dpr;
        this.add(this.levelbg);
        this.levelTex = this.scene.make.text({
            x: this.levelbg.x, y: this.levelbg.y, text: "",
            style: { color: "#FAD555", fontFamily: Font.NUMBER, fontSize: 17 * this.dpr }
        }).setOrigin(0.5); // .setStroke("#FAD555", 2);
        this.add(this.levelTex);
    }
    public setFloorData(data: any, index: number) {// op_gameconfig_01.IButton
        this.floorData = data;
        const texs = data.text.split("#");
        const enabletag = texs[1];
        const bool = enabletag === "false" ? false : true;
        if (bool) {
            this.levelbg.setFrame("floor_number_unlock");
            this.levelTex.setColor("#FAD555");
            this.nameTex.setColor("#22E2FF");
        } else {
            this.levelbg.setFrame("floor_number_lock");
            this.levelTex.setColor("#BDBDBD");
            this.nameTex.setColor("#DDDDDD");
        }
        this.levelTex.text = (index) + i18n.t("picelevator.floor");
        this.nameTex.text = texs[0];
        const lastindex = data.tips.lastIndexOf("/");
        const frame = data.tips.slice(lastindex + 1, data.tips.length);
        const burl = data.tips.slice(0, lastindex + 1);
        const url = Url.getOsdRes(burl + frame + `_${this.dpr}x` + ".png");
        this.bg.load(url, this, () => {
            // this.bg.scale = this.dpr;
        });
    }
}

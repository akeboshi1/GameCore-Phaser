
import { op_client } from "pixelpai_proto";
import { Button, ClickEvent, GameScroller, NineSliceButton, UIType } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, GridLayoutGroup, ToggleButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem, ISocial } from "picaStructure";
import { ItemButton, PicaItemTipsPanel } from "picaRender";
export class PicaCookingPanel extends PicaBasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private content: Phaser.GameObjects.Container;
    private chooseContanier: ChooseContainer;
    private categoryDatas: any;
    private cookingButton: NineSliceButton;
    private cookingGrid: GridLayoutGroup;
    private cookingIDs = [];
    private curCookingItem: CookingItem;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICACOOKING_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.cooking];
        this.UIType = UIType.Scene;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.1);
        this.blackGraphic.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h + this.content.height * 0.5 + 10 * this.dpr;
        this.content.setInteractive();
        const fromy = this.scaleHeight + this.content.height * 0.5 + 10 * this.dpr;
        const toy = this.scaleHeight - this.content.height * 0.5;
        this.playMove(fromy, toy);
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w * 2, h * 2), Phaser.Geom.Rectangle.Contains);
    }

    public onShow() {
        this.render.renderEmitter(this.key + "_initialized");
        if (this.categoryDatas) this.setCategoryDatas(this.categoryDatas);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.on("pointerup", this.OnCloseHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.off("pointerup", this.OnCloseHandler, this);
    }

    init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.bg = this.scene.make.image({ key: UIAtlasName.cooking, frame: "cooking_cook_panel" });
        this.content.setSize(this.scaleWidth, this.bg.height);
        const conWidth = this.scaleWidth - 104 * this.dpr, conHeight = 60 * this.dpr;
        this.cookingGrid = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(57 * this.dpr, 57 * this.dpr),
            space: new Phaser.Math.Vector2(8 * this.dpr, 0),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedRowCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.cookingGrid.x = -48 * this.dpr;
        const fnormals = UIHelper.threeYellowBig;
        this.cookingButton = new NineSliceButton(this.scene, 0, 0, 85 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("illustrate.cooking"), this.dpr, this.scale, {
            left: 18 * this.dpr,
            top: 18 * this.dpr,
            right: 18 * this.dpr,
            bottom: 20 * this.dpr
        });
        this.cookingButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 16));
        this.cookingButton.setFontStyle("bold");
        this.cookingButton.y = conHeight * 0.5 - this.cookingButton.height * 0.5 - 5 * this.dpr;
        this.cookingButton.x = this.content.width * 0.5 - this.cookingButton.width * 0.5 - 6 * this.dpr;
        this.cookingButton.on(ClickEvent.Tap, this.onCookingButtonHandler, this);
        this.chooseContanier = new ChooseContainer(this.scene, this.dpr, this.scale);
        this.chooseContanier.setHandler(new Handler(this, this.onCookingCategoryHandler));
        this.chooseContanier.y = -this.content.height * 0.5 - this.chooseContanier.height * 0.5 - 2 * this.dpr;
        this.chooseContanier.visible = false;
        this.content.add([this.bg, this.cookingGrid, this.cookingButton, this.chooseContanier]);
        this.add([this.blackGraphic, this.content]);
        this.createCookingItem();
        this.resize();
        super.init();
    }

    public setCategoryDatas(datas: any[]) {
        this.categoryDatas = datas;
        if (!this.mInitialized || !datas) return;
        this.chooseContanier.setCategoryDatas(datas);
    }

    public setCookingDatas(datas: any[]) {
        this.chooseContanier.setCookingDatas(datas);
    }

    private createCookingItem() {
        for (let i = 0; i < 4; i++) {
            const item = new CookingItem(this.scene, this.dpr, this.scale);
            item.on(ClickEvent.Tap, this.onCookingItemHandler, this);
            item["indexed"] = i;
            this.cookingGrid.add(item);
        }
        this.cookingGrid.Layout();
    }

    private playMove(from: number, to: number) {
        const tween = this.scene.tweens.add({
            targets: this.content,
            y: {
                from,
                to
            },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.chooseContanier.refreshMask();
            },
        });
    }
    private onCookingButtonHandler() {
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_cookingids", this.cookingIDs);
        this.OnCloseHandler();
    }

    private onCookingItemHandler(pointer, button) {
        this.curCookingItem = button;
        this.chooseContanier.show();
    }
    private onCookingCategoryHandler(type: any, data: any) {
        if (type === "category") {
            this.render.renderEmitter(this.key + "_categorytype", type);
        } else {
            if (this.curCookingItem) {
                this.curCookingItem.setItemData(data);
                const indexed = this.curCookingItem["indexed"];
                this.cookingIDs[indexed] = data.id;
            }
            this.chooseContanier.hide();
        }
    }
    private OnCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
class CookingItem extends ItemButton {
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, UIAtlasName.cooking, "cooking_cook_icon_bg", dpr, zoom, true);
        this.setSize(this.bg.width, this.bg.height);
        this.itemIcon.setTexture(UIAtlasName.cooking, "cooking_cook_icon_add");
        this.countTex.visible = false;
        this.starImg.visible = false;
        this.isShowTips = false;
    }
    public setItemData(itemData: ICountablePackageItem) {
        if (this.itemData === itemData) return;
        this.itemData = itemData;
        this.select = false;
        this.itemIcon.scale = 1;
        if (!itemData) {
            this.itemIcon.setTexture(UIAtlasName.cooking, "cooking_cook_icon_add");
            return;
        }
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });
        this.itemIcon.scale = this.dpr / this.zoom;
        if (itemData.grade > 0) {
            this.starImg.visible = true;
            const starFrame = "bag_star_small_" + itemData.grade;
            this.starImg.setFrame(starFrame);
        } else this.starImg.visible = false;
    }
}

class ChooseContainer extends Phaser.GameObjects.Container {
    private dpr: number;
    private background: Phaser.GameObjects.Image;
    private sendHandler: Handler;
    private toggleScroll: GameScroller;
    private gamescroller: GameScroller;
    private categoryDatas: any[];
    private curTog: ToggleButton;
    private itemsArr: ItemButton[];
    private zoom: number;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.background = this.scene.make.image({ key: UIAtlasName.cooking, frame: "cooking_material_panel" });
        const width = this.background.width;
        const height = 144 * dpr;
        this.setSize(width, height);
        this.background.y = height * 0.5 - this.background.height * 0.5;
        this.add(this.background);
        this.zoom = zoom;
        const togHeight = 38 * dpr;
        this.toggleScroll = new GameScroller(this.scene, {
            x: 0,
            y: -height * 0.5 + togHeight * 0.5 + 3 * dpr,
            width: this.width - 44 * dpr,
            height: togHeight,
            zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 3 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onToggleHandler(gameobject);
            },
        });
        const scrollHeight = this.background.height;
        this.gamescroller = new GameScroller(this.scene, {
            x: 0,
            y: this.background.y + 5 * dpr,
            width: this.width - 28 * dpr,
            height: scrollHeight,
            zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 3 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onChooseHandler(gameobject);
            },
            celldownCallBack: (gameobject) => {
                PicaItemTipsPanel.Inst.showTips(gameobject, gameobject.itemData, "pointerup");
            }
        });
        this.add([this.toggleScroll, this.gamescroller]);
        this.setInteractive();
    }

    public show() {
        this.onToggleHandler(<any>this.toggleScroll.getItemAt(0));
        this.visible = true;
    }
    public hide() {
        this.visible = false;
    }
    public refreshMask() {
        this.gamescroller.refreshMask();
        this.toggleScroll.refreshMask();
    }

    public setCategoryDatas(categoryDatas: any[]) {
        this.categoryDatas = categoryDatas;
        for (const category of categoryDatas) {
            const item = new ToggleButton(this.scene, 77 * this.dpr, 37 * this.dpr, UIAtlasName.cooking, "cooking_nav_unselected", "cooking_nav_selected", this.dpr, "");
            item.setNormalColor("#ffffff");
            item.setText(category.name);
            item["category"] = category;
            this.toggleScroll.addItem(item);
            item.enable = false;
        }
        this.toggleScroll.Sort();
    }
    public setCookingDatas(datas: any[]) {
        if (!this.itemsArr) this.itemsArr = [];
        else {
            for (const item of this.itemsArr) {
                item.visible = false;
            }
        }
        this.gamescroller.clearItems(false);
        for (let i = 0; i < datas.length; i++) {
            let item: ItemButton;
            if (i < this.itemsArr.length) {
                item = this.itemsArr[i];
            } else {
                item = new ItemButton(this.scene, UIAtlasName.cooking, "cooking_material_icon_bg", this.dpr, this.zoom, false);
                this.itemsArr.push(item);
            }
            item.setItemData(datas[i]);
            item.visible = true;
        }
        this.gamescroller.addItems(this.itemsArr);
        this.gamescroller.Sort();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    private onToggleHandler(button: ToggleButton) {
        if (this.curTog) {
            this.curTog.setNormalColor("#ffffff");
            this.curTog.isOn = false;
        }
        button.isOn = true;
        button.setChangeColor("#FFF600");
        this.curTog = button;
        const category = button["category"];
        if (this.sendHandler) this.sendHandler.runWith(["category", category.type]);
    }
    private onChooseHandler(item: ItemButton) {
        if (this.sendHandler) this.sendHandler.runWith(["choose", item.itemData]);

    }
}

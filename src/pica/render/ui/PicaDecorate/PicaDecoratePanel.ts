import {AlertView, BasePanel, UiManager} from "gamecoreRender";
import {ModuleName, RENDER_PEER} from "structure";
import {UIAtlasName} from "picaRes";
import {Button, Text} from "apowophaserui";
import {Font, i18n} from "utils";
import {op_gameconfig} from "pixelpai_proto";
import {ItemButton} from "../Components/Item.button";
import {ICountablePackageItem} from "picaStructure";
import {PicaBasePanel} from "../pica.base.panel";

export class PicaDecoratePanel extends PicaBasePanel {

    private mBtn_Close: Button;
    private mBtn_SaveAndExit: Button;
    private mBtn_RemoveAll: Button;
    private mBtn_Reverse: Button;
    private mBtn_Bag: Button;
    private mBtn_SelectedFurniture: ItemButton;
    private mBtns_QuickSelectFurniture: ItemButton[] = [];

    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICADECORATE_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.effectcommon];
    }

    public show(param?: any) {
        super.show(param);
    }

    public addListen() {
        this.mBtn_Close.on("pointerup", this.btnHandler_Close, this);
        this.mBtn_SaveAndExit.on("pointerup", this.btnHandler_SaveAndExit, this);
        this.mBtn_RemoveAll.on("pointerup", this.btnHandler_RemoveAll, this);
        this.mBtn_Reverse.on("pointerup", this.btnHandler_Reverse, this);
        this.mBtn_Bag.on("pointerup", this.btnHandler_Bag, this);
    }

    public removeListen() {
        this.mBtn_Close.off("pointerup", this.btnHandler_Close, this);
        this.mBtn_SaveAndExit.off("pointerup", this.btnHandler_SaveAndExit, this);
        this.mBtn_RemoveAll.off("pointerup", this.btnHandler_RemoveAll, this);
        this.mBtn_Reverse.off("pointerup", this.btnHandler_Reverse, this);
        this.mBtn_Bag.off("pointerup", this.btnHandler_Bag, this);
    }

    public destroy() {

        super.destroy();
    }

    public setSelectedFurniture(data: ICountablePackageItem) {
        if (!data) {
            if (this.mBtn_SelectedFurniture) {
                this.mBtn_SelectedFurniture.destroy();
                this.mBtn_SelectedFurniture = null;
            }
            return;
        }

        if (this.mBtn_SelectedFurniture === null) {
            this.mBtn_SelectedFurniture = new ItemButton(this.scene, UIAtlasName.effectcommon, "synthetic_icon_bg", this.dpr, this.scale, false);
            this.mBtn_SelectedFurniture.x = 10 * this.dpr;
            const h = this.scene.cameras.main.height;
            this.mBtn_SelectedFurniture.y = h - 14 * this.dpr;
            this.add(this.mBtn_SelectedFurniture);
        }
        const onClick = () => {
            this.onFurnitureClick(data.id);
        };
        this.mBtn_SelectedFurniture.off("pointerup");
        this.mBtn_SelectedFurniture.on("pointerup", onClick, this);
        this.mBtn_SelectedFurniture.setData({data});
        this.mBtn_SelectedFurniture.setItemData(data, true);
        this.mBtn_SelectedFurniture.enable = data.count > 0;
    }

    public updateFurnitureCount(baseID: string, count: number) {
        if (this.mBtn_SelectedFurniture) {
            if (this.mBtn_SelectedFurniture.itemData.id === baseID) {
                const data = this.mBtn_SelectedFurniture.itemData;
                data.count = count;
                this.mBtn_SelectedFurniture.setData({data});
                this.mBtn_SelectedFurniture.setItemData(data, true);
                this.mBtn_SelectedFurniture.enable = data.count > 0;
            }
        }
        for (const btn of this.mBtns_QuickSelectFurniture) {
            if (btn.itemData.id === baseID) {
                const data = btn.itemData;
                data.count = count;
                btn.setData({data});
                btn.setItemData(data, true);
                btn.enable = data.count > 0;
            }
        }
    }

    public setQuickSelectFurnitures(datas: ICountablePackageItem[]) {
        if (this.mBtns_QuickSelectFurniture.length > 0) return;

        const h = this.scene.cameras.main.height;
        let i = 0;
        for (const item of datas) {
            const quickBtn = new ItemButton(this.scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.scale, false);
            quickBtn.x = 120 * this.dpr + 80 * this.dpr * i;
            quickBtn.y = h - 60 * this.dpr - 30 * this.dpr;
            quickBtn.setData({item});
            quickBtn.setItemData(item);
            quickBtn.enable = item.count > 0;
            quickBtn.on("pointerup", () => {
                this.onFurnitureClick(item.id);
            }, this);
            this.mBtns_QuickSelectFurniture.push(quickBtn);
            i++;
        }
        this.add(this.mBtns_QuickSelectFurniture);
    }

    protected preload() {
        this.addAtlas(this.key, "room_decorate/room_decorate.png", "room_decorate/room_decorate.json");
        super.preload();
    }

    protected init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;

        this.mBtn_Close = new Button(this.scene, this.key, "room_decorate_previous.png", "room_decorate_previous.png");
        this.mBtn_Close.x = 20 * this.dpr + this.mBtn_Close.width * 0.5;
        this.mBtn_Close.y = 48 * this.dpr;
        this.add(this.mBtn_Close);

        this.mBtn_SaveAndExit = new Button(this.scene, this.key, "room_decorate_save.png", "room_decorate_save.png");
        this.mBtn_SaveAndExit.x = w - 40 * this.dpr - this.mBtn_SaveAndExit.width * 0.5;
        this.mBtn_SaveAndExit.y = 48 * this.dpr;
        this.add(this.mBtn_SaveAndExit);

        const bg1Height = 60 * this.dpr;
        const bg1 = this.scene.add.graphics();
        bg1.clear();
        bg1.fillStyle(0, 0.6);
        bg1.fillRect(0, 0, w, bg1Height);
        bg1.y = h - bg1Height;
        bg1.setDepth(-1);

        const bg2Height = 63 * this.dpr;
        const bg2 = this.scene.add.graphics();
        bg2.clear();
        bg2.fillStyle(0, 0.6);
        bg2.fillRect(0, 0, w, bg2Height);
        bg2.y = bg1.y - 4 * this.dpr - bg2Height;
        this.mBtn_RemoveAll = new Button(this.scene, this.key, "room_decorate_delete.png", "room_decorate_delete.png");
        this.mBtn_RemoveAll.x = 40 * this.dpr;
        this.mBtn_RemoveAll.y = bg2.y - bg2Height * 0.5;
        this.mBtn_Reverse = new Button(this.scene, this.key, "room_decorate_withdraw.png", "room_decorate_withdraw.png");
        this.mBtn_Reverse.x = this.mBtn_RemoveAll.x + 40 * this.dpr + this.mBtn_Reverse.width * 0.5;
        this.mBtn_Reverse.y = bg2.y - bg2Height * 0.5;
        this.mBtn_Bag = new Button(this.scene, this.key, "room_decorate_Furniture.png", "room_decorate_Furniture.png");
        this.mBtn_Bag.x = w - this.mBtn_Bag.width - 20 * this.dpr;
        this.mBtn_Bag.y = bg2.y - bg2Height * 0.5;
        this.add([this.mBtn_RemoveAll, this.mBtn_Reverse, this.mBtn_Bag]);

        super.init();
    }

    get mediator() {
        return this.render.mainPeer[this.key];
    }

    private btnHandler_Close() {
        const alertView = new AlertView(this.uiManager);
        alertView.show({
            // TODO: set i18n
            text: i18n.t("party.sendgifttips"),
            oy: 302 * this.dpr * this.render.uiScale,
            callback: () => {
                this.mediator.btnHandler_Close();
            },
        });
    }

    private btnHandler_SaveAndExit() {
        this.mediator.btnHandler_SaveAndExit();
    }

    private btnHandler_RemoveAll() {
        this.mediator.btnHandler_RemoveAll();
    }

    private btnHandler_Reverse() {
        this.mediator.btnHandler_Reverse();
    }

    private btnHandler_Bag() {
        this.mediator.btnHandler_Bag();
    }

    private onFurnitureClick(baseID: string) {
        this.mediator.onFurnitureClick(baseID);
    }
}

class FurnitureButton extends Phaser.GameObjects.Container {

    private mButton: Button;
    private mText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, private key: string, private dpr: number) {
        super(scene);

        this.mText = this.scene.make.text({
            x: this.width * 0.5 - 5 * this.dpr, y: 0, text: "", padding: {
                left: 0,
                right: 10 * this.dpr,
            },
            style: {fontFamily: Font.DEFULT_FONT, fontSize: 28 * this.dpr, color: "#FCF863"}
        }).setFontStyle("bold italic").setStroke("#C25E0D", 2 * this.dpr).setOrigin(0.5);
        this.add(this.mText);
    }

    public setDisplay(display: op_gameconfig.IDisplay) {
        if (this.mButton) this.remove(this.mButton);

        this.mButton = new Button(this.scene, display.texturePath);
    }

    public setCount(count: number) {
        this.mText.text = count + "";
    }
}

import {AlertView, BasePanel, UiManager} from "gamecoreRender";
import {ModuleName, RENDER_PEER} from "structure";
import {UIAtlasName} from "picaRes";
import {Button, Text} from "apowophaserui";
import {Font, i18n} from "utils";
import {op_gameconfig} from "pixelpai_proto";
import {ItemButton} from "../Components/Item.button";
import {ICountablePackageItem} from "picaStructure";

export class PicaDecoratePanel extends BasePanel {

    private mBtn_Close: Button;
    private mBtn_SaveAndExit: Button;
    private mBtn_RemoveAll: Button;
    private mBtn_Reverse: Button;
    private mBtn_Bag: Button;
    private mBtn_SelectedFurniture: ItemButton;
    private mBtn_QuickSelectFurnitures: ItemButton[] = [];

    constructor(private uiManager: UiManager) {
        super(uiManager.render.sceneManager.getMainScene(), uiManager.render);
        this.key = ModuleName.PICADECORATE_NAME;
    }

    public show(param?: any) {
        super.show(param);

        this.addListen();
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
        if (this.mBtn_SelectedFurniture === null) {
            this.mBtn_SelectedFurniture = new ItemButton(this.scene, UIAtlasName.effectcommon, "synthetic_icon_bg", this.dpr, this.scale, false);
            this.mBtn_SelectedFurniture.x = 10 * this.dpr;
            const h = this.scene.cameras.main.height;
            this.mBtn_SelectedFurniture.y = h - 14 * this.dpr;
            this.add(this.mBtn_SelectedFurniture);

        }
        this.mBtn_SelectedFurniture.setData({ data });
        this.mBtn_SelectedFurniture.setItemData(data, true);
        this.mBtn_SelectedFurniture.enable = data.count > 0;
    }

    public setQuickSelectFurnitures(datas: ICountablePackageItem[]) {
        if (this.mBtn_QuickSelectFurnitures.length > 0) return;

        const h = this.scene.cameras.main.height;
        let i = 0;
        for (const data of datas) {
            const quickBtn = new ItemButton(this.scene, UIAtlasName.effectcommon, "synthetic_icon_bg", this.dpr, this.scale, false);
            quickBtn.x = 30 * this.dpr + 20 * this.dpr * i;
            quickBtn.y = h - 14 * this.dpr;
            quickBtn.setData({data});
            quickBtn.setItemData(data, true);
            this.mBtn_QuickSelectFurnitures.push(quickBtn);
        }
        this.add(this.mBtn_QuickSelectFurnitures);
    }

    protected preload() {
        this.addAtlas(this.key, "room_decorate/room_decorate.png", "room_decorate/room_decorate.json");
        super.preload();
    }

    protected init() {
        const w = this.scene.cameras.main.width;
        const h = this.scene.cameras.main.height;
        this.setSize(w, h);

        this.mBtn_Close = new Button(this.scene, this.key, "room_decorate_previous", "room_decorate_previous");
        this.mBtn_Close.x = this.mBtn_Close.width * 0.5 + 5 * this.dpr;
        this.mBtn_Close.y = this.mBtn_Close.height * 0.5 + 5 * this.dpr;
        this.add(this.mBtn_Close);

        this.mBtn_SaveAndExit = new Button(this.scene, this.key, "room_decorate_save", "room_decorate_save");
        this.mBtn_SaveAndExit.x = w - this.mBtn_SaveAndExit.width * 0.5 - 5 * this.dpr;
        this.mBtn_SaveAndExit.y = this.mBtn_SaveAndExit.height * 0.5 + 5 * this.dpr;
        this.add(this.mBtn_SaveAndExit);

        const bg1 = this.scene.make.image({key: UIAtlasName.uicommon, frame: "bg"}).setOrigin(0, 1);
        bg1.displayWidth = w;
        bg1.x = 0;
        bg1.y = h;
        bg1.setDepth(-1);
        this.add([bg1]);

        const bg2 = this.scene.make.image({key: UIAtlasName.uicommon, frame: "bg"}).setOrigin(0, 1);
        bg2.displayWidth = w;
        bg2.x = 0;
        bg2.y = h - bg1.height - 1 * this.dpr;
        this.mBtn_RemoveAll = new Button(this.scene, this.key, "room_decorate_delete", "room_decorate_delete");
        this.mBtn_RemoveAll.x = this.mBtn_RemoveAll.width * 0.5 + 10 * this.dpr;
        this.mBtn_RemoveAll.y = bg2.y - bg2.height * 0.5;
        this.mBtn_Reverse = new Button(this.scene, this.key, "room_decorate_withdraw", "room_decorate_withdraw");
        this.mBtn_Reverse.x = this.mBtn_RemoveAll.x + this.mBtn_RemoveAll.width * 0.5 + 15 * this.dpr + this.mBtn_Reverse.width * 0.5;
        this.mBtn_Reverse.y = bg2.y - bg2.height * 0.5;
        this.mBtn_Bag = new Button(this.scene, this.key, "room_decorate_Furniture", "room_decorate_Furniture");
        this.mBtn_Bag.x = w - this.mBtn_Bag.width * 0.5 - 10 * this.dpr;
        this.mBtn_Bag.y = bg2.y - bg2.height * 0.5;
        this.add([bg2, this.mBtn_RemoveAll, this.mBtn_Reverse, this.mBtn_Bag]);

        super.init();
    }

    get mediator() {
        return this.render.mainPeer[ModuleName.PICADECORATE_NAME];
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

    private onFurnitureClick(id: number) {
        this.mediator.onFurnitureClick();
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

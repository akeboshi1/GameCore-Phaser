
import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, GameScroller, NineSliceButton, UIType } from "apowophaserui";
import { DynamicImage, ThreeSliceButton, ThreeSlicePath, TweenCompent, UIDragonbonesDisplay, UiManager } from "gamecoreRender";
import { AvatarSuitType, ModuleName } from "structure";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem, IExtendCountablePackageItem, ISocial } from "../../../structure";
import { ImageValue } from "..";
import { ItemButton } from "../Components";
export class PicaNewMinePanel extends PicaBasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Image;
    private bottombg: Phaser.GameObjects.Image;
    private iconBg: Phaser.GameObjects.Image;
    private useButton: NineSliceButton;
    private nameText: BBCodeText;
    private scoreText: BBCodeText;
    private itemIcon: DynamicImage;
    private durabilityText: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private curItem: ItemButton;
    private itemDatas: ICountablePackageItem[];
    private itemButtons: ItemButton[] = [];
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICANEWMINE_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.mine_new];
        this.UIType = UIType.Scene;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0);
        this.blackGraphic.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h + this.content.height * 0.5 + 10 * this.dpr;
        this.content.setInteractive();
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w * 2, h * 2), Phaser.Geom.Rectangle.Contains);

        const fromy = this.scaleHeight + this.content.height * 0.5 + 10 * this.dpr;
        const toy = this.scaleHeight - this.content.height * 0.5 - 8 * this.dpr;
        this.playMove(fromy, toy);
    }

    public onShow() {
        this.render.renderEmitter(this.key + "_initialized");
        this.setMineData(this.itemDatas);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.useButton.on(ClickEvent.Tap, this.onUseItemHandler, this);
        this.on("pointerup", this.OnCloseHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.useButton.off(ClickEvent.Tap, this.onUseItemHandler, this);
        this.off("pointerup", this.OnCloseHandler, this);
    }

    init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.bg = this.scene.make.image({ key: UIAtlasName.mine_new, frame: "mine_panel_bg" });
        this.bottombg = this.scene.make.image({ key: UIAtlasName.mine_new, frame: "mine_props_list_bg" });
        this.bottombg.y = this.bottombg.height * 0.5;
        const conWdith = this.bg.width;
        const conHeight = 142 * this.dpr;
        this.content.setSize(conWdith, conHeight);
        this.iconBg = this.scene.make.image({ key: UIAtlasName.mine_new, frame: "mine_icon_bg" });
        this.iconBg.x = -conWdith * 0.5 + this.iconBg.width * 0.5 + 8 * this.dpr;
        this.iconBg.y = -conHeight * 0.5 + this.iconBg.height * 0.5 + 11 * this.dpr;
        this.itemIcon = new DynamicImage(this.scene, this.iconBg.x, this.iconBg.y);
        this.durabilityText = this.scene.make.text({ style: UIHelper.colorNumberStyle("#0075D0", 12 * this.dpr) }).setOrigin(0.5);
        this.durabilityText.setStroke("#FFFFFF", 2 * this.dpr);
        this.durabilityText.x = this.itemIcon.x;
        this.durabilityText.y = this.iconBg.y + this.iconBg.height * 0.5 + 0 * this.dpr;
        this.nameText = new BBCodeText(this.scene, 0, 0, "", UIHelper.whiteStyle(this.dpr, 12)).setOrigin(0, 0.5);
        this.nameText.y = -conHeight * 0.5 + 25 * this.dpr;
        this.nameText.x = this.iconBg.x + this.iconBg.width * 0.5 + 20 * this.dpr;
        this.scoreText = new BBCodeText(this.scene, 0, 0, "", UIHelper.colorStyle("#0075D0", 11 * this.dpr)).setOrigin(0, 0.5);
        this.scoreText.x = this.nameText.x;
        this.scoreText.y = this.nameText.y + 15 * this.dpr;
        this.useButton = new NineSliceButton(this.scene, 0, 0, 97 * this.dpr, 38 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.use"), this.dpr, this.scale, UIHelper.button(this.dpr));
        this.useButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 17));
        this.useButton.setFontStyle("bold");
        this.useButton.y = this.iconBg.y;
        this.useButton.x = conWdith * 0.5 - this.useButton.width * 0.5 - 20 * this.dpr;
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: this.bottombg.y,
            width: conWdith - 4 * this.dpr,
            height: 80 * this.dpr,
            zoom: this.scale,
            orientation: 1,
            dpr: this.dpr,
            space: 6 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onGameScrollHandler(gameobject);
            }
        });
        this.content.add([this.bg, this.bottombg, this.iconBg, this.itemIcon, this.nameText, this.scoreText, this.useButton, this.durabilityText, this.gameScroll]);
        this.resize();
        super.init();
    }

    public setMineData(datas: ICountablePackageItem[]) {
        this.itemDatas = datas;
        if (!this.mInitialized) return;
        for (const temp of this.itemButtons) {
            temp.visible = false;
        }
        for (let i = 0; i < 10; i++) {
            let temp: ItemButton;
            if (i < this.itemButtons.length) {
                temp = this.itemButtons[i];
            } else {
                temp = new ItemButton(this.scene, undefined, undefined, this.dpr, this.scale, false);
                this.gameScroll.addItem(temp);
                this.itemButtons.push(temp);
            }
            temp.setItemData(undefined);
        }
        this.gameScroll.Sort();
        this.setSelectItemData();
    }

    setSelectItemData() {
        this.nameText.text = `[b]${"酷炫的稿子"}[color=#0075D0]${"7"}[/color][color=#0075D0][size=${8 * this.dpr}]${i18n.t("级")}[/size][/color][/b]`;
        this.scoreText.text = `[color=#0075D0]${i18n.t("mine.integraltips")}[b]${35}[/b][/color]`;
        this.durabilityText.text = `${71}/${100}`;
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
                this.gameScroll.refreshMask();
            },
        });
    }
    private onUseItemHandler() {
        if (!this.curItem) return;
        this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_useprop", this.curItem.itemData);
        this.OnCloseHandler();
    }

    private onGameScrollHandler(obj: ItemButton) {
        if (this.curItem) this.curItem.select = false;
        obj.select = true;
        this.curItem = obj;
    }

    private OnCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}

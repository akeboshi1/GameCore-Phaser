
import { op_client } from "pixelpai_proto";
import { Button, ClickEvent, GameScroller, UIType } from "apowophaserui";
import { AlignmentType, AxisType, BasePanel, ConstraintType, GridLayoutGroup, ImageValue, ThreeSliceButton, ThreeSlicePath, TweenCompent, UIDragonbonesDisplay, UiManager } from "gamecoreRender";
import { AvatarSuit, AvatarSuitType, ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { IFurnitureGroup, ISocial } from "picaStructure";
import { ItemButton } from "picaRender";
export class PicaRepairChoosePanel extends PicaBasePanel {
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private content: Phaser.GameObjects.Container;
    private grid: GridLayoutGroup;
    private cancelBtn: Button;
    private confirmBtn: Button;
    private curSelectItem: ItemButton;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAREPAIRCHOOSE_NAME;
        this.atlasNames = [UIAtlasName.layout];
        this.UIType = UIType.Scene;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        // this.blackGraphic.clear();
        // this.blackGraphic.fillStyle(0x000000, 0.66);
        // this.blackGraphic.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h + this.content.height * 0.5 + 10 * this.dpr;
        this.content.setInteractive();
        const fromy = this.scaleHeight + this.content.height * 0.5 + 10 * this.dpr;
        const toy = this.scaleHeight - this.content.height * 0.5;
        this.playMove(fromy, toy);
    }
    onShow() {
        this.setChooseData(undefined);

    }
    public addListen() {
        if (!this.mInitialized) return;
        this.cancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.cancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmHandler, this);
    }

    init() {
        const conWdith = this.scaleWidth;
        const conHeight = 88 * this.dpr;
        // this.blackGraphic = this.scene.make.graphics(undefined, false);
        // this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = this.scene.make.image({ key: UIAtlasName.layout, frame: "layout_panel_bg" });
        this.grid = new GridLayoutGroup(this.scene, 219 * this.dpr, conHeight, {
            cellSize: new Phaser.Math.Vector2(67 * this.dpr, 67 * this.dpr),
            space: new Phaser.Math.Vector2(10 * this.dpr, 0),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedRowCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.cancelBtn = new Button(this.scene, UIAtlasName.layout, "layout_cancel", "layout_cancel");
        this.cancelBtn.y = 0;
        this.cancelBtn.x = -conWdith * 0.5 + this.cancelBtn.width * 0.5 + 10 * this.dpr;

        this.confirmBtn = new Button(this.scene, UIAtlasName.layout, "layout_confirm", "layout_confirm");
        this.confirmBtn.y = 0;
        this.confirmBtn.x = conWdith * 0.5 - this.cancelBtn.width * 0.5 - 10 * this.dpr;
        this.content.add([this.bg, this.grid, this.cancelBtn, this.confirmBtn]);
        this.resize();
        super.init();
    }

    public setChooseData(content: IFurnitureGroup) {
        this.tempDatas = content;
        if (!this.mInitialized) return;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < content.group.length; i++) {
            const data = content.group[i];
            const item = new ItemButton(this.scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.scale, true);
            item.on(ClickEvent.Tap, this.onItemButtonHandler, this);
            this.grid.add(item);
            item.setItemData(data);
        }
        this.grid.Layout();
    }

    private onItemButtonHandler(pointer, item: ItemButton) {
        if (this.curSelectItem) this.curSelectItem.select = false;
        this.curSelectItem = item;
        item.select = false;
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
            },
        });
    }
    private onCancelHandler() {
        this.render.renderEmitter(this.key + "_close");
    }

    private onConfirmHandler() {
        // this.render.renderEmitter(ModuleName.PICANEWROLE_NAME + "_followcharacter", { uid: this.roleData.cid, follow: this.followed });
    }
}

import { ClickEvent } from "apowophaserui";
import { BasePanel, DynamicImage, Tap, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, i18n, Url } from "utils";

export class DropElementPanel extends BasePanel {
    private element: DynamicImage;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICA_DROP_ELEMENT_NAME;
    }

    public update(param?: any) {
        super.update(param);
        this.updateElement();
    }

    protected preload() {
        this.addAtlas(ModuleName.CUTINMENU_NAME, "cutInmenu/cutInmenu.png", "cutInmenu/cutInmenu.json");
        super.preload();
    }

    protected init() {
        const bg = this.scene.make.image({ key: ModuleName.CUTINMENU_NAME, frame: "minebag_bg" }, false).setInteractive();
        const tap = new Tap(bg);
        bg.on(ClickEvent.Tap, this.onTapHandler, this);
        this.setSize(bg.width, bg.height);

        const dropLabel = this.scene.make.text({
            text: i18n.t("dropElement.tips"),
            x: -this.width * 0.2,
            y: this.height * 0.5 - 4 * this.dpr,
            style: {
                color: "#ffffff",
                fontSize: 14 * this.dpr,
                fotnFamily: Font.DEFULT_FONT
              }
        }).setOrigin(0.5, 1);
        dropLabel.setStroke("0x0", 2 * this.dpr * this.scale);
        dropLabel.setFontStyle("bold");
        this.add([bg, dropLabel]);

        this.updateElement();
        super.init();

        const { width, height } = this.scene.cameras.main;
        // this.x = width - 15 * this.dpr;
        this.x = width - 5 * this.dpr;
        this.y = height * 0.5 + 40 * this.dpr + this.displayHeight;
    }

    private updateElement() {
        if (!this.mShowData) {
            return;
        }
        if (!this.showData.texturePath) return;
        if (!this.element) {
            this.element = new DynamicImage(this.scene, -this.width * 0.2, this.height * 0.5 - 8 * this.dpr).setOrigin(0.5, 1);
            this.element.scale = this.dpr;
        }
        this.element.load(Url.getOsdRes(this.mShowData.texturePath));
        this.addAt(this.element, 1);
    }

    private onTapHandler() {
        const mediator = this.render.mainPeer[this.key];
        if (mediator) mediator.drop();
    }
}

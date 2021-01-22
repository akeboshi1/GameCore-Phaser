import { ImageValue, ProgressMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, UIHelper } from "utils";

export class EnergyProgressBar extends Phaser.GameObjects.Container {
    private powerTex: ImageValue;
    private powerPro: ProgressMaskBar;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.init();
    }

    setEnergyData(value: number, max: number) {
        this.powerTex.setText(`${value}/${max}`);
        this.powerPro.setProgress(value, max);
    }

    protected init() {
        const width = 83 * this.dpr, height = 18 * this.dpr;
        this.setSize(width, height);
        const config = {
            width, height, left: 9 * this.dpr, right: 9 * this.dpr, top: 0, bottom: 0
        };
        this.powerPro = new ProgressMaskBar(this.scene, UIAtlasName.uicommon, "explore_physical_bottom", "explore_physical_top", undefined, config, config);
        this.powerPro.x = 0;
        this.powerTex = new ImageValue(this.scene, 43 * this.dpr, 15 * this.dpr, UIAtlasName.uicommon, "explore_physical_icon", this.dpr, UIHelper.colorNumberStyle("#ffffff", 11 * this.dpr));
        this.powerTex.x = -width * 0.5 + 13 * this.dpr;
        this.powerTex.y = -1 * this.dpr;
        this.powerTex.setFontStyle("bold");
        this.powerTex.setStroke("#000000", 2 * this.dpr);
        this.powerTex.setOffset(-4 * this.dpr, 0);
        this.powerTex.setLayout(1);
        this.powerTex.setText("");
        this.add([this.powerPro, this.powerTex]);
    }
}

import { BasicScene } from "baseRender";
import { Font, Logger, SceneName } from "structure";
import { i18n } from "../utils";
export class BlackScene extends BasicScene {
    constructor() {
        super({ key: SceneName.BLACK_SCENE });
    }

    public preload() {
        this.load.script("webfont", this.render.url.getRes("scripts/webfont/1.6.26/webfont.js"));
    }

    public create() {
        super.create();
        try {
            WebFont.load({
                custom: {
                    // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
                    families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
                },
            });
        } catch (error) {
            Logger.getInstance().warn("webfont failed to load");
        }

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;
        const dpr = this.render.uiRatio;
        const bg = this.add.graphics(undefined);
        bg.fillStyle(0);
        bg.fillRect(0, 0, width, height);

        const tipTxt = this.add.text(width / 2, height / 2, i18n.t("blackScene.tips"), {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }
        ).setOrigin(0.5);
    }

    public awake() {
        this.scene.wake();
    }

    public sleep() {
        this.scene.sleep();
    }
}

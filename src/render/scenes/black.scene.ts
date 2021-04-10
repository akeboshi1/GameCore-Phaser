import { BasicScene } from "baseRender";
import { SceneName } from "structure";
import { Font, i18n, Logger, Url } from "utils";

export class BlackScene extends BasicScene {
    constructor() {
        super({ key: SceneName.BLACK_SCENE });
    }

    public preload() {
        this.load.script("webfont", Url.getRes("scripts/webfont/1.6.26/webfont.js"));
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
            fontSize: 12 * dpr,
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

import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class ActivityPanel extends BasePanel {
    private readonly key: string = "activity";
    private content: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width - 20 * this.dpr;
        this.content.y = 120 * this.dpr;
        this.setSize(w, h);
    }

    show(param?: any) {
        if (this.mInitialized) {
            this.setInteractive();
        }
        super.show(param);
    }

    protected preload() {
        this.addAtlas(this.key, "activity/activity.png", "activity/activity.json");
        super.preload();
    }

    protected init() {
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        for (let i = 0; i < 4; i++) {
            const img = this.scene.make.image({
                key: this.key,
                frame: `icon_${i + 1}`
            }, false);
            // img.y = i * 50 * this.dpr;
            this.content.add(img);
        }

        let mainMenuW = 160 * this.dpr;
        const subList = this.content.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.height);
        const margin = mainMenuW / (subList.length - 1);
        const offsetY: number = 15 * this.dpr;
        let tmpWid: number = 0;
        let tmpHei: number = 0;
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image>subList[i - 1];
            const button = <Phaser.GameObjects.Image>subList[i];
            button.y = preButton.height + preButton.y + margin + offsetY;
            tmpHei += button.y;
            tmpWid = button.width;
        }

        this.resize(tmpWid, tmpHei);
        super.init();
    }
}

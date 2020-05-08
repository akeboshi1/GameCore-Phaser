import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class ActivityPanel extends BasePanel {
    private readonly key: string = "activity";
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.x = width - 40 * this.dpr;
        this.y = 150 * this.dpr;
        this.setSize(w, h);
    }

    protected preload() {
        this.addAtlas(this.key, "activity/activity.png", "activity/activity.json");
        super.preload();
    }

    protected init() {
        for (let i = 0; i < 3; i++) {
            const img = this.scene.make.image({
                key: this.key,
                frame: `icon_${i + 1}.png`
            }, false);
            // img.y = i * 50 * this.dpr;
            this.add(img);
        }

        let mainMenuW = 160 * this.dpr;
        const subList = this.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.height);
        const margin = mainMenuW / (subList.length - 1);
        let tmpWid: number = 0;
        let tmpHei: number = 0;
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image>subList[i - 1];
            const button = <Phaser.GameObjects.Image>subList[i];
            button.y = preButton.height + preButton.y + margin;
            tmpHei += button.y;
            tmpWid = button.width;
        }

        this.resize(tmpWid, tmpHei);
        super.init();
    }
}

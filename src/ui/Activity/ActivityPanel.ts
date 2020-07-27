import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Handler } from "../../Handler/Handler";
import { Logger } from "../../utils/log";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";

export class ActivityPanel extends BasePanel {
    private readonly key: string = "activity";
    private content: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.UIType = UIType.Scene;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width - 20 * this.dpr;
        this.content.y = 90 * this.dpr;
        this.setSize(w, h);
    }

    show(param?: any) {
        if (this.mInitialized) {
            this.setInteractive();
        }
        super.show(param);
        this.checkUpdateActive();
    }

    updateUIState(active?: op_pkt_def.IPKT_UI) {
        if (!this.mInitialized) {
            return;
        }
        if (active.name === "activity.taskbtn") {
            const btn = <Phaser.GameObjects.Image>this.content.list[3];
            btn.visible = active.visible;
            if (!active.disabled) {
                btn.setInteractive();
            } else btn.removeInteractive();
        }
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
            this.content.add(img);
        }

        const subList = this.content.list;
        const offsetY: number = 15 * this.dpr;
        let tmpWid: number = 0;
        let height: number = 0;
        const handler = new Handler(this, this.onClickHandler);
        for (let i = 0; i < subList.length; i++) {
            const button = <Phaser.GameObjects.Image>subList[i];
            button.y = button.height * button.originY + height;
            height += button.height + offsetY;
            tmpWid = button.width;
            button.on("pointerup", () => {
                handler.runWith(i + 1);
            }, this);
            button.setInteractive();
        }
        this.resize(tmpWid, height);
        super.init();
    }

    private onClickHandler(name: number) {
        Logger.getInstance().log(name);
        if (name === 4) {
            this.emit("showPanel", "Task");
        }
    }
    private checkUpdateActive() {
        const arr = this.mWorld.uiManager.getActiveUIData("Activity");
        if (arr) {
            for (const data of arr) {
                this.updateUIState(data);
            }
        }

    }
}

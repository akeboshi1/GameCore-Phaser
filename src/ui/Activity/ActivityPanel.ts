import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Handler } from "../../Handler/Handler";
import { Logger } from "../../utils/log";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";

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
            const btn = <Button>this.content.list[3];
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
            // const img = this.scene.make.image({
            //     key: this.key,
            //     frame: `icon_${i + 1}`
            // }, false);
            this.content.add(new Button(this.scene, this.key, `icon_${i + 1}`));
        }

        const subList = this.content.list;
        const offsetY: number = 15 * this.dpr;
        let tmpWid: number = 0;
        let height: number = 0;
        const handler = new Handler(this, this.onClickHandler);
        for (let i = 0; i < subList.length; i++) {
            const button = <Button>subList[i];
            button.y = button.height * button.originY + height;
            height += button.height + offsetY;
            tmpWid = button.width;
            button.on(CoreUI.MouseEvent.Tap, () => {
                handler.runWith(i + 1);
            }, this);
            button.setInteractive();
        }

        // const foldBtn = this.scene.make.image({ key: this.key, frame: "home_more" });
        // this.content.add(foldBtn);
        // foldBtn.setInteractive();
        // foldBtn.on("pointerup", this.onFoldBtnHandler, this);
        this.resize(tmpWid, height);
        super.init();
    }

    private onClickHandler(name: number) {
        if (name === 4) {
            this.emit("showPanel", "Task");
        } else if (name === 3) {
            // this.emit("showPanel", "PicFriend");
        } else if (name === 2) {
            // this.emit("showPanel", "FriendInvite");
        }
    }

    private onFoldBtnHandler() {

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

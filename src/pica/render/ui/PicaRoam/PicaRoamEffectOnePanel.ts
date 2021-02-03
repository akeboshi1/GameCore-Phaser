import { Handler, UIHelper } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaRoamEffectOnePanel extends Phaser.GameObjects.Container {
    private video: Phaser.GameObjects.Video;
    private send: Handler;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private isOne: boolean = true;
    private loopTimes: number = 0;
    private rewardDatas: op_client.ICountablePackageItem[];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.init();
        this.setInteractive();
    }

    init() {

        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 1);
        this.blackGraphic.fillRect(-this.width * 0.5, -this.height * 0.5, this.width * 2, this.height * 2);
        this.blackGraphic.visible = false;
        this.blackGraphic.alpha = 0;
        this.video = this.scene.make.video({ key: "roamone" });
        this.video.on("complete", this.onCompleteHandler, this);
        this.add([this.video, this.blackGraphic]);
    }
    setHandler(send: Handler) {
        this.send = send;
    }

    setRewardDatas(datas: op_client.ICountablePackageItem[], one: boolean) {
        this.rewardDatas = datas;
        this.isOne = one;
        if (one) {
            if (this.video.getVideoKey() !== "roamone")
                this.video.changeSource("roamone", true);
            else this.video.play();
        } else {
            if (this.video.getVideoKey() !== "roamtenrepead")
                this.video.changeSource("roamtenrepead", true, false);
            else this.video.play();
            this.loopTimes = 1;
        }
        this.setVideoSize();
        this.video.visible = true;
        this.blackGraphic.visible = false;
    }
    public play() {
        if (this.video) this.video.play(false,);
    }
    private onCompleteHandler() {
        if (!this.isOne && this.loopTimes > 0) {
            this.loopTimes--;
            if (this.loopTimes === 0) {
                this.video.changeSource("roamreward", true, false);
            } else
                this.video.play();
            return;
        }
        if (this.send) this.send.runWith("compl");
        this.blackGraphic.alpha = 0;
        this.blackGraphic.visible = true;
        UIHelper.playAlphaTween(this.scene, this.blackGraphic, 0, 1);

    }

    private setVideoSize() {
        this.video.scale = 1;
        const scaleX = this.width / this.video.displayWidth;
        const scaleY = this.height / this.video.displayHeight;
        this.video.scale = scaleX > scaleY ? scaleX : scaleY;
    }
}

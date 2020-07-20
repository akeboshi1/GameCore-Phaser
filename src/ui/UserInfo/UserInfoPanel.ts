import { BasePanel } from "../components/BasePanel";
import { DynamicImage } from "../components/dynamic.image";
import { Background, Border, Url, BlueButton } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { UserInfoMediator } from "./UserInfoMediator";
import { NinePatch, NineSliceButton } from "@apowo/phaserui";

export class UserInfoPanel extends BasePanel {
    private mActor: DynamicImage;
    private mBadgeImages: DynamicImage[] = [];
    private mNickName: Phaser.GameObjects.Text;
    private mLv: Phaser.GameObjects.Text;
    private mFollwerBtn: NineSliceButton;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
        this.mWorld = worldService;
    }

    show(param?: any) {
        super.show(param);
        this.setData("data", param);
        this.setInfo(param);
    }

    hide() {
        this.clearBadge();
        super.hide();
    }

    resize(wid: number, hei: number) {
        const size = this.mWorld.getSize();
        this.x = size.width - this.width - 8;
        this.y = size.height - 100 - (this.height);
    }

    setInfo(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (!this.mInitialized || !data) return;
        if (data.actors.length === 0) {
            return;
        }
        const actor = data.actors[0];
        this.mWorld.httpService.userDetail(actor.platformId).then((response) => {
            if (response.code === 200) {
                const resData = response.data;
                if (resData) {
                    this.mActor.load(Url.getOsdRes(`show/${resData.username}.png`), this, undefined, this.loadDefaultAvatar);
                    this.mNickName.setText(resData.nickname);
                    this.mLv.setText(resData.level);
                }
            }
        });

        this.mWorld.httpService.badgecards(actor.platformId).then((response) => {
            if (response.code === 200) {
                this.createBadge(response.data);
            }
        });

        this.updateFollwer(actor.platformId);
    }

    destroy() {
        if (this.mActor) {
            this.mActor.destroy(true);
            this.mActor = null;
        }
        if (this.mBadgeImages) {
            this.mBadgeImages.forEach((image) => {
                image.destroy(true);
                image = null;
            });
            this.mBadgeImages = [];
        }

        if (this.mNickName) {
            this.mNickName.destroy(true);
            this.mNickName = null;
        }

        if (this.mLv) {
            this.mLv.destroy(true);
            this.mLv = null;
        }

        if (this.mFollwerBtn) {
            this.mFollwerBtn.destroy();
            this.mFollwerBtn = null;
        }

        this.mWorld = null;
        super.destroy();
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.atlas(BlueButton.getName(), BlueButton.getPNG(), BlueButton.getJSON());
        super.preload();
    }

    protected init() {
        this.setSize(359, 199);
        const background = new NinePatch(this.scene, 0, 0,
            359,
            199,
            Background.getName()
        ).setOrigin(0, 0);
        this.add(background);
        const border = new NinePatch(this.scene,
            7,
            19,
            345,
            173,
            Border.getName()
        ).setOrigin(0, 0);
        this.add(border);

        const nickNameLabel = this.scene.make.text({
            x: 20,
            y: -5,
            text: "昵称：",
            stroke: "#000000",
            strokeThickness: 2,
            style: { color: "#b4b4b4", font: Font.YAHEI_18_BOLD }
        }, false);
        this.add(nickNameLabel);

        const lvLabel = this.scene.make.text({
            x: 20,
            y: 30,
            text: "等级：",
            stroke: "#000000",
            strokeThickness: 2,
            color: "#b4b4b4",
            style: { color: "#b4b4b4", font: Font.YAHEI_18_BOLD }
        }, false);
        this.add(lvLabel);

        this.mNickName = this.scene.make.text({
            x: nickNameLabel.x + 50,
            y: nickNameLabel.y,
            stroke: "#000000",
            strokeThickness: 2,
            color: "#FFFFFF",
            style: { font: Font.YAHEI_18_BOLD }
        }, false);
        this.add(this.mNickName);

        this.mLv = this.scene.make.text({
            x: lvLabel.x + 50,
            y: lvLabel.y,
            stroke: "#000000",
            strokeThickness: 2,
            color: "#FFFFFF",
            style: { font: Font.YAHEI_18_BOLD }
        });
        this.add(this.mLv);

        this.mFollwerBtn = new NineSliceButton(this.scene, 258, 145, 80, 34, BlueButton.getName(), BlueButton.getName(), "关注", this.dpr, this.scale, BlueButton.getConfig());
        this.mFollwerBtn.x = 258 + (this.mFollwerBtn.width >> 1);
        this.mFollwerBtn.y = 145 + (this.mFollwerBtn.height >> 1);
        this.mFollwerBtn.setTextStyle({ font: Font.YAHEI_16_BOLD });
        this.add(this.mFollwerBtn);

        this.mActor = new DynamicImage(this.scene, 300, 125).setOrigin(0.5, 1);
        this.mActor.scale = 2;
        this.add(this.mActor);
        this.mWorld.uiManager.getMediator(UserInfoMediator.NAME).resize();
        super.init();

        this.setInfo(this.getData("data"));
    }

    private updateFollwer(platformId) {
        const mainPlayer = this.mWorld.roomManager.currentRoom.playerManager.actor.model;
        if (!mainPlayer) return;
        if (platformId === mainPlayer.platformId) {
            // this.mFollwerBtn.visible = false;
            return;
        }
        // this.mFollwerBtn.visible = true;

        this.mWorld.httpService.checkFollowed([platformId])
            .then((response: any) => {
                if (response.code === 200) {
                    const resData = response.data;
                    if (resData.length > 0) {
                        this.mFollwerBtn.setText("取消关注");
                    } else {
                        this.mFollwerBtn.setText("关注");
                    }
                    this.mFollwerBtn.setData("node", { text: this.mFollwerBtn.getText(), platformId });
                }
            });
    }

    private createBadge(badges) {
        if (!badges) return;
        for (let i = 0; i < badges.length; i++) {
            const badge = new DynamicImage(this.scene, i * 70 + 60, 100);
            badge.load(Url.getOsdRes(badges[i].target_entity.thumbnail));
            this.add(badge);
            this.mBadgeImages.push(badge);
        }
    }

    private loadDefaultAvatar() {
        this.mActor.load(Url.getOsdRes("show/avatar_default.png"));
    }

    private clearBadge() {
        for (const badge of this.mBadgeImages) {
            badge.destroy();
            this.remove(badge);
        }
        this.mBadgeImages.length = 0;
    }
}

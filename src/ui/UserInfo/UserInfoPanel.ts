import {Panel} from "../components/panel";
import {DynamicImage} from "../components/dynamic.image";
import {Background, Border} from "../../utils/resUtil";
import NinePatch from "../../../lib/rexui/plugins/gameobjects/ninepatch/NinePatch";
import {WorldService} from "../../game/world.service";
import {Font} from "../../utils/font";
import {NinePatchButton} from "../components/ninepatch.button";
import { op_client } from "pixelpai_proto";
import {PlayerDataModel} from "../../service/player/playerDataModel";

export class UserInfoPanel extends Panel {
    private mWorld: WorldService;
    private mActor: DynamicImage;
    private mBadgeImages: DynamicImage[] = [];
    private mNickName: Phaser.GameObjects.Text;
    private mLv: Phaser.GameObjects.Text;
    private mFollwerBtn: NinePatchButton;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene);
        this.mWorld = worldService;
    }

    show(param?: any) {
        super.show(param);
        this.setData("data", param);
        this.setInfo(param);
        // this.mWorld.httpService.checkFollowed()
    }

    hide() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        this.clearBadge();
    }

    resize() {
        const size = this.mWorld.getSize();
        this.x = size.width - this.width - 8;
        this.y = size.height - 100 - (this.height);
    }

    setInfo(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (!this.mInitialized || !data) return;
        // const texts = data.text;
        // if (!texts || texts.length < 1) {
        //     return;
        // }
        // this.mNickName.setText(texts[1].text);
        // this.mLv.setText(texts[3].text);
        //
        // const display = data.images;
        // if (display && display.length > 0) {
        //     this.mActor.load(display[0].texturePath);
        // }
        //
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

        this.updateFollower(actor.platformId);
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
            this.mFollwerBtn.destroy(true);
            this.mFollwerBtn = null;
        }

        this.mWorld = null;
        super.destroy();
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(BlueButton.getName(), BlueButton.getPNG());
        super.preload();
    }

    protected init() {
        this.setSize(359, 199);
        const background = new NinePatch(this.scene, {
            width: 359,
            height: 199,
            key: Background.getName(),
            columns: Background.getColumns(),
            rows: Background.getRows()
        }).setOrigin(0, 0);
        this.add(background);
        const border = new NinePatch(this.scene, {
            x: 7,
            y: 19,
            width: 345,
            height: 173,
            key: Border.getName(),
            columns: Border.getColumns(),
            rows: Border.getRows()
        }).setOrigin(0, 0);
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
        super.init();

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

        this.mFollwerBtn = new NinePatchButton(this.scene, 258, 145, {
            width: 80,
            height: 34,
            text: "关注",
            key: BlueButton.getName(),
            columns: BlueButton.getColumns(),
            rows: BlueButton.getRows()
        });
        this.mFollwerBtn.setTextStyle({ font: Font.YAHEI_16_BOLD, stroke: "#000000", strokeThickness: 5 });
        this.add(this.mFollwerBtn);

        this.mActor = new DynamicImage(this.scene, 300, 125).setOrigin(0.5, 1);
        this.mActor.scale = 2;
        this.add(this.mActor);
        this.resize();

        this.setInfo(this.getData("data"));
    }

    private updateFollower(platformId) {
        const playerManager = (<PlayerDataModel> this.mWorld.modelManager.getModel(PlayerDataModel.name));
        if (!playerManager) return;
        const mainPlayer = playerManager.mainPlayerInfo;
        if (!mainPlayer) return;
        if (platformId === mainPlayer.platformId) {
            this.remove(this.mFollwerBtn);
            this.mFollwerBtn.visible = false;
            return;
        }
        this.mFollwerBtn.visible = true;

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

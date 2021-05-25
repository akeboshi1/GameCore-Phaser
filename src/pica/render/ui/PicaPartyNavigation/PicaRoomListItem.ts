import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, NumberUtils, UIHelper } from "utils";
import { ImageBBCodeValue } from "..";
export class PicaRoomBaseListItem extends Phaser.GameObjects.Container {
    public roomData: any;
    protected dpr: number;
    protected bg: Phaser.GameObjects.Image;
    protected roomName: BBCodeText;
    protected playerCount: ImageBBCodeValue;
    protected send: Handler;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_party_list_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.roomName = new BBCodeText(this.scene, 0, 0, "", UIHelper.colorStyle("#FFFFFF", 14 * dpr)).setOrigin(0, 0.5);
        this.playerCount = new ImageBBCodeValue(scene, 30 * dpr, 20 * dpr, UIAtlasName.map, "map_party_people", dpr, UIHelper.colorStyle("#FFFFFF", 13 * dpr));
        this.add([this.bg, this.roomName, this.playerCount]);
        this.init();
    }
    public setRoomData(data: any) {
        this.roomData = data;
        this.roomName.text = data.name;
        this.playerCount.setText(data.playerCount);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    protected init() {

    }
    protected layout(...args) {

    }
}
export class PicaRoomListItem extends PicaRoomBaseListItem {
    private imagIcon: DynamicImage;
    private ownerName: ImageBBCodeValue;
    public setRoomData(data: any) {// op_client.IEditModeRoom
        this.roomData = data;
        // const texturepath = data.topic.display.texturePath;
        // const lastindex = texturepath.lastIndexOf("/");
        // const frame = texturepath.slice(lastindex + 1, texturepath.length);
        // const burl = texturepath.slice(0, lastindex + 1);
        // const url = Url.getOsdRes(burl + frame + `_s_${this.dpr}x` + ".png");
        // this.imagIcon.load(url);
        // this.partyName.text = `[b]${data.name}[/b]`;
        // this.playerCount.setText(`[b]${data.playerCount}[/b]`);
        // this.partyOwnerName.setText(data.ownerName);
        this.roomName.text = data.name;
        this.ownerName.setText(data.ownerName);
        this.playerCount.setText(data.playerCount);
    }
    protected init() {
        this.imagIcon = new DynamicImage(this.scene, 0, 0);
        this.imagIcon.setTexture("map_room_icon");
        this.ownerName = new ImageBBCodeValue(this.scene, 50 * this.dpr, 20 * this.dpr, UIAtlasName.map, "map_party_homeowners", this.dpr, UIHelper.colorStyle("#242AC1", 12 * this.dpr));
        this.add([this.imagIcon, this.ownerName]);
        this.layout();
    }
    protected layout() {
        this.imagIcon.x = -this.width * 0.5 + this.imagIcon.width * 0.5 + 8 * this.dpr;
        this.imagIcon.y = 0;
        this.roomName.x = this.imagIcon.x + this.imagIcon.width * 0.5 + 10 * this.dpr;// -this.width * 0.5 + 25 * this.dpr;
        this.roomName.y = -11 * this.dpr;
        this.ownerName.x = this.roomName.x + this.ownerName.width * 0.5;
        this.ownerName.y = 11 * this.dpr;
        this.playerCount.x = this.width * 0.5 - 35 * this.dpr;
    }
}
export class PicaMyRoomListItem extends PicaRoomBaseListItem {
    private defaultIcon: Phaser.GameObjects.Image;
    private unlockTips: Phaser.GameObjects.Text;
    private unlockBtn: Button;
    private mIsUnlock: boolean = false;
    public setRoomData(data: any) {
        this.roomData = data;
        this.defaultIcon.visible = false;
        this.unlockTips.visible = false;
        this.playerCount.visible = false;
        this.unlockBtn.visible = false;
        if (data.created) {
            this.roomName.text = data.name;
            this.playerCount.setText(data.playerCount);
            this.bg.setTexture(UIAtlasName.map, "map_party_list_bg");
            this.defaultIcon.visible = data.isDefaultroom;
            this.playerCount.visible = true;
            this.roomName.y = 0;
        } else {
            this.unlockBtn.visible = true;
            this.roomName.text = i18n.t("party.myroomnametips", { name: NumberUtils.NumberConvertZHCN(data.serial) });
            if (data.unlocked) {
                this.unlockBtn.setFrameNormal("multiple_rooms_unlock");
                this.roomName.y = 0;
                this.bg.setTexture(UIAtlasName.map, "map_party_list_bg");
                this.unlockBtn.setInteractive();
                this.mIsUnlock = true;
            } else {
                this.unlockBtn.setFrameNormal("multiple_rooms_lock");
                this.unlockTips.text = i18n.t("party.roomunlocktips", { name: data.unlocklevel });
                this.roomName.y = -11 * this.dpr;
                this.unlockTips.visible = true;
                this.bg.setTexture(UIAtlasName.multiple_rooms, "multiple_rooms_unlock_bg");
                this.unlockBtn.disInteractive();
            }
        }

    }
    protected init() {
        this.defaultIcon = this.scene.make.image({ key: UIAtlasName.multiple_rooms, frame: "multiple_rooms_current" });
        this.unlockTips = this.scene.make.text({ style: UIHelper.colorStyle("#242AC1", 12 * this.dpr) }).setOrigin(0, 0.5);
        this.unlockBtn = new Button(this.scene, UIAtlasName.multiple_rooms, "multiple_rooms_lock", "multiple_rooms_lock");
        this.unlockBtn.on(ClickEvent.Tap, this.onUnlockBtnHandler, this);
        this.add([this.defaultIcon, this.unlockTips, this.unlockBtn]);
        this.layout();
    }
    protected layout() {
        this.defaultIcon.x = -this.width * 0.5 + this.defaultIcon.width * 0.5 + 10 * this.dpr;
        this.defaultIcon.y = 0;
        this.roomName.x = -this.width * 0.5 + 32 * this.dpr;
        this.roomName.y = -11 * this.dpr;
        this.playerCount.x = this.width * 0.5 - 32 * this.dpr;
        this.unlockTips.x = this.roomName.x;
        this.unlockTips.y = 11 * this.dpr;
        this.unlockBtn.x = this.width * 0.5 - this.unlockBtn.width * 0.5 - 15 * this.dpr;
    }
    protected onUnlockBtnHandler() {
        if (this.send) this.send.run();
    }

    get isUnlock() {
        return this.mIsUnlock;
    }
}

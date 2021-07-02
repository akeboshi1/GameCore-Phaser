import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, NumberUtils, UIHelper } from "utils";
import { ImageBBCodeValue } from "..";

export class PicaNewManorListItem extends Phaser.GameObjects.Container {
    public roomData: any;
    protected dpr: number;
    protected bg: Phaser.GameObjects.Image;
    protected roomName: BBCodeText;
    protected playerCount: ImageBBCodeValue;
    private imagIcon: DynamicImage;
    private ownerName: ImageBBCodeValue;
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
    public setRoomData(data: any) {// op_client.IEditModeRoom
        this.roomData = data;
        this.roomName.text = data.name;
        this.playerCount.setText(data.playerCount);
        this.roomName.text = data.name;
        this.ownerName.setText(data.ownerName);
        this.playerCount.setText(data.playerCount);
    }
    public setHandler(send: Handler) {
        this.send = send;
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
export class PicaNewManorItem extends Phaser.GameObjects.Container {
    public roomData: any;
    protected dpr: number;
    protected bg: Phaser.GameObjects.Image;
    protected roomName: BBCodeText;
    protected playerCount: ImageBBCodeValue;
    protected send: Handler;
    public setRoomData(data: any) {


    }
    protected init() {

        this.layout();
    }
    protected layout() {

    }
    protected onUnlockBtnHandler() {
        if (this.send) this.send.run();
    }
}


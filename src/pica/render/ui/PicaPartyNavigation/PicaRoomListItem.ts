import { BBCodeText } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { UIHelper } from "utils";
import { ImageBBCodeValue } from "../../ui";
export class PicaRoomListItem extends Phaser.GameObjects.Container {
    public roomData: any;// op_client.IEditModeRoom
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private roomName: BBCodeText;
    private imagIcon: DynamicImage;
    private ownerName: ImageBBCodeValue;
    private playerCount: ImageBBCodeValue;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key: UIAtlasName.map, frame: "map_party_list_bg" });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.imagIcon = new DynamicImage(scene, 0, 0);
        this.imagIcon.setTexture("party_icon_1");
        this.imagIcon.x = -this.width * 0.5 + this.imagIcon.width * 0.5 + 8 * dpr;
        this.imagIcon.y = 0;// -this.height * 0.5 + this.imagIcon.height * 0.5 + 5 * dpr;
        this.add(this.imagIcon);
        this.imagIcon.visible = false;
        this.roomName = new BBCodeText(this.scene, -this.width * 0.5 + 25 * dpr, -18 * dpr, "", UIHelper.colorStyle("#FFFFFF", 14 * dpr));
        this.roomName.setOrigin(0);
        this.add(this.roomName);
        this.ownerName = new ImageBBCodeValue(scene, 50 * dpr, 20 * dpr, key, "map_party_homeowners", dpr, UIHelper.colorStyle("#242AC1", 12 * dpr));
        this.ownerName.x = this.roomName.x + this.ownerName.width * 0.5;
        this.ownerName.y = 11 * dpr;
        this.add(this.ownerName);
        this.playerCount = new ImageBBCodeValue(scene, 30 * dpr, 20 * dpr, key, "map_party_people", dpr, UIHelper.colorStyle("#FFFFFF", 13 * dpr));
        this.playerCount.x = this.width * 0.5 - 35 * dpr;
        this.add(this.playerCount);
    }
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
}

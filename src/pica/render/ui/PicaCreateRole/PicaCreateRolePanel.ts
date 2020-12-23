import { Button, ClickEvent, InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { Font, Handler, i18n, UIHelper } from "utils";
import { AvatarSuit, AvatarSuitType, ModuleName } from "structure";
import { UiManager, BasePanel, CommonBackground, UIDragonbonesDisplay } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { use } from "matter-js";
import { UIAtlasName } from "picaRes";

export class PicaCreateRolePanel extends PicaBasePanel {
  private commonBackground: CommonBackground;
  private mBottomBg: Phaser.GameObjects.Image;
  private content: Phaser.GameObjects.Container;
  private sixCon: Phaser.GameObjects.Container;
  private manButton: Button;
  private womanButton: Button;
  private manIcon: Phaser.GameObjects.Image;
  private womanIcon: Phaser.GameObjects.Image;
  private nextButton: NineSliceButton;

  private suitCon: Phaser.GameObjects.Container;
  private skinCon: Phaser.GameObjects.Container;
  private enterButton: NineSliceButton;
  private backButton: Button;

  private dragonbones: UIDragonbonesDisplay;
  private hairSuit: any;
  private eyeSuit: any;
  private mouthSuit: any;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon];
    this.key = ModuleName.PICACREATEROLE_NAME;
  }

  resize(wid: number, hei: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
  }

  init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.commonBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mBottomBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_bg_texture" });
    this.content = this.scene.make.container(undefined, false);
    this.add([this.commonBackground, this.mBottomBg, this.content]);
    const mTopBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_role_bg" });
    mTopBg.y = -200 * this.dpr;
    this.dragonbones = new UIDragonbonesDisplay(this.scene, this.render);
    this.dragonbones.scale = this.dpr * 2;
    this.dragonbones.y = mTopBg.y;
    this.dragonbones.on("initialized", this.loadDragonbonesComplete, this);
    this.backButton = new Button(this.scene, UIAtlasName.uicommon, "back_arrow");
    this.backButton.x = -width * 0.5 + this.backButton.width * 0.5 + 15 * this.dpr;
    this.backButton.y = -height * 0.5 + this.backButton.height * 0.5 + 15 * this.dpr;
    this.content.add([mTopBg, this.dragonbones, this.backButton]);
    this.createSixCon();
    this.createSuitCon();

    super.init();
    this.resize(0, 0);
  }

  protected createSixCon() {
    this.sixCon = this.scene.make.container(undefined, false);
    this.manButton = new Button(this.scene, UIAtlasName.uicommon, "Create_gender_uncheck", "Create_gender_select");
    this.manIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_gender_boy" });
    this.manButton.add(this.manIcon);
    this.manButton.x = -60 * this.dpr;
    this.manButton.y = -60 * this.dpr;
    this.womanButton = new Button(this.scene, UIAtlasName.uicommon, "Create_gender_uncheck", "Create_gender_select");
    this.womanIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_gender_girl" });
    this.womanButton.add(this.womanIcon);
    this.womanButton.x = -this.manButton.x;
    this.womanButton.y = this.manButton.y;
    this.nextButton = new NineSliceButton(this.scene, 0, 60 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("creatrole.next"), this.dpr, this.scale, UIHelper.background_w(this.dpr));
    this.nextButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
    this.nextButton.setFontStyle("bold");
    this.nextButton.on(ClickEvent.Tap, this.onNextHandler, this);
    this.sixCon.add([this.manButton, this.womanButton, this.nextButton]);
    this.content.add(this.sixCon);
  }

  protected createSuitCon() {
    let posy = -160 * this.dpr;
    this.skinCon = this.scene.make.container(undefined, false);
    for (let i = 0; i < 6; i++) {
      const indexed = i + 1;
      const frame = "Create_complexion_" + indexed;
      const button = new Button(this.scene, UIAtlasName.uicommon, frame);
      button.name = indexed + "";
      button.y = posy;
      button.on(ClickEvent.Tap, this.onSkinHandler, this);
      this.skinCon.add(button);
    }
    posy += 56 * this.dpr;
    this.suitCon = this.scene.make.container(undefined, false);
    const tags = ["hair", "eye", "mouth"];
    const texts = [i18n.t("creatrole.hair"), i18n.t("creatrole.eye"), i18n.t("creatrole.mouth")];
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const text = texts[i];
      const item = new SelectSuitAvatarItem(this.scene, 200 * this.dpr, 33 * this.dpr, this.dpr, tag, text);
      item.setHandler(new Handler(this, this.onSuitDataHandler));
      item.y = posy;
      posy += 48 * this.dpr;
      this.suitCon.add(item);
    }
    this.enterButton = new NineSliceButton(this.scene, 0, 60 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("creatrole.gointo"), this.dpr, this.scale, UIHelper.background_w(this.dpr));
    this.enterButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
    this.enterButton.setFontStyle("bold");
    this.enterButton.on(ClickEvent.Tap, this.onSubmitHandler, this);
    this.suitCon.add([this.skinCon, this.enterButton]);
  }

  private onSubmitHandler() {

  }
  private onNextHandler() {

  }

  private onSkinHandler(pointer, button) {

  }

  private onSuitDataHandler(tag: string, data: any) {
    if (tag === "hair") {
      this.hairSuit = data;
    } else if (tag === "eye") {
      this.eyeSuit = data;
    } else if (tag === "mouth") {
      this.mouthSuit = data;
    }
  }

  private loadDragonbonesComplete() {
    this.dragonbones.play({ name: "idle", flip: false });
  }
  private creatAvatars(content: any) {
    const suitGroups = content.avatarSuits;
    const avatars: any[] = [];
    for (const group of suitGroups) {
      const suits: AvatarSuit[] = [];
      for (const item of group.avatarSuit) {
        const suit: AvatarSuit = { id: item.id, suit_type: item.suitType, slot: item.slot, tag: item.tag, sn: item.sn };
        suits.push(suit);
      }
      const avatar = AvatarSuitType.createHasBaseAvatar(suits);
      avatars.push(avatar);
    }
    content.avatars = avatars;
    return avatars;
  }
}

class SelectSuitAvatarItem extends Phaser.GameObjects.Container {
  private leftButton: Button;
  private rightButton: Button;
  private midBackground: Phaser.GameObjects.Image;
  private nameTex: Phaser.GameObjects.Text;
  private dpr: number;
  private indexed: number = 0;
  private suitDatas: any[];
  private send: Handler;
  private tag: string;
  private text: string;
  constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, tag: string, text: string) {
    super(scene);
    this.setSize(width, height);
    this.dpr = dpr;
    this.tag = tag;
    this.text = text;
    this.init();
  }

  public setSuitDatas() {

  }

  public setHandler(send: Handler) {
    this.send = send;
  }

  protected init() {
    this.leftButton = new Button(this.scene, UIAtlasName.uicommon, "Create_arrow_left");
    this.leftButton.x = -this.width * 0.5 + this.leftButton.width * 0.5;
    this.midBackground = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_name_bg" });
    this.nameTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr, 18) });
    this.rightButton = new Button(this.scene, UIAtlasName.uicommon, "Create_arrow_right");
    this.rightButton.x = -this.width * 0.5 + this.rightButton.width * 0.5;
    this.add([this.leftButton, this.midBackground, this.nameTex, this.rightButton]);
  }

  private onLeftButtonHandler() {
    if (this.indexed === 0) return;
    this.indexed--;
  }
  private onRightButtonHandler() {
    if (this.indexed === this.suitDatas.length - 1) return;
    this.indexed++;
  }

  private updateCurrentSuitData() {
    const suitData = this.suitDatas[this.indexed];
    this.nameTex.text = this.text + this.indexed;
    if (this.send) this.send.runWith([this.tag, suitData]);

  }
}

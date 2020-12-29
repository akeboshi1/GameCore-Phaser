import { Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { Handler, i18n, UIHelper } from "utils";
import { AvatarSuit, AvatarSuitType, ModuleName, RunningAnimation } from "structure";
import { UiManager, CommonBackground, UIDragonbonesDisplay, ButtonEventDispatcher, ToggleButton } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
import { op_client, op_gameconfig, op_def } from "pixelpai_proto";
export class PicaCreateRolePanel extends PicaBasePanel {
  private commonBackground: CommonBackground;
  private mBottomBg: Phaser.GameObjects.Image;
  private content: Phaser.GameObjects.Container;
  private sixCon: Phaser.GameObjects.Container;
  private manButton: ToggleButton;
  private womanButton: ToggleButton;
  private manIcon: Phaser.GameObjects.Image;
  private womanIcon: Phaser.GameObjects.Image;
  private nextButton: NineSliceButton;

  private suitCon: Phaser.GameObjects.Container;
  private skinCon: Phaser.GameObjects.Container;
  private enterButton: NineSliceButton;
  private backButton: Button;
  private selectSkinBg: Phaser.GameObjects.Image;

  private dragonbones: UIDragonbonesDisplay;
  private suitDatasMap: Map<string, op_client.CountablePackageItem[]> = new Map();
  private curSuitMap: Map<string, op_client.CountablePackageItem> = new Map();
  private suitItemMap: Map<string, SelectSuitAvatarItem> = new Map();
  private mMediator: any;
  private mgender: op_def.Gender;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.setTween(false);
    const container = this.scene.add.container(0, 0);
    container.add(this);
    this.scene.scale.on("resize", this.onResize, this);
    this.atlasNames = [UIAtlasName.uicommon];
    this.mMediator = this.render.mainPeer[ModuleName.PICACREATEROLE_NAME];
    this.key = ModuleName.PICACREATEROLE_NAME;
  }

  resize(wid: number, hei: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.content.x = width * 0.5;
    this.content.y = height * 0.5;
  }
  onShow() {
    if (this.showData && this.showData.avatars) {
      this.setSuitDatas(this.showData.avatars);
    }
  }
  onResize(gameSize) {
    this.resize(gameSize.width, gameSize.height);
  }
  public setSuitDatas(datas: op_client.CountablePackageItem[]) {
    this.suitDatasMap.clear();
    for (const data of datas) {
      let arr = this.suitDatasMap.get(data.suitType);
      if (!arr) {
        arr = [];
        this.suitDatasMap.set(data.suitType, arr);
      }
      arr.push(data);
    }
    this.suitDatasMap.forEach((value, key) => {
      if (key !== "base" && key !== "costume") {
        const item = this.suitItemMap.get(key);
        item.setSuitDatas(value);
      } else if (key === "base") {
        this.curSuitMap.set(key, value[1]);
      } else if (key === "costume") {
        this.curSuitMap.set(key, value[0]);
      }
    });
    this.onSkinHandler(undefined, this.skinCon.getAt(1));
    this.onSixHandler(undefined, this.manButton);
  }

  init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.content = this.scene.make.container(undefined, false);
    this.add(this.content);
    this.commonBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mBottomBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_bg_texture" });
    this.mBottomBg.y = height * 0.5 - this.mBottomBg.height * 0.5;
    const mTopBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_role_bg" });
    mTopBg.y = -150 * this.dpr;
    this.dragonbones = new UIDragonbonesDisplay(this.scene, this.render);
    this.dragonbones.scale = this.dpr * 2.2;
    this.dragonbones.y = mTopBg.y + 45 * this.dpr;
    this.dragonbones.on("initialized", this.loadDragonbonesComplete, this);
    const avatarclickCon = new ButtonEventDispatcher(this.scene, 0, 0);
    avatarclickCon.setSize(130 * this.dpr, 130 * this.dpr);
    avatarclickCon.enable = true;
    avatarclickCon.on(ClickEvent.Tap, this.onAvatarClickHandler, this);
    avatarclickCon.y = this.dragonbones.y - 65 * this.dpr;
    this.backButton = new Button(this.scene, UIAtlasName.uicommon, "back_arrow");
    this.backButton.x = -width * 0.5 + this.backButton.width * 0.5 + 20 * this.dpr;
    this.backButton.y = -height * 0.5 + this.backButton.height * 0.5 + 23 * this.dpr;
    this.backButton.on(ClickEvent.Tap, this.onBackHandler, this);
    this.content.add([this.commonBackground, this.mBottomBg, mTopBg, this.dragonbones, avatarclickCon]);
    this.createSixCon();
    this.createSuitCon();

    super.init();
    this.resize(0, 0);
  }

  protected createSixCon() {
    this.sixCon = this.scene.make.container(undefined, false);
    this.sixCon.y = 70 * this.dpr;
    this.manButton = new ToggleButton(this.scene, 0, 0, UIAtlasName.uicommon, "Create_gender_uncheck", "Create_gender_select", this.dpr);
    this.manButton.on(ClickEvent.Tap, this.onSixHandler, this);
    this.manIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_gender_boy" });
    this.manButton.add(this.manIcon);
    this.manButton.x = -60 * this.dpr;
    this.manButton.y = -60 * this.dpr;
    this.womanButton = new ToggleButton(this.scene, 0, 0, UIAtlasName.uicommon, "Create_gender_uncheck", "Create_gender_select", this.dpr);
    this.womanButton.on(ClickEvent.Tap, this.onSixHandler, this);
    this.womanIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_gender_girl" });
    this.womanButton.add(this.womanIcon);
    this.womanButton.x = -this.manButton.x;
    this.womanButton.y = this.manButton.y;
    this.nextButton = new NineSliceButton(this.scene, 0, 70 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("creatrole.next"), this.dpr, this.scale, UIHelper.button(this.dpr));
    this.nextButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
    // this.nextButton.setFontStyle("bold");
    this.nextButton.on(ClickEvent.Tap, this.onNextHandler, this);
    this.sixCon.add([this.manButton, this.womanButton, this.nextButton]);
    this.content.add(this.sixCon);
  }

  protected createSuitCon() {
    let posy = -40 * this.dpr;
    let posx = -115 * this.dpr;
    this.skinCon = this.scene.make.container(undefined, false);
    for (let i = 0; i < 5; i++) {
      const indexed = i + 1;
      const frame = "Create_complexion_" + indexed;
      const button = new Button(this.scene, UIAtlasName.uicommon, frame);
      button.name = indexed + "";
      button.y = posy;
      button.x = posx;
      button.on(ClickEvent.Tap, this.onSkinHandler, this);
      this.skinCon.add(button);
      posx += 25 * this.dpr + 32 * this.dpr;
    }
    this.selectSkinBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_complexion_select" });
    this.skinCon.add(this.selectSkinBg);
    posy += 56 * this.dpr;
    this.suitCon = this.scene.make.container(undefined, false);
    const tags = ["hair", "eye", "mouse"];
    const texts = [i18n.t("creatrole.hair"), i18n.t("creatrole.eye"), i18n.t("creatrole.mouth")];
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const text = texts[i];
      const item = new SelectSuitAvatarItem(this.scene, 264 * this.dpr, 33 * this.dpr, this.dpr, tag, text);
      item.setHandler(new Handler(this, this.onSuitDataHandler));
      item.y = posy;
      posy += 60 * this.dpr;
      this.suitCon.add(item);
      this.suitItemMap.set(tag, item);
    }
    this.enterButton = new NineSliceButton(this.scene, 0, posy + 48 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("creatrole.gointo"), this.dpr, this.scale, UIHelper.button(this.dpr));
    this.enterButton.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
    this.enterButton.setFontStyle("bold");
    this.enterButton.on(ClickEvent.Tap, this.onSubmitHandler, this);
    this.suitCon.add([this.skinCon, this.enterButton]);
  }

  private onSubmitHandler() {
    const ids = [];
    this.curSuitMap.forEach((value, key) => {
      ids.push(value.id);
    });
    this.mediator.submit(this.mgender, ids);
  }
  private onNextHandler() {
    this.suitCon.visible = true;
    this.content.add(this.suitCon);
    this.content.remove(this.sixCon);
    this.content.add(this.backButton);
  }
  private onAvatarClickHandler() {
    const anis = ["walk", "run", "greet01"];
    const ani = anis[Math.floor(Math.random() * (anis.length))];
    const aniData: RunningAnimation = {
      name: (ani),
      flip: false,
      times: 1,
      playingQueue: {
        name: "idle", playTimes: -1
      }
    };
    this.dragonbones.play(aniData);
  }
  private onSixHandler(pointer, button) {
    if (this.manButton === button) {
      this.mgender = op_def.Gender.Male;
      this.womanButton.isOn = false;
    } else if (this.womanButton === button) {
      this.mgender = op_def.Gender.Female;
      this.manButton.isOn = false;
    }
    button.isOn = true;
    this.setSixedSuitsData(this.mgender);
  }

  private setSixedSuitsData(gender: op_def.Gender) {
    const hairindexed = gender === op_def.Gender.Female ? 3 : 0;
    const eyeIndexed = gender === op_def.Gender.Female ? 2 : 0;
    const mouthIndexed = gender === op_def.Gender.Female ? 3 : 1;
    this.suitItemMap.get("hair").setInexed(hairindexed);
    this.suitItemMap.get("eye").setInexed(eyeIndexed);
    this.suitItemMap.get("mouse").setInexed(mouthIndexed);
    this.displayAvatar();

  }
  private onBackHandler() {
    if (this.suitCon.parentContainer) {
      this.suitCon.visible = false;
      this.content.remove(this.suitCon);
    }
    this.content.add(this.sixCon);
    this.content.remove(this.backButton);
  }

  private onSkinHandler(pointer, button) {
    const suitType = "base";
    const index = Number(button.name) - 1;
    const arr = this.suitDatasMap.get(suitType);
    const data = arr[index];
    this.curSuitMap.set(suitType, data);
    this.selectSkinBg.x = button.x;
    this.selectSkinBg.y = button.y;
    this.displayAvatar();
  }

  private onSuitDataHandler(tag: string, data: any) {
    this.curSuitMap.set(tag, data);
    if (this.suitCon.visible) {
      this.displayAvatar();
    }
  }

  private displayAvatar() {
    const items = Array.from(this.curSuitMap.values());
    const avatar = this.creatAvatars(items);
    this.dragonbones.load({
      id: 0,
      avatar
    });
    this.dragonbones.startLoad();
  }

  private loadDragonbonesComplete() {
    this.dragonbones.play({ name: "idle", flip: false });
  }
  private creatAvatars(datas: op_client.CountablePackageItem[]) {
    const suits = [];
    for (const item of datas) {
      const suit: AvatarSuit = { id: item.id, suit_type: item.suitType, slot: item.slot, tag: item.tag, sn: item.sn };
      suits.push(suit);
    }
    const avatar = AvatarSuitType.createHasBaseAvatar(suits);
    return avatar;
  }
  get mediator() {
    if (!this.mMediator) {
      return;
    }
    return this.mMediator;
  }
}

class SelectSuitAvatarItem extends Phaser.GameObjects.Container {
  private leftButton: Button;
  private rightButton: Button;
  private midBackground: Phaser.GameObjects.Image;
  private nameTex: Phaser.GameObjects.Text;
  private dpr: number;
  private indexed: number = 0;
  private suitDatas: op_client.CountablePackageItem[];
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

  public setSuitDatas(datas: op_client.CountablePackageItem[]) {
    this.suitDatas = datas;
  }

  public setInexed(indexed: number) {
    this.indexed = indexed;
    this.updateCurrentSuitData();
  }

  public setHandler(send: Handler) {
    this.send = send;
  }

  protected init() {
    this.leftButton = new Button(this.scene, UIAtlasName.uicommon, "Create_arrow_left");
    this.leftButton.x = -this.width * 0.5 + this.leftButton.width * 0.5;
    this.leftButton.on(ClickEvent.Tap, this.onLeftButtonHandler, this);
    this.midBackground = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Create_name_bg" });
    this.nameTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0.5);
    this.rightButton = new Button(this.scene, UIAtlasName.uicommon, "Create_arrow_right");
    this.rightButton.x = this.width * 0.5 - this.rightButton.width * 0.5;
    this.rightButton.on(ClickEvent.Tap, this.onRightButtonHandler, this);
    this.add([this.leftButton, this.midBackground, this.nameTex, this.rightButton]);
  }

  private onLeftButtonHandler() {
    this.indexed--;
    if (this.indexed === -1) this.indexed = this.suitDatas.length - 1;
    this.updateCurrentSuitData();
  }
  private onRightButtonHandler() {
    this.indexed++;
    if (this.indexed === this.suitDatas.length) this.indexed = 0;
    this.updateCurrentSuitData();
  }

  private updateCurrentSuitData() {
    const suitData = this.suitDatas[this.indexed];
    this.nameTex.text = this.text + (this.indexed + 1);
    if (this.send) this.send.runWith([this.tag, suitData]);
  }
}

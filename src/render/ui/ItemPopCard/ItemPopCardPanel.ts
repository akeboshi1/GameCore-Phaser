import { BasePanel } from "../Components/BasePanel";
import * as copy from "copy-text-to-clipboard";
import { DetailDisplay } from "../Market/DetailDisplay";
import { op_client } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { i18n } from "../../../utils/i18n";
import { Font } from "../../../utils/font";
import { MessageType } from "../../../messageType/MessageType";

export class ItemPopCardPanel extends BasePanel {
  private readonly key = "item_pop_card";
  private mCardContainer: Phaser.GameObjects.Container;
  private mNickName: Phaser.GameObjects.Text;
  private mDesText: Phaser.GameObjects.Text;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mSource: Phaser.GameObjects.Text;
  private mNickNameDown: boolean;
  private mDetailDisplay: DetailDisplay;
  private mBorder: Phaser.GameObjects.Graphics;

  private mPressDelay = 1000;
  private mPressTime: any;
  constructor(scene: Phaser.Scene, worldService: WorldService) {
    super(scene, worldService);
    this.setTween(false);
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mDetailDisplay.on("show", this.onShowHandler, this);
    this.on("pointerup", this.onCloseHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mNickName.on("pointerup", this.onPointerNickNameHandler, this);
    this.mNickName.on("pointerdown", this.onPointerNickNameDownHandler, this);
    this.mDesText.on("pointerdown", this.onPointerDesDownHandler, this);
    this.mDesText.on("pointerup", this.onPointerNickNameHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mDetailDisplay.off("show", this.onShowHandler, this);
    this.off("pointerup", this.onCloseHandler, this);
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mNickName.off("pointerup", this.onPointerNickNameHandler, this);
    this.mNickName.off("pointerdown", this.onPointerNickNameDownHandler, this);
    this.mDesText.off("pointerdown", this.onPointerDesDownHandler, this);
    this.mDesText.off("pointerup", this.onPointerNickNameHandler, this);
  }

  resize(w: number, h: number) {
    // const scale = this.scene.cameras.main.height / 1920;
    const zoom = this.mWorld.uiScale;
    const width = this.scene.cameras.main.width / zoom;
    const height = this.scene.cameras.main.height / zoom;
    const centerX = this.scene.cameras.main.centerX / zoom;
    const centerY = this.scene.cameras.main.centerY / zoom;
    // this.setScale(scale);
    this.setSize(width, height);
    // this.mCardContainer.setScale(scale);

    this.mCardContainer.x = centerX; // - this.mCardContainer.width / 2;
    this.mCardContainer.y = centerY; // - this.mCardContainer.height / 2;

    this.mCloseBtn.x = centerX;
    this.mCloseBtn.y = centerY + this.mCardContainer.height / 2 + 48 * this.dpr;

    super.resize(w, h);
  }

  public setProp() {
    if (!this.mShowData) {
      return;
    }
    const prop = this.mShowData[0].prop;
    if (!prop) {
      return;
    }
    this.mDesText.setText(prop.des);
    this.mNickName.setText(prop.name);
    if (prop.source) {
      this.mSource.setText(i18n.t("item.source") + prop.source);
    } else {
      this.mSource.setText("");
    }
    const resource: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE = this.mShowData[0].display;
    if (resource) {
      if (resource.display) {
        this.mDetailDisplay.loadDisplay(resource);
      } else if (resource.avatar) {
        this.mDetailDisplay.loadAvatar(resource.avatar);
      } else {
        this.mDetailDisplay.loadUrl(prop.icon);
      }
    }
  }

  protected preload() {
    this.addAtlas(this.key, "item_pop_card/item_pop_card.png", "item_pop_card/item_pop_card.json");
    // this.scene.load.atlas(this.key, Url.getRes("ui/item_pop_card/item_pop_card.png"), Url.getRes("ui/item_pop_card/item_pop_card.json"));
    super.preload();
  }

  protected init() {
    this.mCardContainer = this.scene.make.container({
      width: 325 * this.dpr,
      height: 468 * this.dpr
    }, false);
    this.mCardContainer.setSize(325 * this.dpr, 468 * this.dpr);
    this.mCardContainer.setInteractive();

    this.mBorder = this.scene.make.graphics(undefined, false);
    this.mBorder.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x01cdff, 0x01cdff);
    this.mBorder.fillRect(-this.mCardContainer.width / 2, -this.mCardContainer.height / 2, this.mCardContainer.width, this.mCardContainer.height);
    // this.mBorder.setInteractive();

    const background = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false);
    background.y = 23 * this.dpr - background.height / 2;

    const nickNameBg = this.scene.make.image({
      y: 42 * this.dpr,
      key: this.key,
      frame: "name_bg.png"
    });

    this.mNickName = this.scene.make.text({
      y: 42 * this.dpr,
      style: {
        fontSize: 18 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5).setInteractive();

    const desBg = this.scene.make.image({
      y: 138 * this.dpr,
      key: this.key,
      frame: "des_bg.png"
    }, false);

    this.mDesText = this.scene.make.text({
      x: desBg.x - desBg.width / 2 + 12 * this.dpr,
      y: desBg.y - desBg.height / 2 + 10 * this.dpr,
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 240 * this.dpr,
          useAdvancedWrap: true
        }
      }
    }, false).setInteractive();

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.scale = this.dpr * 2;
    // this.mDetailDisplay.y = -150;

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "close.png"
    }, false).setInteractive();

    this.mSource = this.scene.make.text({
      x: desBg.x - desBg.width / 2 + 12 * this.dpr,
      y: desBg.y + desBg.height / 2 - 23 * this.dpr,
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false);

    this.add(this.mCardContainer);
    this.mCardContainer.add([this.mBorder, background, desBg, this.mDetailDisplay, nickNameBg, this.mNickName, this.mDesText, this.mSource]);
    this.add(this.mCloseBtn);
    this.resize(0, 0);
    super.init();
    this.setInteractive();
    this.setProp();
  }

  private onCloseHandler() {
    this.emit("close");
    clearTimeout(this.mPressTime);
    this.mNickNameDown = false;
  }

  private onPointerNickNameHandler() {
    clearTimeout(this.mPressTime);
    this.mNickNameDown = false;
  }

  private onPointerNickNameDownHandler() {
    // this.mNickNameDown = true;
    this.mPressTime = setTimeout(() => {
      this.copyName();
    }, this.mPressDelay);
  }

  private onPointerDesDownHandler() {
    this.mPressTime = setTimeout(() => {
      this.copyDes();
    }, this.mPressDelay);
  }

  private copyName() {
    if (this.mNickName) {
      copy(this.mNickName.text);

      const content = {
        noticeContext: i18n.t("item.copy_suc", { name: i18n.t("item.name") })
      };
      this.mWorld.emitter.emit(MessageType.SHOW_NOTICE, { content });
    }
  }

  private copyDes() {
    if (this.mDesText) {
      copy(this.mDesText.text);

      const content = {
        noticeContext: i18n.t("item.copy_suc", { name: i18n.t("item.des") })
      };
      this.mWorld.emitter.emit(MessageType.SHOW_NOTICE, { content });
    }
  }

  private onShowHandler(image: Phaser.GameObjects.Image) {
    this.mDetailDisplay.y = -this.mCardContainer.height / 4;
  }
}

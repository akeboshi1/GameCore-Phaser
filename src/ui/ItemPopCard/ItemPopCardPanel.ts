import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { DynamicImage } from "../components/dynamic.image";
import { i18n } from "../../i18n";
import * as copy from "copy-text-to-clipboard";
import { DetailDisplay } from "../Market/DetailDisplay";
import { op_client } from "pixelpai_proto";

export class ItemPopCardPanel extends Panel {
  private readonly key = "item_pop_card";
  private mCardContainer: Phaser.GameObjects.Container;
  private mBackground: Phaser.GameObjects.Image;
  private mNickNameBg: Phaser.GameObjects.Image;
  private mNickName: Phaser.GameObjects.Text;
  private mDesBg: Phaser.GameObjects.Image;
  private mDesText: Phaser.GameObjects.Text;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mSource: Phaser.GameObjects.Text;
  private mNickNameDown: boolean;
  private mDetailDisplay: DetailDisplay;
  private mProp: DynamicImage;
  constructor(scene: Phaser.Scene, worldService: WorldService) {
    super(scene, worldService);
    this.setTween(false);
  }

  resize(w: number, h: number) {
    const scale = this.scene.cameras.main.height / 1920;
    const width = this.scene.cameras.main.width / scale;
    const height = this.scene.cameras.main.height / scale;
    const centerX = this.scene.cameras.main.centerX / scale;
    const centerY = this.scene.cameras.main.centerY / scale;
    this.setScale(scale);
    this.setSize(width, height);
    // this.mCardContainer.setScale(scale);

    this.mCardContainer.x = centerX;
    this.mCardContainer.y = centerY;

    this.mCloseBtn.x = centerX;
    this.mCloseBtn.y = centerY + this.mBackground.height / 2 + 140;

    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    this.mDetailDisplay.scale = 1 / scale;

    // this.mCloseBtn.x = centerX;
    // this.mCloseBtn.y = centerY;

    // const graphics = this.scene.make.graphics(undefined, false);
    // graphics.fillStyle(0xFF9900, 0.7);
    // graphics.fillRect(0, 0, centerX, centerY);
    // this.add(graphics);

    // this.setSize(width, height);
    super.resize(w, h);
  }

  public setProp() {
    if (!this.mData) {
      return;
    }
    const prop = this.mData[0].prop;
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
    const resource: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE = this.mData[0].display;
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
    this.scene.load.atlas(this.key, Url.getRes("ui/item_pop_card/item_pop_card.png"), Url.getRes("ui/item_pop_card/item_pop_card.json"));
    super.preload();
  }

  protected init() {
    this.mCardContainer = this.scene.make.container(undefined, false);
    this.mBackground = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false).setInteractive();

    this.mBackground.setSize(this.mBackground.width, this.mBackground.height);

    this.mProp = new DynamicImage(this.scene, 0, 0);

    this.mNickNameBg = this.scene.make.image({
      y: 118,
      key: this.key,
      frame: "name_bg.png"
    });

    this.mNickName = this.scene.make.text({
      y: 118,
      style: {
        font: "68px"
      }
    }, false).setOrigin(0.5).setInteractive();

    this.mDesBg = this.scene.make.image({
      y: 392,
      key: this.key,
      frame: "des_bg.png"
    }, false);

    this.mDesText = this.scene.make.text({
      x: -350,
      y: 264,
      style: {
        font: "38px",
        wordWrap: {
          width: 700,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.y = -150;

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "close.png"
    }, false).setInteractive();

    this.mSource = this.scene.make.text({
      x: -350,
      y: 500,
      style: {
        font: "32px"
      }
    }, false);

    this.add(this.mCardContainer);
    this.mCardContainer.add([this.mBackground, this.mDetailDisplay, this.mNickNameBg, this.mNickName, this.mDesText, this.mSource]);
    this.add(this.mCloseBtn);

    super.init();
    this.resize(0, 0);

    this.setProp();

    this.on("pointerup", this.onCloseHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mNickName.on("pointerup", this.onPointerNickNameHandler, this);
    this.mNickName.on("pointerdown", this.onPointerNickNameDownHandler, this);
  }

  private onCloseHandler() {
    this.emit("close");
    this.mNickNameDown = false;
  }

  private onPointerNickNameHandler() {
    if (this.mNickNameDown) copy(this.mNickName.text);
    this.mNickNameDown = false;
  }

  private onPointerNickNameDownHandler() {
    this.mNickNameDown = true;
  }
}

import { Panel } from "../ui/components/panel";
import { WorldService } from "../game/world.service";
import { ResUtils, Url } from "../utils/resUtil";
import { NinePatchButton } from "../ui/components/ninepatch.button";
import InputText from "../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatch } from "../ui/components/nine.patch";
import { Logger } from "../utils/log";
import { DragonbonesDisplay } from "../rooms/display/dragonbones.display";
import { op_gameconfig } from "pixelpai_proto";
import { DragonbonesModel, IDragonbonesModel } from "../rooms/display/dragonbones.model";
// import InputText from "../../../../lib/rexui/plugins/gameobjects/inputtext/InputText";

export class CreateRolePanel extends Panel {
  private readonly key = "createCharacter";
  private mFoot: Phaser.GameObjects.Image;
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private mBackground: Phaser.GameObjects.Image;
  private mSubmit: NinePatchButton;
  private mInputTextBg: NinePatch;
  private inputText: InputText;
  private mPrePageBtn: Phaser.GameObjects.Image;
  private mNextPageBtn: Phaser.GameObjects.Image;
  private mRandomBtn: Phaser.GameObjects.Image;
  private mError: Phaser.GameObjects.Text;
  private mErrorBg: Phaser.GameObjects.Image;
  private dragonbones: DragonbonesDisplay;
  private dragonbonesModel: IDragonbonesModel;
  private avatars: op_gameconfig.IAvatar[];
  private mCurPageNum: number;

  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    const container = this.scene.add.container(0, 0);
    container.add(this);
    // container.scale = 1 / this.mWorld.uiScale;
  }

  show(param: any) {
    if (param) {
      this.avatars = param.avatars;
    }
    super.show(param);
  }

  preload() {
    this.scene.load.atlas(
      this.key,
      Url.getRes("ui/create_role/create_role.png"),
      Url.getRes("ui/create_role/create_role.json")
    );
    super.preload();
  }

  resize(wid: number, hei: number) {
    const size = this.mWorld.getSize();
    this.setSize(size.width, size.height);
    if (!this.mBackground) {
      return;
    }
    // this.scale = 1 / this.mWorld.uiScale;

    // this.mBackground.x = this.width >> 1;
    // this.mBackground.y = 60 + (this.mBackground.height >> 1);

    const scale = this.scene.cameras.main.height / 1920;
    const width = this.scene.cameras.main.width / scale;
    const height = this.scene.cameras.main.height / scale;
    const centerX = this.scene.cameras.main.centerX / scale;
    this.setScale(scale);

    // this.mBackground.setScale(scale);
    this.mBackground.x = centerX;
    // this.mBackground.y = 700;

    this.mFoot.x = centerX;
    this.mFoot.y = height - (this.mFoot.height >> 1);

    this.mBackgroundColor.clear();
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackgroundColor.fillRect(0, 0, width, height);

    this.mSubmit.x = centerX;

    this.inputText.x = centerX;
    this.mInputTextBg.x = centerX;
    this.dragonbones.x  = centerX;

    this.mNextPageBtn.x = width - 150;

    this.mRandomBtn.x = (this.mInputTextBg.width >> 1) + centerX - this.mRandomBtn.width;
  }

  init() {
    const size = this.mWorld.getSize();
    this.mBackground = this.scene.make.image({
      key: this.key,
      frame: "bg.png",
      x: size.width >> 1,
      y: 700
    });
    this.add(this.mBackground);

    this.mFoot = this.scene.make.image(
      {
        key: this.key,
        frame: "bg_foot.png"
      },
      false
    );
    this.add(this.mFoot);

    this.mBackgroundColor = this.scene.make.graphics(undefined, false);
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackgroundColor.fillRect(0, 0, size.width, size.height);
    this.addAt(this.mBackgroundColor, 0);

    this.mInputTextBg = new NinePatch(this.scene, size.width >> 1, 1000, 730, 120, this.key, "input_bg.png", {
      left: 49,
      top: 49,
      right: 49,
      bottom: 48
    });
    this.add(this.mInputTextBg);

    this.inputText = new InputText(this.scene, size.width >> 1, 1000, 520, 80, {
      type: "input",
      fontSize: "52px",
      color: "#717171",
      style: {
        align: "center"
      },
      placeholder: "输入关键词进行搜索"
    });
    this.add(this.inputText);

    let text = "提 交";
    if (this.mData && this.mData.button) {
      text = this.mData.button.text;
    }
    this.mSubmit = new NinePatchButton(this.scene, size.width >> 1, 1274, 584, 164, this.key, "submit_button", text, {
      left: 39,
      top: 36,
      right: 32,
      bottom: 26
  });
    this.mSubmit.setTextStyle({
      color: "#976400",
      font: "bold 48px YaHei"
    });
    this.mSubmit.on("pointerup", this.onSubmitHandler, this);
    this.add(this.mSubmit);

    this.mPrePageBtn = this.scene.make.image({
      x: 150,
      y: 615,
      key: this.key,
      frame: "arrow_left.png"
    }).setInteractive();
    this.mPrePageBtn.on("pointerup", this.onPrePageHandler, this);
    this.mNextPageBtn = this.scene.make.image({
      x: size.width - 150,
      y: 615,
      key: this.key,
      frame: "arrow.png"
    }).setFlipX(true).setInteractive();
    this.mNextPageBtn.on("pointerup", this.onNextPageHandler, this);

    this.mRandomBtn = this.scene.make.image({
      x: 790,
      y: 1000,
      key: this.key,
      frame: "random.png"
    }).setScale(1.4).setInteractive();
    this.add([this.mPrePageBtn, this.mNextPageBtn, this.mRandomBtn]);
    this.mRandomBtn.on("pointerup", this.onRandomNameHandler, this);

    // const role = this.scene.make.image({
    //   x: size.width >> 1,
    //   y: 560,
    //   key: "role",
    // }, false);
    // this.add(role);

    this.mErrorBg = this.scene.make.image({
      key: this.key,
      frame: "tips_bg.png",
      x: 620,
      y: 232
    }).setVisible(false);

    this.mError = this.scene.make.text({
      x: 420,
      y: 180,
      style: {
        color: "#26265d",
        font: "bold 34px YaHei",
        wordWrap: {
          width: 420,
          useAdvancedWrap: true
        },
      },
    }, false).setVisible(false);
    this.add([this.mErrorBg, this.mError]);

    this.dragonbones = new DragonbonesDisplay(this.scene, undefined);
    this.dragonbones.scale = 6;
    this.dragonbones.x = size.width >> 1;
    this.dragonbones.y = 740;
    // this.dragonbones.play("idle");
    this.dragonbones.once("initialized", () => {
      this.dragonbones.play("idle");
    });
    this.add(this.dragonbones);

    this.setPageNum(0);

    super.init();
    this.resize(0, 0);
  }

  setAvatars(avatars: op_gameconfig.IAvatar[]) {
    this.avatars = avatars;
    // this.dragonbones.load(new DragonbonesModel({
    //   id: 0,
    //   avatar: avatars[0]
    // }));
  }

  showError(msg: string) {
    if (this.mError) {
      this.mError.text = msg;
      this.mError.setVisible(true);
      this.mErrorBg.setVisible(true);
    }
  }

  setNickName(val: string) {
    if (this.inputText) {
      this.inputText.text = val;
    }
  }

  private onRandomNameHandler() {
    this.emit("randomName");
    this.inputText.setBlur();
  }

  private onSubmitHandler() {
    this.emit("submit", this.inputText.text);
    this.inputText.setBlur();
    if (this.mError) {
      this.mError.setVisible(false);
      this.mErrorBg.setVisible(false);
    }
  }

  private onPrePageHandler() {
    this.setPageNum(this.mCurPageNum - 1);
    this.inputText.setBlur();
  }

  private onNextPageHandler() {
    this.setPageNum(this.mCurPageNum + 1);
    this.inputText.setBlur();
  }

  private setPageNum(val: number) {
    this.mCurPageNum = val;
    if (this.mCurPageNum < 0) {
      this.mCurPageNum = this.avatars.length - 1;
    } else if (this.mCurPageNum >= this.avatars.length) {
      this.mCurPageNum = 0;
    }
    this.dragonbones.load(new DragonbonesModel({
      id: 0,
      avatar: this.avatars[this.mCurPageNum]
    }));
  }
}

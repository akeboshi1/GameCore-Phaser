import { Panel } from "../ui/components/panel";
import { WorldService } from "../game/world.service";
import { ResUtils, Url } from "../utils/resUtil";
import { NinePatchButton } from "../ui/components/ninepatch.button";
import InputText from "../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatch } from "../ui/components/nine.patch";
import { Logger } from "../utils/log";
import { DragonbonesDisplay } from "../rooms/display/dragonbones.display";
import { op_gameconfig } from "pixelpai_proto";
import { DragonbonesModel } from "../rooms/display/dragonbones.model";
// import InputText from "../../../../lib/rexui/plugins/gameobjects/inputtext/InputText";

export class CreateRolePanel extends Panel {
  private readonly key = "createCharacter";
  private mFoot: Phaser.GameObjects.Image;
  private mBackground: Phaser.GameObjects.Image;
  private mSubmit: NinePatchButton;
  private inputText: InputText;
  private mPrePageBtn: Phaser.GameObjects.Image;
  private mNextPageBtn: Phaser.GameObjects.Image;
  private mRandomBtn: Phaser.GameObjects.Image;
  private mError: Phaser.GameObjects.Text;
  private mErrorBg: Phaser.GameObjects.Image;
  private dragonbones: DragonbonesDisplay;
  private avatars: op_gameconfig.IAvatar[];

  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    const container = this.scene.add.container(0, 0);
    container.add(this);
    // container.scale = 1 / this.mWorld.uiScale;
  }

  preload() {
    this.scene.load.atlas(
      this.key,
      Url.getRes("ui/create_role/create_role.png"),
      Url.getRes("ui/create_role/create_role.json")
    );
    this.scene.load.image("role", Url.getRes("ui/create_role/role01.png"));
    super.preload();
  }

  resize(wid: number, hei: number) {
    const size = this.mWorld.getSize();
    this.setSize(size.width, size.height);
    // this.scale = 1 / this.mWorld.uiScale;

    this.mBackground.x = this.width >> 1;
    this.mBackground.y = 60 + (this.mBackground.height >> 1);

    this.mFoot.x = this.width >> 1;
    this.mFoot.y = this.height - (this.mFoot.height >> 1);
  }

  init() {
    const size = this.mWorld.getSize();
    this.mBackground = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
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

    const graphics = this.scene.make.graphics(undefined, false);
    graphics.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    graphics.fillRect(0, 0, size.width, size.height);
    this.addAt(graphics, 0);

    const bg = new NinePatch(this.scene, size.width >> 1, 1000, 730, 120, this.key, "input_bg.png", {
      left: 49,
      top: 49,
      right: 49,
      bottom: 48
    });
    this.add(bg);

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

    this.mSubmit = new NinePatchButton(this.scene, size.width >> 1, 1274, 584, 164, this.key, "yellow_button", "提交", {
      left: 36,
      top: 34,
      right: 21,
      bottom: 24
  });
    this.mSubmit.setTextStyle({fontSize: "48px"});
    this.mSubmit.on("pointerup", this.onSubmitHandler, this);
    this.add(this.mSubmit);

    this.mPrePageBtn = this.scene.make.image({
      x: 150,
      y: 615,
      key: this.key,
      frame: "arrow.png"
    });
    this.mNextPageBtn = this.scene.make.image({
      x: size.width - 150,
      y: 615,
      key: this.key,
      frame: "arrow.png"
    }).setFlipX(true);

    this.mRandomBtn = this.scene.make.image({
      x: 790,
      y: 1000,
      key: this.key,
      frame: "random.png"
    }).setScale(1.6).setInteractive();
    this.add([this.mPrePageBtn, this.mNextPageBtn, this.mRandomBtn]);
    this.mRandomBtn.on("pointerup", this.onRandomNameHandler, this);

    const role = this.scene.make.image({
      x: size.width >> 1,
      y: 560,
      key: "role",
    }, false);
    this.add(role);

    this.mErrorBg = this.scene.make.image({
      key: this.key,
      frame: "tips_bg.png",
      x: 620,
      y: 232
    }).setVisible(false);

    this.mError = this.scene.make.text({
      x: 416,
      y: 180,
      style: {
        color: "#26265d",
        font: "bold 34px YaHei",
        wordWrap: {
          width: 440,
          useAdvancedWrap: true
        },
      },
    }, false).setVisible(false);
    this.add([this.mErrorBg, this.mError]);

    this.dragonbones = new DragonbonesDisplay(this.scene, undefined);
    this.dragonbones.load(new DragonbonesModel({
      id: 0,
      avatar: this.avatars[0]
    }));
    this.dragonbones.scale = this.mWorld.uiScale;
    this.dragonbones.x = 100;
    this.dragonbones.y = 100;
    this.dragonbones.play("idle");
    // this.add(this.dragonbones);

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
  }

  private onSubmitHandler() {
    this.emit("submit", this.inputText.text);
    if (this.mError) {
      this.mError.setVisible(false);
      this.mErrorBg.setVisible(false);
    }
  }
}

import { InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { BasePanel } from "../components/base.panel";
import { UiManager } from "../ui.manager";
import { Font, i18n } from "utils";
import { DragonbonesDisplay } from "../../display/dragonbones/dragonbones.display";
import { ModuleName } from "structure";

export class CreateRolePanel extends BasePanel {
  private mFoot: Phaser.GameObjects.Image;
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private mBackground: Phaser.GameObjects.Image;
  private mSubmit: NineSliceButton;
  private mInputTextBg: NineSlicePatch;
  private inputText: InputText;
  private mPrePageBtn: Phaser.GameObjects.Image;
  private mNextPageBtn: Phaser.GameObjects.Image;
  private mRandomBtn: Phaser.GameObjects.Image;
  private mError: Phaser.GameObjects.Text;
  private mErrorBg: Phaser.GameObjects.Image;
  private dragonbones: DragonbonesDisplay;
  private avatars: [];
  private mCurPageNum: number = 0;
  private mMediator: any;

  constructor(uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.setTween(false);
    const container = this.scene.add.container(0, 0);
    container.add(this);
    this.scene.scale.on("resize", this.onResize, this);
    this.mMediator = this.render.mainPeer["CreateRoleMediator"];
    this.key = ModuleName.CREATEROLE_NAME;
    // container.scale = 1 / this.mWorld.uiScale;
  }

  show(param: any) {
    if (param[0]) {
      this.avatars = param[0].avatars;
    }
    super.show(param);
  }

  preload() {
    // this.scene.load.atlas(
    //   this.key,
    //   Url.getRes("ui/create_role/create_role.png"),
    //   Url.getRes("ui/create_role/create_role.json")
    // );
    this.addAtlas(this.key, "create_role/create_role.png", "create_role/create_role.json");
    super.preload();
  }

  resize(wid: number, hei: number) {
    if (!this.mBackground) {
      return;
    }
    const scale = this.scale;
    const width = this.scene.cameras.main.width / scale;
    const height = this.scene.cameras.main.height / scale;
    const centerX = this.scene.cameras.main.centerX / scale;
    // this.setScale(scale);

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
    this.dragonbones.x = centerX;

    this.mNextPageBtn.x = width - 150;

    this.mRandomBtn.x = this.mInputTextBg.x + this.mInputTextBg.width / 2 - 26 * this.dpr;
  }

  init() {
    // const size = this.mWorld.getSize();
    // const zoom = this.mWorld.uiScale;

    const { width, height } = this.scene.cameras.main;
    this.mBackground = this.scene.make.image({
      key: this.key,
      frame: "bg.png",
      x: width >> 1,
    });
    this.mBackground.y = this.mBackground.height / 2 + 92 * this.dpr;
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
    this.mBackgroundColor.fillRect(0, 0, width, height);
    this.addAt(this.mBackgroundColor, 0);

    // this.mInputTextBg = new NinePatch(this.scene, width >> 1, 350 * this.dpr, 255 * this.dpr, 50 * this.dpr, this.key, "input_bg.png", {
    //   left: 27 * this.dpr,
    //   top: 24 * this.dpr,
    //   right: 28 * this.dpr,
    //   bottom: 24 * this.dpr
    // });
    this.mInputTextBg = new NineSlicePatch(this.scene, width >> 1, 350 * this.dpr, 255 * this.dpr, 50 * this.dpr, this.key, "input_bg.png", {
      left: 27 * this.dpr,
      top: 24 * this.dpr,
      right: 28 * this.dpr,
      bottom: 24 * this.dpr
    });
    this.add(this.mInputTextBg);

    this.inputText = new InputText(this.scene, width >> 1, 350 * this.dpr, 160 * this.dpr, 80, {
      type: "input",
      fontSize: 18 * this.dpr + "px",
      color: "#717171",
      align: "center",
      placeholder: i18n.t("create_role.enter_nick")
    }).setOrigin(0.5);
    this.add(this.inputText);

    let text = i18n.t("create_role.commit");
    if (this.mShowData && this.mShowData.button) {
      text = this.mShowData.button.text;
    }

    const frame = this.scene.textures.getFrame(this.key, "submit_button_normal");
    let w = 42;
    let h = 43;
    if (frame) {
      w = frame.width;
      h = frame.height;
    }
    this.mSubmit = new NineSliceButton(this.scene, width >> 1, 445 * this.dpr, 202 * this.dpr, 55 * this.dpr, this.key, "submit_button", text, undefined, undefined, {
      left: 19 * this.dpr,
      top: 20 * this.dpr,
      right: w - 2 - 19 * this.dpr,
      bottom: h - 2 - 20 * this.dpr
    });
    this.mSubmit.setTextStyle({
      color: "#976400",
      fontSize: 18 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
    });
    this.mSubmit.setFontStyle("bold");
    this.mSubmit.on("pointerup", this.onSubmitHandler, this);
    this.add(this.mSubmit);

    this.mPrePageBtn = this.scene.make.image({
      x: 60 * this.dpr,
      y: 216 * this.dpr,
      key: this.key,
      frame: "arrow_left.png"
    }).setInteractive();
    this.mPrePageBtn.on("pointerup", this.onPrePageHandler, this);
    this.mNextPageBtn = this.scene.make.image({
      x: width - 60 * this.dpr,
      y: this.mPrePageBtn.y,
      key: this.key,
      frame: "arrow.png"
    }).setFlipX(true).setInteractive();
    this.mNextPageBtn.on("pointerup", this.onNextPageHandler, this);

    this.mRandomBtn = this.scene.make.image({
      x: this.mInputTextBg.x,
      y: this.mInputTextBg.y,
      key: this.key,
      frame: "random.png"
    }).setInteractive();
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
      x: 220 * this.dpr,
      y: 57 * this.dpr
    }).setVisible(false);

    this.mError = this.scene.make.text({
      x: 127 * this.dpr,
      y: 30 * this.dpr,
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
    this.dragonbones.scale = this.dpr * 2;
    this.dragonbones.x = width >> 1;
    this.dragonbones.y = this.mNextPageBtn.y + 70 * this.dpr;
    // this.dragonbones.y = 286 * this.dpr;
    // this.dragonbones.play("idle");
    this.dragonbones.on("initialized", this.loadDragonbonesComplete, this);
    this.add(this.dragonbones);

    this.setPageNum(0);

    super.init();
    this.resize(0, 0);
  }

  setAvatars(avatars) {
    // this.avatars = avatars;
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

  destroy() {
    if (this.scene) this.scene.scale.off("resize", this.onResize, this);
    if (this.dragonbones) {
      this.dragonbones.off("initialized", this.loadDragonbonesComplete, this);
    }
    super.destroy();
  }

  private onRandomNameHandler() {
    this.mediator.randomName();
    this.inputText.setBlur();
  }

  private onSubmitHandler() {
    // this.emit("submit", this.inputText.text, this.avatars[this.mCurPageNum]);
    this.mediator.submit(this.inputText.text, this.avatars[this.mCurPageNum]);
    // this.mediator.submit("", this.avatars[this.mCurPageNum]);
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
    this.dragonbones.load({
      id: 0,
      avatar: this.avatars[this.mCurPageNum]
    });
  }

  private onResize(gameSize) {
    this.resize(gameSize.width, gameSize.height);
  }

  private loadDragonbonesComplete() {
    this.dragonbones.play({ name: "idle", flip: false });
  }

  get mediator() {
    if (!this.mMediator) {
      return;
    }
    return this.mMediator;
  }
}

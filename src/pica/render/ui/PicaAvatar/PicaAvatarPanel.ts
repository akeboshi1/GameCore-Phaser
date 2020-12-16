import { NineSliceButton, GameGridTable, GameScroller, Button, BBCodeText, NineSlicePatch, ClickEvent } from "apowophaserui";
import { DynamicImage, Render, TextButton, UiManager } from "gamecoreRender";
import { DetailDisplay } from "picaRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { AvatarSuit, AvatarSuitType, ModuleName, RunningAnimation, SuitAlternativeType } from "structure";
import { Coin, Font, Handler, i18n, Logger, UIHelper, Url } from "utils";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";

export class PicaAvatarPanel extends PicaBasePanel {
  private mCloseBtn: Button;
  private mBackground: Phaser.GameObjects.Graphics;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mBg: Phaser.GameObjects.Image;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mCategoryScroll: GameScroller;
  private saveBtn: NineSliceButton;
  private resetBtn: Button;
  private rotateAvatarBtn: Button;
  private nameText: Phaser.GameObjects.Text;

  private mDetailBubble: DetailBubble;
  private mSceneType: any;// op_def.SceneTypeEnum
  private categoryType: any;// op_pkt_def.PKT_PackageType
  private mSelectedItemData: any[] = [];// op_client.ICountablePackageItem
  private mSelectedItems: Item[] = [];
  private dressAvatarIDS: string[] = [];
  private dressAvatarDatas: op_client.ICountablePackageItem[] = [];
  private isInitAvatar: boolean = false;
  private avatarDirection: number = 0;// 0-正向，1-反向
  constructor(uiManager: UiManager, sceneType: any) {// sceneType: op_def.SceneTypeEnum
    super(uiManager);
    this.key = ModuleName.PICAAVATAR_NAME;
    this.mSceneType = sceneType;
    this.atlasNames = [UIAtlasName.uicommon];
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.clear();
    this.mBackground.fillStyle(0x01cdff);
    this.mBackground.fillRect(0, 0, width, height);
    this.mShelfContainer.setSize(width, 295 * this.dpr);
    this.mShelfContainer.y = height - this.mShelfContainer.height + 6 * this.dpr;
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
    this.mCategoryScroll.x = width * 0.5;
    this.mCategoryScroll.y = this.mShelfContainer.y + 20 * this.dpr;
    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.height / 2 + 10 * this.dpr;
    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = (height - this.mShelfContainer.height - 80 * this.dpr) * 0.5 + 80 * this.dpr;
    this.mDetailDisplay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 110 * this.dpr, 110 * this.dpr), Phaser.Geom.Rectangle.Contains);
    this.rotateAvatarBtn.x = width / 2 + 100 * this.dpr;
    this.rotateAvatarBtn.y = this.mDetailDisplay.y;
    this.mPropGrid.x = width / 2 + 3 * this.dpr;
    this.mPropGrid.y = this.mShelfContainer.y + this.mPropGrid.height * 0.5 + 48 * this.dpr;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();
    this.setSize(width, height);
    this.setInteractive();
  }

  setCategories(subcategorys: any[]) {// op_def.IStrPair
    // subcategorys.unshift({ key: this.seachKey, value: "搜索" });
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    (<any>this.mCategoryScroll).clearItems();
    const allCategory = { value: "", key: "" };// op_def.StrPair
    allCategory.value = i18n.t("common.all");
    allCategory.key = "alltype";
    subcategorys.unshift(allCategory);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, 1, subcategorys[i].value, 0, 0);
      item.x = i * capW;
      item.y = capH - item.text.height - 20 * this.dpr;
      item.setData("item", subcategorys[i]);
      item.setSize(capW, capH);
      this.mCategoryScroll.addItem(item);
      item.setChangeColor("#FFD248");
      items[i] = item;
      item.setFontSize(17 * this.dpr);
      item.setFontStyle("bold");
    }
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
    this.updateCategeoriesLoc(false);
  }

  public setProp(props: any[], isupdate: boolean = false) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    this.mSelectedItems.length = 0;
    const len = props.length;
    if (len < 24) {
      props = props.concat(new Array(24 - len));
    }
    this.mPropGrid.setItems(props);
    if (this.dressAvatarDatas.length === 0) {
      for (const prop of props) {
        if (prop && prop.rightSubscript === op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK) {
          this.dressAvatarDatas.push(prop);
        }
      }
      if (this.isInitAvatar) {
        this.initBaseAvatar();
      }
      this.isInitAvatar = true;
    }
  }

  public setDressAvatarIds(ids: string[]) {
    this.dressAvatarIDS = ids;
    if (this.isInitAvatar) {
      this.initBaseAvatar();
    }
    this.isInitAvatar = true;
  }

  public initBaseAvatar() {
    if (this.isInitAvatar) {
      const arr = [];
      for (const id of this.dressAvatarIDS) {
        for (const avatar of this.dressAvatarDatas) {
          if (avatar.id === id) {
            arr.push(avatar);
            this.mSelectedItemData.push(avatar);
          }
        }
      }
      this.dressAvatarDatas.length = 0;
      this.dressAvatarDatas = arr;
      this.displayAvatar();
      this.mDetailBubble.visible = false;
    } else {
      let property = null;
      this.render.mainPeer.getUserData_PlayerProperty()
        .then((val) => {
          property = val;
          return this.serviceTimestamp;
        })
        .then((t) => {
          this.mDetailBubble.setProp(null, Math.floor(t / 1000), property);
          this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
        });
    }
  }

  public displayAvatar(content?: any) {
    if (!content) {
      content = { avatar: {} };
    }
    this.render.mainPeer.getPlayerAvatar()
      .then(({ avatar, suits }) => {
        avatar = avatar || AvatarSuitType.createBaseAvatar();
        for (const key in avatar) {
          if (avatar.hasOwnProperty(key)) {
            const element = avatar[key];
            if (element) content.avatar[key] = element;
          }
        }
        for (const item of this.mSelectedItemData) {
          const dataAvatar = AvatarSuitType.createAvatarBySn(item.suitType, item.sn, item.tag, item.version);
          // const dataAvatar = item.avatar;
          for (const key in dataAvatar) {
            if (dataAvatar.hasOwnProperty(key)) {
              const element = dataAvatar[key];
              if (element) content.avatar[key] = element;
            }
          }
          if (item.suitType === "weapon") {
            const suit = { suit_type: item.suitType, tag: item.tag };
            content.suits = [suit];
          }
        }
        const offset = new Phaser.Geom.Point(0, 50 * this.dpr);
        this.mDetailDisplay.loadAvatar(content, 2 * this.dpr, offset);
        Logger.getInstance().error("测试调用+++++装扮重置问题", this.mSelectedItemData);
      });
  }
  public setSelectedResource(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.displayAvatar();
    }
  }

  public resetAvatar(avatar: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR
    const content = { avatar: null };// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    content.avatar = avatar.avatar;
    const offset = new Phaser.Geom.Point(0, 50 * this.dpr);
    this.mDetailDisplay.loadAvatar(content, 2 * this.dpr, offset);
    this.mSelectedItemData.length = 0;
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
    this.saveBtn.on(ClickEvent.Tap, this.onSaveBtnHandler, this);
    this.resetBtn.on(ClickEvent.Tap, this.onResetBtnHandler, this);
    this.rotateAvatarBtn.on(ClickEvent.Tap, this.onRotateAvatarHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
    this.saveBtn.off(ClickEvent.Tap, this.onSaveBtnHandler, this);
    this.resetBtn.off(ClickEvent.Tap, this.onResetBtnHandler, this);
    this.rotateAvatarBtn.off(ClickEvent.Tap, this.onRotateAvatarHandler, this);
  }
  public fetchCategory() {
    this.onSelectedCategory(op_pkt_def.PKT_PackageType.AvatarPackage);
  }

  destroy() {
    if (this.mCategoryScroll) {
      this.mCategoryScroll.destroy();
    }
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    super.destroy();
  }

  queryRefreshPackage(isupdate: boolean = false) {
    this.queryPackege(isupdate);
  }

  protected init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.mBackground = this.scene.make.graphics(undefined, false);
    const background = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_bg" });
    background.displayWidth = width;
    background.x = width * 0.5;
    this.mBg = this.scene.make.image({
      key: UIAtlasName.uicommon,
      frame: "avater_bg_stripe"
    }, false);
    this.mBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.setSize(width, 295 * this.dpr);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    const categoryBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_nav" });
    categoryBg.displayWidth = width;
    categoryBg.x = width * 0.5;
    categoryBg.y = categoryBg.height * 0.5;
    this.mShelfContainer.add(categoryBg);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 50 * this.dpr);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    const nameBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_name_bg" });
    nameBg.x = width * 0.5;
    nameBg.y = this.mCloseBtn.y;
    this.nameText = this.scene.make.text({ x: nameBg.x, y: nameBg.y, text: "", style: UIHelper.whiteStyle(this.dpr, 14) }).setOrigin(0.5);
    const leftbg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_bg_adorn" });
    leftbg.x = leftbg.width * 0.5;
    leftbg.y = leftbg.height * 0.5;
    leftbg.scaleX = -1;
    const rightbg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_bg_adorn" });
    rightbg.x = width - leftbg.width * 0.5;
    rightbg.y = leftbg.height * 0.5;
    const btnwidth = 90 * this.dpr;
    const btnHeight = 38 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr;
    const btnPosY = this.mShelfContainer.y - 25 * this.dpr;
    this.saveBtn = this.createNineButton(btnPosX, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.save"), "#996600");
    this.resetBtn = new Button(this.scene, UIAtlasName.uicommon, "avater_repeal");
    this.resetBtn.x = width - 30 * this.dpr;
    this.resetBtn.y = this.mCloseBtn.y;
    this.rotateAvatarBtn = new Button(this.scene, UIAtlasName.uicommon, "avater_turn_back", "avater_turn_back");
    this.mDetailDisplay = new DetailDisplay(this.scene, this.render, true);
    this.mDetailDisplay.setSize(110 * this.dpr, 110 * this.dpr);
    this.mDetailDisplay.setComplHandler(new Handler(this, () => {
      this.mDetailDisplay.visible = true;
    }));
    this.mDetailDisplay.setTexture(UIAtlasName.uicommon, "ghost");
    this.mDetailDisplay.setNearest();
    this.mDetailDisplay.on("pointerup", this.onAvatarClickHandler, this);
    //  this.mDetailDisplay.loadSprite("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"));
    this.mDetailDisplay.y = this.mBg.y + this.mBg.height / 2;
    this.mDetailBubble = new DetailBubble(this.scene, UIAtlasName.uicommon, this.dpr);
    this.mDetailBubble.x = 10 * this.dpr;

    this.mCategoryScroll = new GameScroller(this.scene, {
      x: width * 0.5,
      y: this.mShelfContainer.y + 20 * this.dpr,
      width,
      height: 41 * this.dpr,
      zoom: this.scale,
      orientation: 1,
      dpr: this.dpr,
      // valuechangeCallback: (newValue) => {
      //   this.refreshPos(newValue);
      // },
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });
    this.add([this.mBackground, background, leftbg, rightbg, this.mBg, this.mCloseBtn, nameBg, this.nameText, this.mDetailDisplay, this.mDetailBubble]);
    this.add([this.mShelfContainer, this.mCategoryScroll, this.saveBtn, this.resetBtn, this.rotateAvatarBtn]);
    const propFrame = this.scene.textures.getFrame(UIAtlasName.uicommon, "avater_icon_check");
    const capW = (propFrame.width + 2 * this.dpr);
    const capH = (propFrame.height + 2 * this.dpr);
    const tableConfig = {
      x: 0,
      y: 0,
      table: {
        width,
        height: 260 * this.dpr,
        columns: 3,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        zoom: this.scale,
        mask: false,
      },
      scrollMode: 1,
      clamplChildOY: false,
      // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new Item(scene, 0, 0, UIAtlasName.uicommon, this.dpr);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        if (item && this.isSelectedItemData(item)) {
          cellContainer.isSelect = true;
          this.mSelectedItems.push(cellContainer);
        } else {
          const index = this.mSelectedItems.indexOf(cellContainer);
          if (index !== -1) this.mSelectedItems.splice(index, 1);
        }
        return cellContainer;
      },
    };
    this.mPropGrid = new GameGridTable(this.scene, tableConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell) => {
      if (cell) {
        this.onSelectItemHandler(cell);
      }
    });
    this.add(this.mPropGrid);
    this.resize(0, 0);
    super.init();
  }

  private createNineButton(x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, color?: string) {
    const btn = new NineSliceButton(this.scene, x, y, width, height, key, frame, text, this.dpr, 1, {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: 15 * this.dpr,
      bottom: 14 * this.dpr
    });
    if (text) {
      btn.setTextStyle({
        color,
        fontSize: 16 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      });
      btn.setFontStyle("bold");
    }

    return btn;
  }

  private setSelectAvatarSuitItem(data: op_client.ICountablePackageItem, cell: Item) {
    const suit_type = data.suitType;
    if (!suit_type) {
      Logger.getInstance().error("CountablePackageItem avatar does not exist", data);
      return;
    }
    for (const temp of this.mSelectedItems) {
      temp.isSelect = false;
    }
    const removeArr = [];
    for (const item of this.mSelectedItemData) {
      if (SuitAlternativeType.checkAlternative(suit_type, item.suitType)) {
        removeArr.push(item);
      }
    }
    for (const item of removeArr) {
      const index = this.mSelectedItemData.indexOf(item);
      this.mSelectedItemData.splice(index, 1);
      for (let i = 0; i < this.mSelectedItems.length; i++) {
        const cell1 = this.mSelectedItems[i];
        if (cell1.propData === item) {
          this.mSelectedItems.splice(i, 1);
          break;
        }
      }
    }
    if (this)
      this.mSelectedItemData.push(data);
    this.mSelectedItems.push(cell);
    cell.isSelect = true;
    const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
    content.avatar = AvatarSuitType.createAvatarBySn(data.suitType, data.sn, data.tag, data.version);
    content.animations = data.animations;
    this.setSelectedResource(content);
  }
  private isSelectedItemData(data: op_client.ICountablePackageItem) {// op_client.ICountablePackageItem
    if (this.mSelectedItemData.length > 0) {
      // for (const temp of this.mSelectedItemData) {
      //   if (temp.indexId === data.indexId) {
      //     return true;
      //   }
      // }
      const temp = this.mSelectedItemData[this.mSelectedItemData.length - 1];
      if (temp.indexId === data.indexId) return true;
    }
    // else {
    //   if (data.rightSubscript === op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK) return true;
    // }

    return false;
  }

  private onSelectSubCategoryHandler(gameobject: TextButton) {
    const category: any = gameobject.getData("item");// op_def.IStrPair
    if (category) {
      if (this.mPreCategoryBtn && (this.mPreCategoryBtn instanceof TextButton)) {
        this.mPreCategoryBtn.changeNormal();
      }
      if (gameobject instanceof TextButton)
        gameobject.changeDown();
      this.mSelectedCategeories = category;
      this.mPropGrid.setT(0);
      const isupdate = this.mSelectedItemData.length === 0 ? false : true;
      this.queryPackege(isupdate);

      this.mPreCategoryBtn = gameobject;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private queryPackege(isupdate: boolean = false) {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryPackage", { packType: this.categoryType, key: this.mSelectedCategeories.key, isupdate });
    }
  }

  private onSelectItemHandler(cell: Item) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (this.mSelectedItemData.indexOf(item) !== -1) return;
    this.mDetailBubble.visible = true;
    let property = null;
    this.render.mainPeer.getUserData_PlayerProperty()
      .then((val) => {
        property = val;
        return this.serviceTimestamp;
      })
      .then((t) => {
        this.mDetailBubble.setProp(item, Math.floor(t / 1000), property);
        this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
      });
    if (item) {
      this.avatarDirection = 0;
      this.setSelectAvatarSuitItem(item, cell);
      this.nameText.text = item.name;
    }
  }

  private onSelectedCategory(categoryType: number) {
    this.categoryType = categoryType;
    this.render.renderEmitter(this.key + "_queryDressAvatarIDS");
    this.render.renderEmitter(this.key + "_getCategories", categoryType);
  }

  private async onSaveBtnHandler() {
    this.dressAvatarIDS.length = 0;
    this.dressAvatarDatas.length = 0;
    const idsArr = [];
    for (const item of this.mSelectedItemData) {
      idsArr.push(item.id);
      this.dressAvatarIDS.push(item.id);
      this.dressAvatarDatas.push(item);
    }
    this.render.renderEmitter(this.key + "_querySaveAvatar", idsArr);
    const result = [];
    const suitPart = AvatarSuitType.suitPart;
    for (const avatar of this.dressAvatarDatas) {
      result.push({ "parts": suitPart[avatar.suitType], id: avatar.sn });
    }
    const str = await this.render.editorCanvasManager.createHeadIcon(result);
    this.render.mainPeer.uploadHeadImage(str);
  }

  private onResetBtnHandler() {
    this.mSelectedItemData.length = 0;
    for (const data of this.dressAvatarDatas) {
      this.mSelectedItemData.push(data);
    }
    this.displayAvatar();
    this.mPropGrid.refresh();
  }

  private onRotateAvatarHandler() {
    this.avatarDirection++;
    if (this.avatarDirection >= 2) this.avatarDirection = 0;
    const data = this.getAvatarAni();
    const aniData: RunningAnimation = {
      name: ("idle"),
      flip: data.flip
    };
    const back = data.back;
    this.mDetailDisplay.setPlayAnimation(aniData, back);
  }

  private onAvatarClickHandler() {
    const anis = ["idle", "run", "mining", "crafting"];
    const ani = anis[Math.floor(Math.random() * (anis.length))];
    const data = this.getAvatarAni();
    const aniData: RunningAnimation = {
      name: (ani),
      flip: data.flip,
      times: 1,
      playingQueue: {
        name: "idle", playTimes: -1
      }
    };
    const back = data.back;
    this.mDetailDisplay.setPlayAnimation(aniData, back);
  }

  private getAvatarAni() {
    let back = false;
    let flip = false;
    switch (this.avatarDirection) {
      case 0:
        back = false;
        flip = false;
        break;
      case 1:
        back = true;
        flip = true;
        break;
      case 2:
        back = true;
        flip = true;
        break;
      case 3:
        back = false;
        flip = true;
        break;
    }
    return {
      back, flip
    };
  }

  private updateCategeoriesLoc(inputBoo: boolean) {
    const list = this.mCategoryScroll.getItemList();
    const h = 41 * this.dpr;
    let preBtn: Phaser.GameObjects.Container = null;
    const offset = 30 * this.dpr;
    const w = this.mScene.cameras.main.width;
    let tmpW: number = offset;
    for (let i = 0; i < list.length; i++) {
      const item: Phaser.GameObjects.Container = <Phaser.GameObjects.Container>list[i];
      if (i > 0) {
        preBtn = <Phaser.GameObjects.Container>list[i - 1];
        item.x = preBtn.x + preBtn.width; // - item.width * item.originX;
      } else {
        item.x = tmpW;
      }
      tmpW += item.width;
    }

    this.mCategoryScroll.setAlign();

  }

  private get serviceTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.render.mainPeer.requestCurTime().then((t) => {
        resolve(t);
      });
    });
  }
}

class DetailBubble extends Phaser.GameObjects.Container {

  private dpr: number;
  private timeID: any;
  private tipsbg: NineSlicePatch;
  private tipsText: BBCodeText;
  private mExpires: BBCodeText;
  // private testText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    const tipsWidth = 100 * dpr;
    const tipsHeight = 96 * dpr;
    this.setSize(tipsWidth, tipsHeight);
    this.tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, UIAtlasKey.common2Key, "tips_bg", {
      left: 10 * this.dpr,
      top: 10 * this.dpr,
      right: 10 * this.dpr,
      bottom: 10 * this.dpr
    }, undefined, undefined, 0);
    this.tipsbg.setPosition(tipsWidth * 0.5, tipsHeight * 0.5);
    this.tipsbg.alpha = 0.6;
    this.tipsText = new BBCodeText(this.scene, 7 * dpr, -tipsHeight + 60 * this.dpr, "", {
      color: "#333333",
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      lineSpacing: 6 * dpr,
      padding: {
        top: 2 * dpr
      }
    }).setOrigin(0);
    this.tipsText.setWrapMode("string");
    this.mExpires = new BBCodeText(scene, 7 * dpr, 85 * dpr, "", {
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
    }).setOrigin(0);
    this.add([this.tipsbg, this.tipsText, this.mExpires]);
    this.tipsText.addImage("iv_coin", { key: UIAtlasName.uicommon, frame: "home_silver", y: -3 * this.dpr });
    this.tipsText.addImage("iv_diamond", { key: UIAtlasName.uicommon, frame: "home_diamond", y: -3 * this.dpr });
  }

  setProp(prop: any, servertime: number, property: any): this {// op_client.ICountablePackageItem, PlayerProperty
    if (!prop) {
      this.tipsText.setText(i18n.t("furni_bag.empty_backpack"));
      this.mExpires.text = "";
      this.resize();
    } else {
      this.tipsText.setWrapWidth(undefined);
      const name = `[color=#32347b][b][size=${14 * this.dpr}]${prop.shortName || prop.name}[/size][/b][/color]`;
      let price = "";
      let source = "";
      let describle = "";
      let attri = "";
      let need = "";
      let tips = name + "\n";
      let maxWidth: number = 100 * this.dpr;
      this.tipsText.text = tips;
      maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      if (prop.recyclable) {
        if (prop.sellingPrice) {
          price = `${i18n.t("furni_bag.sale_price")}: [img=${Coin.getIcon(prop.sellingPrice.coinType)}] ${prop.sellingPrice.price}`;
          tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
          this.tipsText.text = price;
          maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
        }
      } else {
        price = i18n.t("furni_bag.not_sale");
        tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
        this.tipsText.text = price;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      if (prop.source) {
        // source = `${i18n.t("furni_bag.source")}：${prop.source}`;
        source = `${prop.source}`;
        tips += `\n[color=#ffffff][size=${12 * this.dpr}]${source}[/size][/color]`;
        this.tipsText.text = source;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      if (prop.des && prop.des !== "") {
        describle = prop.des;
        tips += "\n" + describle;
        this.tipsText.text = describle;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      let isline = false;
      if (prop.affectValues) {
        const len = prop.affectValues.length;
        for (let i = 0; i < len; i++) {
          const affect = prop.affectValues[i];
          if (property.hasProperty(affect.key)) {
            const proper = property.getProperty(affect.key);
            const value = affect.value > 0 ? `[color=#ffff00]+${affect.value}[/color]` : `[color=#ff0000]${affect.value}[/color]`;
            attri += `\n${proper.name}: ${value}`;
          }
        }
        if (attri.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n[color=#ffffff]${i18n.t("furni_bag.properties")}[/color]` + `${attri}`;
        }
      }
      if (prop.requireValues) {
        const len = prop.requireValues.length;
        for (let i = 0; i < len; i++) {
          const require = prop.requireValues[i];
          if (property.hasProperty(require.key)) {
            const proper = property.propertiesMap.get(require.key);
            const value = proper.value >= require.value ? `[color=#00ff00](${require.value})[/color]` : `[color=#ff0000](${require.value})[/color]`;
            need += `\n${proper.name}: ${value}`;
          }
        }
        if (need.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n${i18n.t("furni_bag.needproper")}:${need}`;
        }
      }
      this.tipsText.setWrapWidth(maxWidth);
      this.tipsText.text = tips;
      this.width = maxWidth + 14 * this.dpr;
      if (prop.expiredTime > 0) {
        if (!isline) {
          isline = true;
          tips += "\n-- -- -- -- -- -- -- --";
        }
        let interval = prop.expiredTime - servertime;
        const timeout = () => {
          (<any>this.mExpires).visible = true;
          this.mExpires.text = this.getDataFormat(interval * 1000);
          if (interval > 0) {
            this.timeID = setTimeout(() => {
              interval -= 1;
              timeout();
            }, 1000);
          } else {
            this.timeID = undefined;
          }
        };
        timeout();
      } else {
        (<any>this.mExpires).visible = false;
        if (this.timeID) clearTimeout(this.timeID);
      }
      this.resize();
    }
    return this;
  }
  private resize(w?: number, h?: number) {
    const mixheight: number = 96 * this.dpr;
    let height = this.tipsText.height;
    if ((<any>this.mExpires).visible) height += this.mExpires.height + 3 * this.dpr;
    height += 14 * this.dpr;
    height = height < mixheight ? mixheight : height;
    this.setSize(this.width, height);
    this.tipsbg.resize(this.width, this.height);
    this.tipsbg.x = this.width * 0.5;
    this.tipsbg.y = this.height * 0.5;
    this.tipsText.y = 7 * this.dpr;
    this.mExpires.y = this.tipsText.y + this.tipsText.height + 3 * this.dpr;

  }

  private getDataFormat(time: number) {
    const day = Math.floor(time / 86400000);
    const hour = Math.floor(time / 3600000) % 24;
    const minute = Math.floor(time / 60000) % 60;
    const second = Math.floor(time / 1000) % 60;
    let text = i18n.t("furni_bag.timelimit") + ":  ";
    if (day > 0) {
      const temptime = `${day}-${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else if (hour > 0 || minute > 0 || second > 0) {
      const temptime = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else {
      const temptime = `${i18n.t("furni_bag.expires")}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    }
    // else if (minute > 0) {
    //   const temptime = `${this.stringFormat(minute)}:${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // } else if (second > 0) {
    //   const temptime = `${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    //  else {
    //   const temptime = `${i18n.t("furni_bag.expires")}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    return text;
  }
  private stringFormat(num: number) {
    let str = num + "";
    if (str.length <= 1) {
      str = "0" + str;
    }
    return str;
  }
}

class Item extends Phaser.GameObjects.Container {
  public propData: any;// op_client.ICountablePackageItem
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  private selectbg: Phaser.GameObjects.Image;
  private selectIcon: Phaser.GameObjects.Image;
  private dpr: number;
  private zoom: number;
  private key: string;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
    this.key = key;
    const background = scene.make.image({
      key,
      frame: "avater_icon_uncheck"
    }, false);
    background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.selectbg = scene.make.image({
      key,
      frame: "avater_icon_check"
    }, false);
    this.selectbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.setSize(background.displayWidth, background.displayHeight);
    this.selectIcon = scene.make.image({
      key,
      frame: "selected"
    }, false).setOrigin(1).setPosition(this.width * 0.5, this.height * 0.5);
    this.selectIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mPropImage = new DynamicImage(this.scene, 0, 0);
    this.mPropImage.scale = dpr;
    this.mCounter = scene.make.text({
      x: this.width * 0.5 - 2 * dpr,
      y: this.height * 0.5,
      style: {
        fontSize: 12 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(1);
    this.add([background, this.selectbg, this.selectIcon, this.mPropImage, this.mCounter]);
    this.isSelect = false;
    this.isEquip = false;
  }

  setProp(prop: any) {// op_client.ICountablePackageItem
    this.propData = prop;
    this.isSelect = false;
    this.isEquip = false;
    this.mPropImage.visible = false;
    if (!prop) {
      // this.mPropImage.setFrame("");
      this.mCounter.visible = false;
      return;
    }
    if (!prop.tag || JSON.parse(prop.tag).type !== "remove") {
      this.mPropImage.scale = this.dpr;
      this.mPropImage.load(Url.getOsdRes(prop.display.texturePath), this, this.onPropLoadCompleteHandler);
    } else {
      this.mPropImage.setTexture(UIAtlasName.uicommon, "backpack_close");
      this.mPropImage.scale = 1;
      this.mPropImage.visible = true;
    }
    if (prop.count > 1) {
      this.mCounter.visible = true;
      this.mCounter.setText(prop.count.toString());
    } else {
      this.mCounter.visible = false;
    }
    if (prop.rightSubscript === 1) {// op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK
      this.isEquip = true;
    } else this.isEquip = false;
  }

  private onPropLoadCompleteHandler() {
    if (this.mPropImage && this.mPropImage.texture) {
      const texture = this.mPropImage.texture;
      this.mPropImage.visible = true;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  public set isSelect(value) {
    this.selectbg.visible = value;
  }

  public set isEquip(value) {
    this.selectIcon.visible = value;
  }
}

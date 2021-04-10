import { op_client, op_def } from "pixelpai_proto";
import { TabButton, BaseScroller, Button } from "apowophaserui";
import { BasePanel, CheckboxGroup, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";

export class PicaRoomListPanel extends BasePanel {
  private mCloseBtn: Phaser.GameObjects.Image;
  private mRoomDeleBtn: TabButton;
  private mMyRoomDeleBtn: TabButton;
  private mRoomDele: RoomDelegate;
  private mMyRoomDele: MyRoomDelegate;
  private mSeachBtn: Phaser.GameObjects.Image;
  private mRoomContainer: Phaser.GameObjects.Container;
  private mScroller: BaseScroller;
  private mBackGround: Phaser.GameObjects.Graphics;
  private content: Phaser.GameObjects.Container;
  private preTabButton: Button;
  private mSelectIndex: number = 0;
  constructor(uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.PICAROOMLIST_NAME;
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.content.x = width >> 1;
    this.content.y = height >> 1;
    this.mBackGround.clear();
    this.mBackGround.fillStyle(0x6AE2FF, 0);
    this.mBackGround.fillRect(0, 0, width, height);
    this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    super.resize(width, height);
    this.setSize(width, height);
  }

  updateRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    if (!content) {
      return;
    }
    this.mRoomDele.updateList(content);
  }

  updateMyRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!content) {
      return;
    }
    this.mMyRoomDele.updateList(content);
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mSeachBtn.off("pointerup", this.onSeachHandler, this);
  }

  destroy() {
    if (this.mScroller) this.mScroller.destroy();
    super.destroy();
  }

  protected preload() {
    this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
    this.addAtlas(this.key, "pica_roomlist/pica_roomlist.png", "pica_roomlist/pica_roomlist.json");
    super.preload();
  }

  protected init() {
    this.setSize(this.scaleWidth, this.scaleWidth);
    const zoom = this.mWorld.uiScale;
    const background = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false).setInteractive();
    this.mBackGround = this.scene.make.graphics(undefined, false);
    // this.mBackGround.clear();
    // this.mBackGround.fillStyle(0x6AE2FF, 0);
    // this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
    // this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "close_btn.png"
    }, false).setInteractive();
    this.mCloseBtn.x = background.width / 2 - this.mCloseBtn.width / 2 - 2 * this.dpr;
    this.mCloseBtn.y = -background.height / 2 + this.mCloseBtn.height / 2;

    this.mRoomDeleBtn = new TabButton(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.visit"));
    this.mRoomDeleBtn.x = -54 * this.dpr;
    this.mRoomDeleBtn.y = -background.height / 2 + this.mRoomDeleBtn.displayHeight / 2 - 4 * this.dpr;
    this.mRoomDeleBtn.setTextStyle({
      color: "#3333cc",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 14 * this.dpr
    });
    this.mRoomDeleBtn.setFontStyle("bold");
    this.mMyRoomDeleBtn = new TabButton(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.my"));
    this.mMyRoomDeleBtn.x = 54 * this.dpr;
    this.mMyRoomDeleBtn.y = this.mRoomDeleBtn.y;
    this.mMyRoomDeleBtn.setTextStyle({
      color: "#3333cc",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 16 * this.dpr
    });
    this.mMyRoomDeleBtn.setFontStyle("bold");
    const checkbox = new CheckboxGroup();
    checkbox.appendItemAll([this.mRoomDeleBtn, this.mMyRoomDeleBtn]);
    checkbox.on("selected", this.onSelectedHandler, this);
    this.mSelectIndex = 0;
    this.mRoomContainer = this.scene.make.container(undefined, false);
    this.mRoomContainer.setSize(282 * this.dpr, 362 * this.dpr);
    this.mRoomContainer.y = -background.height / 2 + 11 * this.dpr * zoom;
    this.mSeachBtn = this.scene.make.image({
      key: this.key,
      frame: "seach_btn.png"
    }, false).setInteractive();
    this.mSeachBtn.y = background.height / 2 - this.mSeachBtn.height / 2 + 12 * this.dpr;

    const seachText = this.scene.make.text({
      x: -35 * this.dpr,
      y: this.mSeachBtn.y,
      text: i18n.t("room_list.seach"),
      style: {
        color: "#996600",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * this.dpr
      }
    }, false).setOrigin(0.5);
    const roomText = this.scene.make.text({
      x: 35 * this.dpr,
      y: this.mSeachBtn.y,
      text: i18n.t("room_list.room"),
      style: {
        color: "#996600",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * this.dpr
      }
    }, false).setOrigin(0.5);
    this.content = this.scene.make.container(undefined, false);
    this.content.setSize(background.width, background.height);
    this.content.add([background, this.mRoomContainer, this.mCloseBtn, this.mSeachBtn, seachText, roomText]);
    this.add([this.mBackGround, this.content]);
    super.init();
    this.resize(0, 0);
    const w = this.mRoomContainer.width * this.scale;
    const h = this.mRoomContainer.height * this.scale;
    const config: any = {
      x: this.scaleWidth - w / this.scale >> 1,
      y: this.content.y - this.content.height / 2 + 20 * this.dpr * this.scale,
      clickX: 0,
      clickY: 0,
      width: this.scaleWidth,
      height: h,
      boundPad0: - 40 * this.dpr * zoom,
      zoom,
      dpr: this.dpr,
      // bounds: [
      //   this.y,
      //   this.y - h - 100 * this.dpr + (350 * this.dpr / 2)
      // ],
      value: this.content.y,
      valuechangeCallback: (newValue) => {
        this.mRoomContainer.y = newValue - this.content.y - h / 2;
      },
      cellupCallBack: (gameobject: RoomItem) => {
        gameobject.onEnterRoomHandler();
      },
      overminCallbackScope: this,
      overminCallback: () => {
        if (this.mRoomDele && this.mSelectIndex === 0) this.mRoomDele.overminHandler();
        if (!this.mMyRoomDele && this.mSelectIndex === 1) this.mMyRoomDele.overminHandler();
      }
    };
    this.mScroller = new BaseScroller(this.scene, this.mRoomContainer, config);
    this.content.add([this.mRoomDeleBtn, this.mMyRoomDeleBtn, this.mCloseBtn]);
    checkbox.selectIndex(0);
  }

  private showRoomList() {
    if (this.mMyRoomDele) {
      this.mMyRoomDele.removeFromContainer();
      this.mMyRoomDele.off("enterRoom", this.onEnterRoomHandler, this);
    }
    if (!this.mRoomDele) this.mRoomDele = new RoomDelegate(this.mRoomContainer, this.mScroller, this.scene, this.mWorld, this.key, this.dpr);
    this.mRoomDele.on("enterRoom", this.onEnterRoomHandler, this);
    this.mRoomDele.addToContainer();
    this.render.renderEmitter(ModuleName.PICAROOMLIST_NAME + "_getRoomList");
  }

  private showMyRoomList() {
    if (this.mRoomDele) {
      this.mRoomDele.removeFromContainer();
      this.mRoomDele.off("enterRoom", this.onEnterRoomHandler, this);
    }
    if (!this.mMyRoomDele) this.mMyRoomDele = new MyRoomDelegate(this.mRoomContainer, this.mScroller, this.mWorld, this.scene, this.key, this.dpr);
    this.mMyRoomDele.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyRoomDele.addToContainer();
    this.render.renderEmitter(ModuleName.PICAROOMLIST_NAME + "_getMyRoomList");
  }

  private onEnterRoomHandler(room) {
    this.render.renderEmitter(ModuleName.PICAROOMLIST_NAME + "_enterRoom", room);
  }

  private onSelectedHandler(gameobject) {
    if (!(gameobject instanceof Button)) {
      return;
    }
    this.mRoomContainer.removeAll(false);
    switch (gameobject) {
      case this.mRoomDeleBtn:
        this.showRoomList();
        this.mSelectIndex = 0;
        break;
      case this.mMyRoomDeleBtn:
        this.showMyRoomList();
        this.mSelectIndex = 1;
        break;
    }
    (gameobject).setTextColor("#996600");
    if (this.preTabButton) {
      this.preTabButton.setTextColor("#3333cc");
    }
    this.preTabButton = gameobject;
  }

  private onSeachHandler() {
    // TODO seach
  }

  private onCloseHandler() {
    this.render.renderEmitter(ModuleName.PICAROOMLIST_NAME + "_close");
  }
}

export class RoomDelegate extends Phaser.Events.EventEmitter {
  protected mChildPad: number = 0;
  protected mScene: Phaser.Scene;
  protected mDpr: number = 1;
  protected mScroller: BaseScroller;
  protected activity: Phaser.GameObjects.Image;
  protected mContainer: Phaser.GameObjects.Container;
  protected mKey: string;
  protected mRender: Render;
  protected mHeight: number = 0;
  protected mContent;
  private mPopularityRoom: PopularRoomZoon;
  private mPlayerRoom: RoomZoon;
  constructor(container: Phaser.GameObjects.Container, scroller: BaseScroller, scene: Phaser.Scene, render: Render, key: string, dpr: number = 1) {
    super();
    this.mDpr = dpr;
    this.mRender = render;
    this.mChildPad = 0;
    this.mScene = scene;
    this.mContainer = container;
    this.mScroller = scroller;
    this.mKey = key;
    this.init();
  }

  addListen() {
    this.mPopularityRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.mPlayerRoom.on("enterRoom", this.onEnterRoomHandler, this);
  }

  removeListen() {
    this.mPopularityRoom.off("enterRoom", this.onEnterRoomHandler, this);
    this.mPlayerRoom.off("enterRoom", this.onEnterRoomHandler, this);
  }

  updateList(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    this.mContent = content;
    this.mScroller.clearInteractiveObject();
    this.mHeight = this.activity.height;
    this.mChildPad = this.activity.height + 14 * this.mDpr;
    if (!this.mContent) {
      return;
    }
    this.mPopularityRoom.addItem(content.popularRooms, this.mChildPad);
  }

  addToContainer() {
    this.addListen();
    this.refreshPos();
  }

  removeFromContainer() {
    this.removeListen();
    if (this.mPopularityRoom) this.mPopularityRoom.clear();
    if (this.mPlayerRoom) this.mPlayerRoom.clear();
  }

  destroy() {
    this.removeListen();
    if (this.mPlayerRoom) this.mPopularityRoom.destroy();
    if (this.mPopularityRoom) this.mPopularityRoom.destroy();
    if (this.mScroller) this.mScroller.destroy();
    if (this.activity) this.activity.destroy();
    super.destroy();
  }

  overminHandler() {
    const hei = this.mPlayerRoom.updateItem();
    if (!hei) return;
    if (this.mPlayerRoom.mRefreshRooms) {
      this.mHeight += hei;
      this.mContainer.add(this.mPlayerRoom.mRefreshRooms);
      this.setUpdateScrollInteractive(this.mPlayerRoom.mRefreshRooms);
    }
  }

  setUpdateScrollInteractive(roomList: RoomItem[]) {
    for (let i: number = 0, len = roomList.length; i < len; i++) {
      const roomItem: RoomItem = roomList[i];
      this.mScroller.setInteractiveObject(roomItem);
    }
    this.mScroller.refreshBound(this.mHeight);
  }

  protected init() {
    this.activity = this.mScene.make.image({
      key: this.mKey,
      frame: "activity_title.png"
    }, false);
    this.activity.y = this.activity.height / 2 + 2 * this.mDpr;
    this.mChildPad += this.activity.height / 2 + 18 * this.mDpr;
    this.mPopularityRoom = new PopularRoomZoon(this.mScene, this.mKey, "popularity_icon.png", i18n.t("room_list.popularity_room"), this.mDpr, this.mRender.uiScale, 0, this.mChildPad, (hei: number) => {
      if (this.mPopularityRoom.roomList) this.setScrollInteractive(this.mPopularityRoom.roomList);
      this.mHeight += hei;
      this.refreshPos();
      this.mChildPad += this.mPopularityRoom.height;
      this.mPlayerRoom.addItem(this.mContent.playerRooms, this.mChildPad);
    });
    this.mPlayerRoom = new RoomZoon(this.mScene, this.mKey, "player_icon.png", i18n.t("room_list.player_room"), this.mDpr, this.mRender.uiScale, 0, this.mChildPad, (hei: number) => {
      if (this.mPlayerRoom.roomList) this.setScrollInteractive(this.mPlayerRoom.roomList);
      this.mHeight += hei;
      this.refreshPos();
      this.mScroller.refreshBound(this.mHeight);
      this.mScroller.setValue(this.mContainer.parentContainer.y);
    });
    this.mScroller.refreshBound(this.activity.height);
    this.mScroller.setValue(this.mContainer.parentContainer.y);
  }

  protected refreshPos() {
    if (this.activity) {
      this.activity.setTexture(this.mKey, "activity_title.png");
      this.mContainer.add(this.activity);
    }
    if (this.mPopularityRoom) {
      if (this.mPopularityRoom.showList) {
        this.mContainer.add(this.mPopularityRoom.showList);
        if (this.mPopularityRoom.roomList) {
          this.mPopularityRoom.roomList.forEach((item) => {
            this.mContainer.add(item);
          });
        }
      }
    }
    if (this.mPlayerRoom) {
      if (this.mPlayerRoom.showList) {
        this.mContainer.add(this.mPlayerRoom.showList);
        if (this.mPlayerRoom.roomList) {
          this.mPlayerRoom.roomList.forEach((item) => {
            this.mContainer.add(item);
          });
        }
      }
    }
    // const zoom: number = this.mWorld.uiScale;
    // const baseHei: number = 362 * this.mDpr;
    // let topY: number = this.mContainer.parentContainer.y;
    // Logger.getInstance().log(this.mContainer.height);
    // let bottomY: number = 0;
    // if (this.mHeight > baseHei) {
    //   topY = topY;
    //   bottomY = topY - this.mHeight + baseHei - 25 * this.mDpr * zoom;
    // } else {
    //   topY = topY;
    //   bottomY = topY;
    // }
    // this.mScroller.resize(this.mScroller.width, this.mHeight, topY, bottomY);
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }

  protected setScrollInteractive(roomList: RoomItem[]) {
    for (let i: number = 0, len = roomList.length; i < len; i++) {
      const roomItem: RoomItem = roomList[i];
      this.mScroller.setInteractiveObject(roomItem);
    }
    this.refreshPos();
  }
}

class MyRoomDelegate extends RoomDelegate {
  private mMyRoom: MyRoomZoon;
  private mMyHistory: RoomZoon;
  constructor(container: Phaser.GameObjects.Container, scroller: BaseScroller, render: Render, scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(container, scroller, scene, render, key, dpr);
  }

  addListen() {
    this.mMyRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyHistory.on("enterRoom", this.onEnterRoomHandler, this);
  }

  removeListen() {
    this.mMyRoom.off("enterRoom", this.onEnterRoomHandler, this);
    this.mMyHistory.off("enterRoom", this.onEnterRoomHandler, this);
  }

  addToContainer() {
    this.addListen();
    this.refreshPos();
  }

  removeFromContainer() {
    this.removeListen();
    if (this.mMyRoom) this.mMyRoom.clear();
    if (this.mMyHistory) this.mMyHistory.clear();
  }

  updateList(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!this.mMyRoom) {
      return;
    }
    this.mContent = content;
    this.mScroller.clearInteractiveObject();
    this.mHeight = this.activity.height;
    this.mChildPad = this.activity.height + 14 * this.mDpr;
    this.mMyRoom.addItem(content.selfRooms, this.mChildPad);
  }

  overminHandler() {
    const hei: number = this.mMyHistory.updateItem();
    if (!hei) return;
    if (this.mMyHistory.mRefreshRooms) {
      this.mHeight += hei;
      this.mContainer.add(this.mMyHistory.mRefreshRooms);
      this.setUpdateScrollInteractive(this.mMyHistory.mRefreshRooms);
    }
  }

  destroy() {
    if (this.mMyRoom) this.mMyRoom.destroy();
    if (this.mMyHistory) this.mMyHistory.destroy();
    super.destroy();
  }

  protected refreshPos() {
    if (this.activity) {
      this.activity.setTexture(this.mKey, "activity_title.png");
      this.mContainer.add(this.activity);
    }
    if (this.mMyRoom) {
      if (this.mMyRoom.showList) {
        this.mContainer.add(this.mMyRoom.showList);
        if (this.mMyRoom.roomList) {
          this.mMyRoom.roomList.forEach((item) => {
            this.mContainer.add(item);
          });
        }
      }
    }
    if (this.mMyHistory) {
      if (this.mMyHistory.showList) {
        this.mContainer.add(this.mMyHistory.showList);
        if (this.mMyHistory.roomList) {
          this.mMyHistory.roomList.forEach((item) => {
            this.mContainer.add(item);
          });
        }
      }
    }
    // const zoom: number = this.mWorld.uiScale;
    // const baseHei: number = 362 * this.mDpr;
    // let topY: number = this.mContainer.parentContainer.y;
    // let bottomY: number = 0;
    // if (this.mHeight > baseHei) {
    //   topY = topY;
    //   bottomY = topY - this.mHeight + baseHei - 25 * this.mDpr * zoom;
    // } else {
    //   topY = topY;
    //   bottomY = topY;
    // }
    // this.mScroller.resize(this.mScroller.width, this.mHeight, topY, bottomY);
  }

  protected init() {
    this.activity = this.mScene.make.image({
      key: this.mKey,
      frame: "activity_title.png"
    }, false);
    this.activity.y = this.activity.height / 2 + 2 * this.mDpr;
    this.mChildPad = this.activity.height + 14 * this.mDpr;
    this.mMyRoom = new MyRoomZoon(this.mScene, this.mKey, "my_room_icon.png", i18n.t("room_list.my_room"), this.mDpr, this.mRender.uiScale, 0, this.mChildPad, (hei: number) => {
      if (this.mMyRoom.roomList) this.setScrollInteractive(this.mMyRoom.roomList);
      this.mHeight += hei;
      this.refreshPos();
      this.mChildPad += this.mMyRoom.height;
      this.mMyHistory.addItem(this.mContent.historyRooms, this.mChildPad);
    });
    this.mMyHistory = new RoomZoon(this.mScene, this.mKey, "history_icon.png", i18n.t("room_list.my_history"), this.mDpr, this.mRender.uiScale, 0, this.mChildPad, (hei: number) => {
      if (this.mMyHistory.roomList) this.setScrollInteractive(this.mMyHistory.roomList);
      this.mHeight += hei;
      this.refreshPos();
      this.mScroller.refreshBound(this.mHeight);
      this.mScroller.setValue(this.mContainer.parentContainer.y);
    });
    this.mScroller.refreshBound(this.activity.height);
    this.mScroller.setValue(this.mContainer.parentContainer.y);
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }
}

export class RoomZoon extends Phaser.Events.EventEmitter {
  public mRefreshRooms: RoomItem[];
  protected mShowList: any[];
  protected mRooms: RoomItem[];
  protected mKey: string;
  protected mIconFrame: string;
  protected mDpr: number;
  protected mScene: Phaser.Scene;
  protected mPad: number;
  protected mOrientaction: number;
  protected mAddCallBack: Function;
  protected mWidth: number = 0;
  protected mHeight: number = 0;
  protected icon: Phaser.GameObjects.Image;
  protected text: Phaser.GameObjects.Text;
  protected mLabel: string;
  protected uiScale: number;
  protected mRoomDatas: any[];
  protected mPad1: number = 0;
  /**
   *
   * @param scene
   * @param key
   * @param iconFrame
   * @param label
   * @param dpr
   * @param scrollMode 0 竖直  1 水平
   * @param pad
   * @param addCallBack
   */
  constructor(scene: Phaser.Scene, key: string, iconFrame: string, label: string, dpr: number, uiscale: number, scrollMode: number = 0, pad: number = 0, addCallBack: Function) {
    super();
    this.mShowList = [];
    this.mScene = scene;
    this.mKey = key;
    this.mDpr = dpr;
    this.uiScale = uiscale;
    this.mPad = pad;
    this.mOrientaction = scrollMode;
    this.mIconFrame = iconFrame;
    this.mLabel = label;
    this.icon = scene.make.image({
      key,
      frame: iconFrame
    }, false);
    this.icon.x = scrollMode ? -254 * dpr / 2 + pad : -254 * dpr / 2;
    this.icon.y = scrollMode ? 0 : pad;
    this.text = scene.make.text({
      text: label,
      style: {
        color: "#ffcc33",
        fontSize: 16 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0, 0.5);
    this.text.setStroke("#663300", 2 * dpr);
    this.text.x = scrollMode ? this.icon.x + this.icon.width / 2 + 4 * dpr + pad : this.icon.x + this.icon.width / 2 + 4 * dpr;
    this.text.y = scrollMode ? 0 : pad;
    this.mWidth = this.icon.width;
    this.mHeight = this.icon.height;
    this.mAddCallBack = addCallBack;
    this.mRooms = [];
  }

  get showList(): any[] {
    return this.mShowList;
  }
  get roomList(): RoomItem[] {
    return this.mRooms;
  }

  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0) {
    this.icon = this.mScene.make.image({
      key: this.mKey,
      frame: this.mIconFrame
    }, false);
    this.text = this.mScene.make.text({
      text: this.mLabel,
      style: {
        color: "#ffcc33",
        fontSize: 16 * this.mDpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0, 0.5);
    this.text.setStroke("#663300", 2 * this.mDpr);
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    this.mPad1 = pad;
    const zoom: number = this.uiScale;
    const tmpWid: number = this.mOrientaction ? this.mPad + pad : 0;
    const tmpHei: number = 6 * this.mDpr * zoom;
    if (rooms.length > 0) {
      const len: number = rooms.length;
      // Logger.getInstance().log("len:" + len);
      this.mPad += this.icon.height + 12 * this.mDpr * zoom;
      for (let i = 0; i < len; i++) {
        if (i * (RoomItem.Hei + tmpHei) + this.mPad <= 362 * this.mDpr + RoomItem.Hei + tmpHei) {
          const room = new RoomItem(this.mScene, this.mKey, this.mDpr);
          room.setInfo(rooms[0]);
          rooms.splice(0, 1);
          room.on("enterRoom", this.onEnterRoomHandler, this);
          room.x = tmpWid;
          const roomY: number = i * (RoomItem.Hei + tmpHei) + this.mPad;
          this.mRooms.push(room);
          room.y = roomY;
          this.mHeight += RoomItem.Hei + tmpHei;
        }
        // this.mHeight += RoomItem.Hei + tmpHei;
      }
      this.mRoomDatas = rooms;
    }
    this.mHeight += tmpHei;
    if (this.mAddCallBack) {
      this.mAddCallBack(this.mHeight);
    }
  }

  updateItem(): number {
    const dataList = this.mRoomDatas.slice(0, 10);
    const len = dataList.length;
    if (len < 1) return 0;
    const zoom: number = this.uiScale;
    const tmpWid: number = this.mOrientaction ? this.mPad + this.mPad1 : 0;
    const tmpHei: number = 6 * this.mDpr * zoom;
    const roomLen: number = this.mRooms.length;
    this.mRefreshRooms = [];
    let hei: number = 0;
    for (let i: number = 0; i < len; i++) {
      const room = new RoomItem(this.mScene, this.mKey, this.mDpr);
      room.setInfo(dataList[i]);
      room.on("enterRoom", this.onEnterRoomHandler, this);
      room.x = tmpWid;
      const roomY: number = (i + roomLen) * (RoomItem.Hei + tmpHei) + this.mPad;
      room.y = roomY;
      this.mRefreshRooms.push(room);
      this.mRooms.push(room);
      this.mHeight += RoomItem.Hei + tmpHei;
      hei += RoomItem.Hei + tmpHei;
    }
    // Logger.getInstance().log(roomLen);
    this.mRoomDatas.splice(0, 10);
    return hei;
    // if (this.mAddCallBack) {
    //   this.mAddCallBack(this.mHeight);
    // }
  }

  get width(): number {
    return this.mWidth;
  }

  get height(): number {
    return this.mHeight;
  }

  public destroy() {
    this.clear();
    super.destroy();
  }

  public clear() {
    for (const room of this.mRooms) {
      room.destroy();
    }
    for (const show of this.mShowList) {
      show.destroy();
    }
    this.icon.destroy();
    this.text.destroy();
    this.mShowList.length = 0;
    this.mRooms.length = 0;
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }
}

class MyRoomZoon extends RoomZoon {
  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0) {
    // this.clear();
    this.icon = this.mScene.make.image({
      key: this.mKey,
      frame: this.mIconFrame
    }, false);
    this.text = this.mScene.make.text({
      text: this.mLabel,
      style: {
        color: "#ffcc33",
        fontSize: 16 * this.mDpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0, 0.5);
    this.text.setStroke("#663300", 2 * this.mDpr);
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    const zoom: number = this.uiScale;
    const tmpWid: number = this.mOrientaction ? this.mPad + pad : 0;
    const tmpHei: number = 6 * this.mDpr * zoom;
    if (rooms.length > 0) {
      this.mPad += this.icon.height + 14 * this.mDpr * zoom;
      // TODO 通过反射创建
      for (let i = 0; i < rooms.length; i++) {
        const room = new MyRoomItem(this.mScene, this.mKey, this.mDpr);
        room.setInfo(rooms[i]);
        room.on("enterRoom", this.onEnterRoomHandler, this);
        room.x = tmpWid;
        const roomY: number = i * (RoomItem.Hei + tmpHei) + this.mPad;
        room.y = roomY;
        this.mRooms[i] = room;
        this.mHeight += RoomItem.Hei + tmpHei;
      }
    }
    this.mHeight += tmpHei;
    if (this.mAddCallBack) {
      // Logger.getInstance().log("myroomheight:" + this.mHeight);
      this.mAddCallBack(this.mHeight);
    }
  }
}

class PopularRoomZoon extends RoomZoon {
  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0): number {
    // this.clear();
    this.icon = this.mScene.make.image({
      key: this.mKey,
      frame: this.mIconFrame
    }, false);
    this.text = this.mScene.make.text({
      text: this.mLabel,
      style: {
        color: "#ffcc33",
        fontSize: 16 * this.mDpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0, 0.5);
    this.text.setStroke("#663300", 2 * this.mDpr);
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    const zoom: number = this.uiScale;
    const tmpWid: number = this.mOrientaction ? this.mPad : 0;
    const tmpHei: number = 6 * this.mDpr * zoom;
    if (rooms.length > 0) {
      this.mPad += this.icon.height + 12 * this.mDpr * zoom;
      for (let i = 0; i < rooms.length; i++) {
        const room = new PopularRoomItem(this.mScene, this.mKey, this.mDpr);
        room.setInfo(rooms[i]);
        room.setRank(i + 1);
        room.on("enterRoom", this.onEnterRoomHandler, this);
        room.x = tmpWid;
        const roomY: number = i * (room.height + tmpHei) + this.mPad;
        room.y = roomY;
        this.mHeight += room.height + tmpHei;
        this.mRooms[i] = room;
      }
    }
    this.mHeight += tmpHei;
    if (this.mAddCallBack) {
      // Logger.getInstance().log("popheight:" + this.mHeight);
      this.mAddCallBack(this.mHeight);
    }
    return this.mHeight;
  }
}

class RoomItem extends Phaser.GameObjects.Container {
  public static Hei: number;
  protected mBackground: Phaser.GameObjects.Image;
  protected mNickName: Phaser.GameObjects.Text;
  protected mCounter: Phaser.GameObjects.Text;
  protected mCounterIcon: Phaser.GameObjects.Image;
  protected mLabelImg: Phaser.GameObjects.Image;
  protected mLabelText: Phaser.GameObjects.Text;
  protected mRoom: op_client.IEditModeRoom;
  protected mKey: string;
  protected mDpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);
    this.mKey = key;
    this.mDpr = dpr;
    this.init(key, dpr);
  }

  public setInfo(room: op_client.IEditModeRoom) {
    if (room) {
      if (room.name) this.mNickName.setText(room.name);
      if (room.playerCount) this.mCounter.setText(room.playerCount.toString());
    }
    this.mCounterIcon.x = this.mCounter.x - this.mCounter.width / 2 - this.mCounterIcon.width / 2 - 4 * this.mDpr;
    // this.crateLabel(op_def.EditModeRoomPrivacy.EDIT_MODE_ROOM_LOCKED);
    this.mRoom = room;
  }

  public roomData(): op_client.IEditModeRoom {
    return this.mRoom;
  }

  public onEnterRoomHandler(pointer?: Phaser.Input.Pointer) {
    if (this.mRoom) {
      this.emit("enterRoom", this.mRoom.roomId);
    }
  }

  protected init(key: string, dpr: number) {
    this.mBackground = this.scene.make.image({
      key,
      frame: "room_gray.png"
    }, false).setInteractive();
    this.setSize(this.mBackground.width, this.mBackground.height);
    RoomItem.Hei = this.mBackground.height;
    this.mNickName = this.scene.make.text({
      style: {
        color: "#000000",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false);
    this.mNickName.x = -this.width / 2 + 12 * dpr;
    this.mNickName.y = -(this.mNickName.height) / 2;

    this.mCounterIcon = this.scene.make.image({
      key: UIAtlasKey.commonKey,
      frame: "home_persons"
    }, false);

    this.mCounter = this.scene.make.text({
      style: {
        color: "#000000",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false).setOrigin(0.5);
    this.mCounter.x = this.width / 2 - 23 * dpr;
    this.add([this.mBackground, this.mNickName, this.mCounterIcon, this.mCounter]);
  }

  protected crateLabel(state: op_def.EditModeRoomPrivacy) {
    // TODO 封装成一个类
    let frame = "";
    let text = "";
    if (state === op_def.EditModeRoomPrivacy.EDIT_MODE_ROOM_LOCKED) {
      frame = "passworld_label.png";
      text = i18n.t("room_list.password");
    } else if (state === op_def.EditModeRoomPrivacy.EDIT_MODE_ROOM_PRIVATE) {
      frame = "close_label.png";
      text = i18n.t("room_list.close");
    }
    if (frame === "" || text === "") {
      return;
    }
    this.mLabelImg = this.scene.make.image({
      key: this.mKey,
      frame
    }, false);
    this.mLabelText = this.scene.make.text({
      text,
      style: {
        color: "#666666",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 12 * this.mDpr
      }
    }, false).setOrigin(0, 0.5);
    this.add([this.mLabelImg, this.mLabelText]);
    this.mLabelImg.x = this.width / 2 - 85 * this.mDpr;
    this.mLabelText.x = this.mLabelImg.x - 7 * this.mDpr;
  }
}

class MyRoomItem extends RoomItem {
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene, key, dpr);
  }

  protected init(key: string, dpr: number) {
    super.init(key, dpr);
    if (this.mBackground) {
      this.mBackground.setFrame("room_yellow.png");
    }
    if (this.mNickName) {
      this.mNickName.setColor("#663300");
      this.mCounter.setColor("#663300");
    }
  }
}

class PopularRoomItem extends MyRoomItem {
  private mRankImage: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene, key, dpr);
  }

  setRank(num: number) {
    if (this.mRankImage) {
      this.mRankImage.setTexture(this.mKey, `rank_${num}.png`);
      this.mRankImage.x = -this.width / 2 + this.mRankImage.width / 2 - 2 * this.mDpr;
      this.add(this.mRankImage);
    }
  }

  protected init(key: string, dpr: number) {
    super.init(key, dpr);
    this.mRankImage = this.scene.make.image(undefined, false);
    this.mNickName.x = -this.width / 2 + 37 * dpr;
  }
}

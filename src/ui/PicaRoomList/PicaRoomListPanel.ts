import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { Button } from "../components/button";
import { CheckboxGroup } from "../components/checkbox.group";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/scroller";
import { ScrollerConfig } from "../../../lib/rexui/lib/ui/interface/scroller/scrollerConfig";
import { Logger } from "../../utils/log";

export class PicaRoomListPanel extends Panel {
  private readonly key: string = "pica_roomlist";
  private mCloseBtn: Phaser.GameObjects.Image;
  private mRoomDeleBtn: Button;
  private mMyRoomDeleBtn: Button;
  private mRoomDele: RoomDelegate;
  private mMyRoomDele: MyRoomDelegate;
  private mSeachBtn: Phaser.GameObjects.Image;
  private mRoomContainer: Phaser.GameObjects.Container;
  private mScroller: GameScroller;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    this.scale = 1;
  }

  resize(w: number, h: number) {
    const scale = this.scale;
    const zoom = this.mWorld.uiScaleNew;
    const width = this.scene.cameras.main.width / scale;
    const height = this.scene.cameras.main.height / scale;
    const centerX = this.scene.cameras.main.centerX / scale;
    this.x = width / 2;
    this.y = height / 2;
    super.resize(w, h);
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

  destroy() {
    if (this.mScroller) this.mScroller.destroy();
    super.destroy();
  }

  protected preload() {
    this.addAtlas(this.key, "pica_roomlist/pica_roomlist.png", "pica_roomlist/pica_roomlist.json");
    super.preload();
  }

  protected init() {
    const zoom = this.mWorld.uiScaleNew;
    const background = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false).setInteractive();
    this.setSize(background.width, background.height);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "close_btn.png"
    }, false).setInteractive();
    this.mCloseBtn.x = this.width / 2 - this.mCloseBtn.width / 2 - 2 * this.dpr;
    this.mCloseBtn.y = -this.height / 2 + this.mCloseBtn.height / 2;

    this.mRoomDeleBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.visit"));
    this.mRoomDeleBtn.x = -54 * this.dpr;
    this.mRoomDeleBtn.y = -this.height / 2 + this.mRoomDeleBtn.height / 2 - 4 * this.dpr;
    this.mRoomDeleBtn.setTextStyle({
      color: "#3333cc",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 14 * this.dpr
    });
    this.mRoomDeleBtn.setFontStyle("bold");
    this.mMyRoomDeleBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.my"));
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
    this.mRoomContainer = this.scene.make.container(undefined, false);
    this.mRoomContainer.setSize(272 * this.dpr, 362 * this.dpr);
    this.mRoomContainer.y = -this.height / 2 + 11 * this.dpr * zoom;
    this.mSeachBtn = this.scene.make.image({
      key: this.key,
      frame: "seach_btn.png"
    }, false).setInteractive();
    this.mSeachBtn.y = this.height / 2 - this.mSeachBtn.height / 2 + 12 * this.dpr;

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

    this.add([background, this.mRoomContainer, this.mRoomDeleBtn, this.mMyRoomDeleBtn, this.mCloseBtn, this.mSeachBtn, seachText, roomText]);
    super.init();
    this.resize(0, 0);
    const w = this.mRoomContainer.width * this.scale;
    const h = this.mRoomContainer.height * this.scale;
    const config: ScrollerConfig = {
      x: this.x - w / 2,
      y: this.y - h / 2 - 30 * this.dpr * this.scale,
      width: w,
      height: h,
      bounds: [
        this.y,
        this.y - h - 100 * this.dpr + (350 * this.dpr / 2)
      ],
      value: this.y,
      valuechangeCallback: (newValue) => {
        this.mRoomContainer.y = newValue - this.y - h / 2;
      },
      cellupCallBack: (gameobject: RoomItem) => {
        gameobject.onEnterRoomHandler();
        Logger.getInstance().log(gameobject.roomData().name);
      }
    };
    this.mScroller = new GameScroller(this.mScene, this.mRoomContainer, config);
    checkbox.selectIndex(0);
    this.addActionListener();
  }
  private addActionListener() {
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
  }

  private showRoomList() {
    if (this.mMyRoomDele) {
      this.mMyRoomDele.removeFromContainer();
      this.mMyRoomDele.off("enterRoom", this.onEnterRoomHandler, this);
    }
    if (!this.mRoomDele) this.mRoomDele = new RoomDelegate(this.mRoomContainer, this.mScroller, this.scene, this.key, this.dpr);
    this.mRoomDele.on("enterRoom", this.onEnterRoomHandler, this);
    this.mRoomDele.addToContainer();
    this.emit("getRoomList");
  }

  private showMyRoomList() {
    if (this.mRoomDele) {
      this.mRoomDele.removeFromContainer();
      this.mRoomDele.off("enterRoom", this.onEnterRoomHandler, this);
    }
    if (!this.mMyRoomDele) this.mMyRoomDele = new MyRoomDelegate(this.mRoomContainer, this.mScroller, this.scene, this.key, this.dpr);
    this.mMyRoomDele.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyRoomDele.addToContainer();
    this.emit("getMyRoomList");
  }

  private onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }

  private onSelectedHandler(gameobject, prevButton) {
    if (!(gameobject instanceof Button)) {
      return;
    }
    switch (gameobject) {
      case this.mRoomDeleBtn:
        this.showRoomList();
        break;
      case this.mMyRoomDeleBtn:
        this.showMyRoomList();
        break;
    }
    (gameobject).setTextColor("#996600");
    if (prevButton) {
      if (prevButton instanceof Button) {
        prevButton.setTextColor("#3333cc");
      }
    }
  }

  private onSeachHandler() {
    // TODO seach
  }

  private onCloseHandler() {
    this.emit("close");
  }
}

export class RoomDelegate extends Phaser.Events.EventEmitter {
  protected mChildPad: number = 0;
  protected mScene: Phaser.Scene;
  protected mDpr: number = 1;
  protected mScroller: GameScroller;
  protected activity: Phaser.GameObjects.Image;
  protected mContainer: Phaser.GameObjects.Container;
  protected mShow: boolean = false;
  protected mKey: string;
  private mPopularityRoom: RoomZoon;
  private mPlayerRoom: RoomZoon;
  constructor(container: Phaser.GameObjects.Container, scroller: GameScroller, scene: Phaser.Scene, key: string, dpr: number = 1) {
    super();
    this.mDpr = dpr;
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
    this.mChildPad = this.activity.y + this.activity.height / 2 + 18 * this.mDpr;
    this.mPopularityRoom.addItem(content.popularRooms, this.mChildPad);
    this.mChildPad += this.mPopularityRoom.height + 10 * this.mDpr;
    this.mPlayerRoom.addItem(content.playerRooms, this.mChildPad);
    this.mScroller.clearInteractiveObject();
    if (this.mPopularityRoom.roomList) this.setScrollInteractive(this.mPopularityRoom.roomList);
    if (this.mPlayerRoom.roomList) this.setScrollInteractive(this.mPlayerRoom.roomList);
  }

  addToContainer() {
    this.mShow = true;
    this.addListen();
    this.refreshPos();
  }

  removeFromContainer() {
    this.mShow = false;
    this.removeListen();
    this.mContainer.removeAll(false);
  }

  destroy() {
    this.removeListen();
    if (this.mPlayerRoom) this.mPopularityRoom.destroy();
    if (this.mPopularityRoom) this.mPopularityRoom.destroy();
    if (this.mScroller) this.mScroller.destroy();
    if (this.activity) this.activity.destroy();
    super.destroy();
  }

  protected init() {
    this.activity = this.mScene.make.image({
      key: this.mKey,
      frame: "activity_title.png"
    }, false);
    this.activity.y = this.activity.height / 2 + 2 * this.mDpr;
    this.mChildPad += this.activity.y + this.activity.height / 2 + 18 * this.mDpr;
    this.mPopularityRoom = new PopularRoomZoon(this.mScene, this.mKey, "popularity_icon.png", i18n.t("room_list.popularity_room"), this.mDpr, 0, this.mChildPad, () => {
      this.refreshPos();
    });
    this.mPlayerRoom = new RoomZoon(this.mScene, this.mKey, "player_icon.png", i18n.t("room_list.player_room"), this.mDpr, 0, this.mChildPad, () => {
      this.refreshPos();
    });
    this.mShow = true;
  }

  protected refreshPos() {
    if (this.activity) this.mContainer.add(this.activity);
    if (this.mPopularityRoom.showList) this.mContainer.add(this.mPopularityRoom.showList);
    if (this.mPopularityRoom.roomList) this.mContainer.add(this.mPopularityRoom.roomList);
    if (this.mPlayerRoom.showList) this.mContainer.add(this.mPlayerRoom.showList);
    if (this.mPlayerRoom.roomList) this.mContainer.add(this.mPlayerRoom.roomList);
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }

  protected setScrollInteractive(roomList: RoomItem[]) {
    for (let i: number = 0, len = roomList.length; i < len; i++) {
      const roomItem: RoomItem = roomList[i];
      this.mScroller.setInteractiveObject(roomItem);
    }
  }
}

class MyRoomDelegate extends RoomDelegate {
  private mMyRoom: RoomZoon;
  private mMyHistory: RoomZoon;
  constructor(container: Phaser.GameObjects.Container, scroller: GameScroller, scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(container, scroller, scene, key, dpr);
  }

  addListen() {
    this.mMyRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyHistory.on("enterRoom", this.onEnterRoomHandler, this);
  }

  removeListen() {
    this.mMyRoom.off("enterRoom", this.onEnterRoomHandler, this);
    this.mMyHistory.off("enterRoom", this.onEnterRoomHandler, this);
  }

  updateList(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!this.mMyRoom) {
      return;
    }
    this.mChildPad = this.activity.y + this.activity.height / 2 + 18 * this.mDpr;
    this.mMyRoom.addItem(content.selfRooms, this.mChildPad);
    this.mChildPad += this.mMyRoom.height + 10 * this.mDpr;
    this.mMyHistory.addItem(content.historyRooms, this.mChildPad);
    this.mScroller.clearInteractiveObject();
    if (this.mMyRoom.roomList) this.setScrollInteractive(this.mMyRoom.roomList);
    if (this.mMyHistory.roomList) this.setScrollInteractive(this.mMyHistory.roomList);
  }

  destroy() {
    if (this.mMyRoom) this.mMyRoom.destroy();
    if (this.mMyHistory) this.mMyHistory.destroy();
    super.destroy();
  }

  protected refreshPos() {
    if (this.activity) this.mContainer.add(this.activity);
    if (this.mMyRoom.showList) this.mContainer.add(this.mMyRoom.showList);
    if (this.mMyRoom.roomList) this.mContainer.add(this.mMyRoom.roomList);
    if (this.mMyHistory.showList) this.mContainer.add(this.mMyHistory.showList);
    if (this.mMyHistory.roomList) this.mContainer.add(this.mMyHistory.roomList);
  }

  protected init() {
    this.activity = this.mScene.make.image({
      key: this.mKey,
      frame: "activity_title.png"
    }, false);
    this.activity.y = this.activity.height / 2 + 2 * this.mDpr;
    this.mChildPad += this.activity.y + this.activity.height / 2 + 18 * this.mDpr;
    this.mMyRoom = new MyRoomZoon(this.mScene, this.mKey, "my_room_icon.png", i18n.t("room_list.my_room"), this.mDpr, 0, this.mChildPad, () => {
      this.refreshPos();
    });
    this.mMyHistory = new RoomZoon(this.mScene, this.mKey, "history_icon.png", i18n.t("room_list.my_history"), this.mDpr, 0, this.mChildPad, () => {
      this.refreshPos();
    });
    // this.mChildPad += 100 * this.mDpr;
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }
}

export class RoomZoon extends Phaser.Events.EventEmitter {
  protected mShowList: any[];
  protected mRooms: RoomItem[];
  protected mKey: string;
  protected mDpr: number;
  protected mScene: Phaser.Scene;
  protected mPad: number;
  protected mOrientaction: number;
  protected mAddCallBack: Function;
  protected mWidth: number = 0;
  protected mHeight: number = 0;
  protected icon: Phaser.GameObjects.Image;
  protected text: Phaser.GameObjects.Text;
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
  constructor(scene: Phaser.Scene, key: string, iconFrame: string, label: string, dpr: number, scrollMode: number = 0, pad: number = 0, addCallBack: Function) {
    super();
    this.mShowList = [];
    this.mScene = scene;
    this.mKey = key;
    this.mDpr = dpr;
    this.mPad = pad;
    this.mOrientaction = scrollMode;
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
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
  }

  get showList(): any[] {
    return this.mShowList;
  }
  get roomList(): RoomItem[] {
    return this.mRooms;
  }

  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0) {
    this.clear();
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    const len = rooms.length;
    if (len > 0) {
      this.mPad += this.mHeight;
      for (let i = 0; i < len; i++) {
        const room = new RoomItem(this.mScene, this.mKey, this.mDpr);
        room.setInfo(rooms[i]);
        room.on("enterRoom", this.onEnterRoomHandler, this);
        room.x = this.mOrientaction ? this.mPad + pad : 0;
        room.y = this.mOrientaction ? i * (room.height + 6 * this.mDpr) + 11 * this.mDpr : i * (room.height + 6 * this.mDpr) + 11 * this.mDpr + this.mPad;
        this.mHeight += room.height;
        this.mRooms[i] = room;
      }
    }
    if (this.mAddCallBack) {
      this.mAddCallBack(this.mPad);
    }
  }

  get width(): number {
    return this.mWidth;
  }

  get height(): number {
    return this.mHeight;
  }

  public destroy() {
    for (const obj of this.mShowList) {
      obj.destroy();
    }
    this.mShowList.length = 0;
    this.clear();
    super.destroy();
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }

  protected clear() {
    for (const room of this.mRooms) {
      room.destroy();
    }
    this.mRooms.length = 0;
  }
}

class MyRoomZoon extends RoomZoon {
  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0) {
    this.clear();
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    if (rooms.length > 0) {
      this.mPad += this.mHeight;
      // TODO 通过反射创建
      for (let i = 0; i < rooms.length; i++) {
        const room = new MyRoomItem(this.mScene, this.mKey, this.mDpr);
        room.setInfo(rooms[i]);
        room.on("enterRoom", this.onEnterRoomHandler, this);
        room.x = this.mOrientaction ? this.mPad : 0;
        room.y = this.mOrientaction ? i * (room.height + 6 * this.mDpr) + 30 * this.mDpr : i * (room.height + 6 * this.mDpr) + 30 * this.mDpr + this.mPad;
        this.mHeight += room.height;
        this.mRooms[i] = room;
      }
    }
    if (this.mAddCallBack) {
      this.mAddCallBack(this.mPad);
    }
  }
}

class PopularRoomZoon extends RoomZoon {
  addItem(rooms: op_client.IEditModeRoom[], pad: number = 0) {
    this.clear();
    this.icon.x = this.mOrientaction ? -254 * this.mDpr / 2 + pad : -254 * this.mDpr / 2;
    this.icon.y = this.mOrientaction ? 0 : pad;
    this.text.x = this.mOrientaction ? this.icon.x + this.icon.width / 2 + 4 * this.mDpr + pad : this.icon.x + this.icon.width / 2 + 4 * this.mDpr;
    this.text.y = this.mOrientaction ? 0 : pad;
    this.mShowList.push(this.icon);
    this.mShowList.push(this.text);
    this.mHeight = this.icon.height;
    this.mPad = pad ? pad : this.mPad;
    if (rooms.length > 0) {
      // this.mPad += this.mHeight;
      for (let i = 0; i < rooms.length; i++) {
        const room = new PopularRoomItem(this.mScene, this.mKey, this.mDpr);
        room.setInfo(rooms[i]);
        room.setRank(i + 1);
        room.on("enterRoom", this.onEnterRoomHandler, this);
        room.x = this.mOrientaction ? this.mPad : 0;
        room.y = this.mOrientaction ? i * (room.height + 6 * this.mDpr) + 30 * this.mDpr : i * (room.height + 6 * this.mDpr) + 30 * this.mDpr + this.mPad;
        this.mHeight += room.height;
        this.mRooms[i] = room;
      }
    }
    if (this.mAddCallBack) {
      this.mAddCallBack(this.mPad);
    }
  }
}

class RoomItem extends Phaser.GameObjects.Container {
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
    this.mNickName.setText(room.name);
    this.mCounter.setText(room.playerCount.toString());
    this.mCounterIcon.x = this.mCounter.x - this.mCounter.width / 2 - this.mCounterIcon.width / 2 - 4 * this.mDpr;
    // this.crateLabel(room.privacy);
    this.crateLabel(op_def.EditModeRoomPrivacy.EDIT_MODE_ROOM_LOCKED);
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
      key,
      frame: "counter_icon.png"
    }, false);

    this.mCounter = this.scene.make.text({
      style: {
        color: "#000000",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false).setOrigin(0.5);
    this.mCounter.x = this.width / 2 - 23 * dpr;

    // this.mCounter.y = this.mNickName.y;
    this.add([this.mBackground, this.mNickName, this.mCounterIcon, this.mCounter]);

    // this.mBackground.on("pointerup", this.onEnterRoomHandler, this);
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

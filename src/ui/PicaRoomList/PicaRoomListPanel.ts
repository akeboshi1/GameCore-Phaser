import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { Button } from "../components/button";
import { CheckboxGroup } from "../components/checkbox.group";
import Scroller from "../../../lib/rexui/plugins/input/scroller/Scroller";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";

export class PicaRoomListPanel extends Panel {
  private readonly key: string = "pica_roomlist";
  private mCloseBtn: Phaser.GameObjects.Image;
  private mRoomListBtn: Button;
  private mMyRoomListBtn: Button;
  private mRoomList: RoomList;
  private mMyRoomList: MyRoomList;
  private mSeachBtn: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.x = width / 2;
    this.y = height / 2;
    super.resize(w, h);
  }

  updateRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    if (!content) {
      return;
    }
    this.mRoomList.updateList(content);
  }

  updateMyRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!content) {
      return;
    }
    this.mMyRoomList.updateList(content);
  }

  protected preload() {
    this.addAtlas(this.key, "pica_roomlist/pica_roomlist.png", "pica_roomlist/pica_roomlist.json");
    super.preload();
  }

  protected init() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
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

    this.mRoomListBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.visit"));
    this.mRoomListBtn.x = -54 * this.dpr;
    this.mRoomListBtn.y = -this.height / 2 + this.mRoomListBtn.height / 2 - 4 * this.dpr;
    this.mRoomListBtn.setTextStyle({
      color: "#3333cc",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 14 * this.dpr
    });
    this.mRoomListBtn.setFontStyle("bold");
    this.mMyRoomListBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down", i18n.t("room_list.my"));
    this.mMyRoomListBtn.x = 54 * this.dpr;
    this.mMyRoomListBtn.y = this.mRoomListBtn.y;
    this.mMyRoomListBtn.setTextStyle({
      color: "#3333cc",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 16 * this.dpr
    });
    this.mMyRoomListBtn.setFontStyle("bold");
    const checkbox = new CheckboxGroup();
    checkbox.appendItemAll([this.mRoomListBtn, this.mMyRoomListBtn]);
    checkbox.on("selected", this.onSelectedHandler, this);

    this.mRoomList = new RoomList(this.scene, this.key, this.dpr);
    this.mRoomList.y = -this.height / 2 + 11 * this.dpr;
    this.mMyRoomList = new MyRoomList(this.scene, this.key, this.dpr);
    this.mMyRoomList.y = this.mRoomList.y;

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

    this.add([background, this.mRoomListBtn, this.mMyRoomListBtn, this.mCloseBtn, this.mSeachBtn, seachText, roomText]);
    super.init();
    this.resize(0, 0);

    this.addActionListener();
    checkbox.selectIndex(0);
  }

  private addActionListener() {
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
    this.mRoomList.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyRoomList.on("enterRoom", this.onEnterRoomHandler, this);
  }

  private showRoomList() {
    this.addAt(this.mRoomList, 1);
    // this.mRoomList.addMask();
    this.remove(this.mMyRoomList);
    this.emit("getRoomList");
  }

  private showMyRoomList() {
    this.addAt(this.mMyRoomList, 1);
    this.remove(this.mRoomList);
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
      case this.mRoomListBtn:
        this.showRoomList();
        break;
      case this.mMyRoomListBtn:
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

class MyRoomList extends Phaser.GameObjects.Container {
  protected mKey: string;
  protected mDpr: number;
  private mMyRoom: RoomContainer;
  private mMyHistory: RoomContainer;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);
    this.mKey = key;
    this.mDpr = dpr;
    this.setSize(272 * dpr, 362 * dpr);
    const activity = this.scene.make.image({
      key,
      frame: "activity_title.png"
    }, false);
    activity.y = activity.height / 2 + 2 * dpr;

    this.mMyRoom = new MyRoomContaienr(this.scene, key, "my_room_icon.png", i18n.t("room_list.my_room"), dpr);
    this.mMyRoom.y = activity.y + activity.height / 2 + 18 * dpr;
    this.mMyRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.mMyHistory = new RoomContainer(this.scene, key, "history_icon.png", i18n.t("room_list.my_history"), dpr);
    this.mMyHistory.y = this.mMyRoom.y + 100 * dpr;
    this.mMyHistory.on("enterRoom", this.onEnterRoomHandler, this);

    this.add([activity, this.mMyRoom, this.mMyHistory]);
  }

  updateList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!this.mMyRoom) {
      return;
    }
    this.mMyRoom.addItem(content.selfRooms);
    this.mMyHistory.addItem(content.historyRooms);
    this.mMyHistory.y = this.mMyRoom.y + this.mMyRoom.height + 22 * this.mDpr;
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }
}

class RoomList extends Phaser.GameObjects.Container {
  private mPopularityRoom: RoomContainer;
  private mPlayerRoom: RoomContainer;
  private mDpr: number = 1;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);
    this.mDpr = dpr;
    this.setSize(272 * dpr, 362 * dpr);
    const activity = this.scene.make.image({
      key,
      frame: "activity_title.png"
    }, false);
    activity.y = activity.height / 2 + 2 * dpr;

    this.mPopularityRoom = new PopularRoomContainer(this.scene, key, "popularity_icon.png", i18n.t("room_list.popularity_room"), dpr);
    this.mPopularityRoom.y = activity.y + activity.height / 2 + 18 * dpr;
    this.mPopularityRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.mPlayerRoom = new RoomContainer(this.scene, key, "player_icon.png", i18n.t("room_list.player_room"), dpr);
    this.mPlayerRoom.y = this.mPopularityRoom.y + 100 * dpr;
    this.mPlayerRoom.on("enterRoom", this.onEnterRoomHandler, this);
    this.add([activity, this.mPopularityRoom, this.mPlayerRoom]);
  }

  addMask() {
    const bg = this.scene.add.graphics(undefined);
    bg.fillStyle(0, 0.2);
    // bg.fillRect(this.parentContainer.x - this.width / 2, this.parentContainer.y - this.height / 2, this.width, this.height);
    // bg.setInteractive(new Phaser.Geom.Rectangle(this.parentContainer.x - this.width / 2, this.parentContainer.y - this.height / 2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    // bg.fillRect(this.parentContainer.x - this.width / 2, this.parentContainer.y - this.height / 2, this.width, this.height).setInteractive(new Phaser.Geom.Rectangle(this.parentContainer.x - this.width / 2, this.parentContainer.y - this.height / 2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    const w = this.width * this.parentContainer.scale;
    const h = this.height * this.parentContainer.scale;
    bg.fillRect(0, 0, w, h);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    bg.setPosition(this.parentContainer.x - w / 2, h / 2 - 40 * this.mDpr);
    // bg.on("pointerup", () => {
    //   Logger.getInstance().log("================");
    // });

    // this.addAt(bg, 0);
    this.setMask(bg.createGeometryMask());

    const scroll = new Scroller(bg, {
      bounds: [
        this.parentContainer.y,
        this.parentContainer.y - h + (362 * this.mDpr / 2)
      ],
      valuechangeCallback: (newValue) => {
        this.y = newValue - this.parentContainer.y - h / 2;
      }
    });
  }

  updateList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    if (!this.mPopularityRoom) {
      return;
    }
    this.mPopularityRoom.addItem(content.popularRooms);
    this.mPlayerRoom.addItem(content.playerRooms);
    // this.mPlayerRoom.y = 0;
    this.mPlayerRoom.y = this.mPopularityRoom.y + this.mPopularityRoom.height + 22 * this.mDpr;
  }

  protected onEnterRoomHandler(room) {
    this.emit("enterRoom", room);
  }
}

export class RoomContainer extends Phaser.GameObjects.Container {
  protected mRooms: RoomItem[];
  protected mKey: string;
  protected mDpr: number;
  constructor(scene: Phaser.Scene, key: string, iconFrame: string, label: string, dpr: number) {
    super(scene);
    this.mKey = key;
    this.mDpr = dpr;
    this.setSize(254 * dpr, 30 * dpr);

    const icon = this.scene.make.image({
      key,
      frame: iconFrame
    }, false);
    icon.x = -this.width / 2;

    const text = this.scene.make.text({
      text: label,
      style: {
        color: "#ffcc33",
        fontSize: 16 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0, 0.5);
    text.setStroke("#663300", 2 * dpr);
    text.x = icon.x + icon.width / 2 + 4 * dpr;
    this.add([icon, text]);

    this.mRooms = [];
  }

  addItem(rooms: op_client.IEditModeRoom[]) {
    this.clear();
    if (rooms.length < 1) {
      return;
    }
    let len = rooms.length;
    if (len > 6) {
      len = 6;
    }
    for (let i = 0; i < len; i++) {
      const room = new RoomItem(this.scene, this.mKey, this.mDpr);
      room.setInfo(rooms[i]);
      room.on("enterRoom", this.onEnterRoomHandler, this);
      room.y = i * (room.height + 6 * this.mDpr) + 30 * this.mDpr;
      this.mRooms[i] = room;
    }
    const lastItem = this.mRooms[this.mRooms.length - 1];
    this.setSize(this.width, lastItem.y + lastItem.height / 2);
    this.add(this.mRooms);
  }

  setSize(width: number, height: number) {
    return super.setSize(width, height);
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

class MyRoomContaienr extends RoomContainer {
  addItem(rooms: op_client.IEditModeRoom[]) {
    this.clear();
    if (rooms.length < 1) {
      return;
    }
    // TODO 通过反射创建
    for (let i = 0; i < rooms.length; i++) {
      const room = new MyRoomItem(this.scene, this.mKey, this.mDpr);
      room.setInfo(rooms[i]);
      room.on("enterRoom", this.onEnterRoomHandler, this);
      room.y = i * (room.height + 6 * this.mDpr) + 30 * this.mDpr;
      this.mRooms[i] = room;
    }
    const lastItem = this.mRooms[this.mRooms.length - 1];
    this.setSize(this.width, lastItem.y + lastItem.height / 2);
    this.add(this.mRooms);
  }
}

class PopularRoomContainer extends RoomContainer {
  addItem(rooms: op_client.IEditModeRoom[]) {
    this.clear();
    if (rooms.length < 1) {
      return;
    }
    for (let i = 0; i < rooms.length; i++) {
      const room = new PopularRoomItem(this.scene, this.mKey, this.mDpr);
      room.setInfo(rooms[i]);
      room.setRank(i + 1);
      room.on("enterRoom", this.onEnterRoomHandler, this);
      room.y = i * (room.height + 6 * this.mDpr) + 30 * this.mDpr;
      this.mRooms[i] = room;
    }
    const lastItem = this.mRooms[this.mRooms.length - 1];
    this.setSize(this.width, lastItem.y + lastItem.height / 2);
    this.add(this.mRooms);
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

    this.mBackground.on("pointerup", this.onEnterRoomHandler, this);
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

  protected onEnterRoomHandler(pointer: Phaser.Input.Pointer) {
    if (this.mRoom) {
      if (Math.abs(pointer.downX - pointer.upX) < 10 * this.mDpr &&
        Math.abs(pointer.downY - pointer.upY) < 10 * this.mDpr) {
          this.emit("enterRoom", this.mRoom.roomId);
      }
    }
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

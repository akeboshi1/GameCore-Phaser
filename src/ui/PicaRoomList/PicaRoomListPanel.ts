import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { Button } from "../components/button";
import { CheckboxGroup } from "../components/checkbox.group";
import { Logger } from "../../utils/log";
import { i18n } from "../../i18n";
import { op_client } from "pixelpai_proto";

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

    this.mRoomListBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down");
    this.mRoomListBtn.x = -54 * this.dpr;
    this.mRoomListBtn.y = -this.height / 2 + this.mRoomListBtn.height / 2 - 4 * this.dpr;
    this.mMyRoomListBtn = new Button(this.scene, this.key, "checkbox_normal", "checkbox_down");
    this.mMyRoomListBtn.x = 54 * this.dpr;
    this.mMyRoomListBtn.y = this.mRoomListBtn.y;
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
    }, false);
    this.mSeachBtn.y = this.height / 2 - this.mSeachBtn.height / 2 + 12 * this.dpr;

    this.add([background, this.mRoomListBtn, this.mMyRoomListBtn, this.mCloseBtn, this.mSeachBtn]);
    super.init();
    this.resize(0, 0);

    this.addActionListener();
  }

  private addActionListener() {
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
  }

  private showRoomList() {
    this.addAt(this.mRoomList, 1);
    this.remove(this.mMyRoomList);
    this.emit("getRoomList");
  }

  private showMyRoomList() {
    this.addAt(this.mMyRoomList, 1);
    this.remove(this.mRoomList);
  }

  private onSelectedHandler(gameobject) {
    switch (gameobject) {
      case this.mRoomListBtn:
        this.showRoomList();
        break;
      case this.mMyRoomListBtn:
        this.showMyRoomList();
        break;
    }
  }

  private onSeachHandler() {
  }

  private onCloseHandler() {
    this.emit("close");
  }
}

class MyRoomList extends Phaser.GameObjects.Container {
  private mMyRoom: RoomContainer;
  private mMyHistory: RoomContainer;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);
    this.setSize(272 * dpr, 362 * dpr);
    const activity = this.scene.make.image({
      key,
      frame: "activity_title.png"
    }, false);
    activity.y = activity.height / 2 + 2 * dpr;

    this.mMyRoom = new RoomContainer(this.scene, key, "my_room_icon.png", i18n.t("room_list.my_room"), dpr);
    this.mMyRoom.y = activity.y + activity.height / 2 + 18 * dpr;
    this.mMyHistory = new RoomContainer(this.scene, key, "history_icon.png", i18n.t("room_list.my_history"), dpr);
    this.mMyHistory.y = this.mMyRoom.y + 100 * dpr;

    this.add([activity, this.mMyRoom, this.mMyHistory]);
  }
}

class RoomList extends Phaser.GameObjects.Container {
  private mPopularityRoom: RoomContainer;
  private mPlayerRoom: RoomContainer;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);
    this.setSize(272 * dpr, 362 * dpr);
    const activity = this.scene.make.image({
      key,
      frame: "activity_title.png"
    }, false);
    activity.y = activity.height / 2 + 2 * dpr;

    this.mPopularityRoom = new RoomContainer(this.scene, key, "popularity_icon.png", i18n.t("room_list.popularity_room"), dpr);
    this.mPopularityRoom.y = activity.y + activity.height / 2 + 18 * dpr;
    this.mPlayerRoom = new RoomContainer(this.scene, key, "player_icon.png", i18n.t("room_list.player_room"), dpr);
    this.mPlayerRoom.y = this.mPopularityRoom.y + 100 * dpr;
    this.add([activity, this.mPopularityRoom, this.mPlayerRoom]);
  }

  updateList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    this.mPopularityRoom.addItem(content.popularRooms);
      // for (const room of popularRooms) {
      //   this.mPopularityRoom.addItem(room);
      // }
    // }
  }
}

export class RoomContainer extends Phaser.GameObjects.Container {
  private mRooms: RoomItem[];
  private mKey: string;
  private mDpr: number;
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
    for (let i = 0; i < rooms.length; i++) {
      const room = new RoomItem(this.scene, this.mKey, this.mDpr);
      room.y = i * room.height;
      this.mRooms[i] = room;
    }
    this.add(this.mRooms);
  }

  setSize(width: number, height: number) {
    return super.setSize(width, height);
  }

  private clear() {
    for (const room of this.mRooms) {
      room.destroy();
    }
    this.mRooms.length = 0;
  }
}

export class RoomItem extends Phaser.GameObjects.Container {
  private mNickName: Phaser.GameObjects.Text;
  private mCounter: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number = 1) {
    super(scene);

    const background = this.scene.make.image({
      key,
      frame: "room_yellow.png"
    }, false);
    this.setSize(background.width, background.height);

    this.mNickName = this.scene.make.text({
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false);

    this.mNickName = this.scene.make.text({
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false);
    this.add([background, this.mNickName, this.mCounter]);
  }
}

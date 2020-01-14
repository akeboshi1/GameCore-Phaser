import { BaseMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { MessageType } from "../../../const/MessageType";
import { TopMenuContainer } from "./top.menu.container";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { IBtnData } from "../icon.btn";

export class TopMenuMediator extends BaseMediator {
  protected mView: TopMenuContainer;
  private readonly scene: Phaser.Scene;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(world);
    this.scene = scene;
    // this.mMenuPanel = new TopMenuContainer(scene, world);
    // this.onAddIconHandler({ key: "Turn_Btn_Top", name: "SaveDecorate", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"], iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1 });
  }

  show() {
    this.register();
  }

  hide() {
    this.unregister();
  }

  isSceneUI() {
    return true;
  }

  register() {
    this.world.emitter.on(MessageType.ADD_ICON_TO_TOP, this.onAddIconHandler, this);
    this.world.emitter.on(MessageType.REMOVE_ICON_FROM_TOP, this.onAddIconHandler, this);
  }

  unregister() {
    this.world.emitter.off(MessageType.ADD_ICON_TO_TOP, this.onAddIconHandler, this);
    this.world.emitter.off(MessageType.REMOVE_ICON_FROM_TOP, this.onRemoveIcon, this);
  }

  destroy() {
    this.hide();
    super.destroy();
  }

  public addItem(data: IBtnData) {
    if (!this.mView) {
      this.mView = new TopMenuContainer(this.scene, this.world);
      this.mView.on("saveDecorate", this.onSaveDecorateHandler, this);
      this.mView.on("enterDecorate", this.onEnterDecorateHandler, this);
    }
    this.mView.addItem(data);
  }

  public removeItem(name: string) {
    if (!this.mView) {
      return;
    }
    this.mView.removeItem(name);
  }

  private onAddIconHandler(data: IBtnData) {
    this.addItem(data);
  }

  private onRemoveIcon(name: string) {
    this.removeItem(name);
  }

  private onSaveDecorateHandler() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_LEAVE = packet.content;
    content.needSaveEditScene = true;
    this.world.connection.send(packet);
  }

  private onEnterDecorateHandler() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER);
    this.world.connection.send(packet);
  }
}

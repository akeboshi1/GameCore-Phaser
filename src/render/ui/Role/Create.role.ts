import { RoleManager } from "./Role.manager";
import { WorldService } from "../game/world.service";
import { CreateRoleScene } from "../../scenes/create.character";
import { CreateRolePanel } from "./Create.role.panel";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig } from "pixelpai_proto";

export interface ICreateRole {
  enter();
  start(scene: Phaser.Scene);
  destroy();
}

export class CreateRole extends PacketHandler {
  private readonly roleManager: RoleManager;
  // private createPanel: CreateRolePanel;
  private world: WorldService;
  private mAvatars: op_gameconfig.IAvatar[];
  private mParam: any;
  constructor($roleManager: RoleManager) {
    super();
    this.roleManager = $roleManager;
    this.world = this.roleManager.world;
  }

  enter(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI) {
    this.mAvatars = content.avatars;
    this.mParam = content;
    if (!this.world.game.scene.getScene(CreateRoleScene.name))
      this.world.game.scene.add(CreateRoleScene.name, CreateRoleScene);
    this.world.game.scene.start(CreateRoleScene.name, {
      world: this.world,
      role: this
    });
  }

  start(scene: Phaser.Scene) {
    this.createPanel = new CreateRolePanel(scene, this.world);
    this.createPanel.show(this.mParam);
    this.createPanel.on("randomName", this.onRandomNameHandler, this);
    this.createPanel.on("submit", this.onSubmitHandler, this);

    if (this.world.connection) {
      this.world.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE, this.onCreateErrorHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_GENERATE_NEW_NAME, this.onGenerateNameHandler);
    }
  }

  destroy() {
    if (this.world.connection) {
      this.world.connection.removePacketListener(this);
    }
    this.world.game.scene.remove(CreateRoleScene.name);
    // if (this.createPanel) this.createPanel.destroy();
  }

  private onRandomNameHandler() {
    const connection = this.world.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE_GENERATE_NEW_NAME);
    connection.send(packet);
  }

  private onSubmitHandler(name: string, avatar: op_gameconfig.IAvatar) {
    const connection = this.world.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE = packet.content;
    content.name = name;
    content.avatar = avatar;
    connection.send(packet);
  }
  private onCreateErrorHandler(buffer: Buffer) {

    if (!this.createPanel) {
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE = packet.content;
    // this.createPanel.showError(content.errorMsg);
    Peer.remote["render"].CreatePanel.showError(null, content);
  }

  private onGenerateNameHandler(packet: PBpacket) {
    if (!this.createPanel) {
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_GENERATE_NEW_NAME = packet.content;
    this.createPanel.setNickName(content.name);
  }
}

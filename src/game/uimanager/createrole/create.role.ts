import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig } from "pixelpai_proto";
import { SceneName } from "../../../sceneparam/scene.name";
import { Game } from "../../game";
import { CreateRoleManager } from "./create.role.manager";

export interface ICreateRole {
  enter();
  start(scene: Phaser.Scene);
  destroy();
}

export class CreateRole extends PacketHandler {
  private readonly roleManager: CreateRoleManager;
  // private createPanel: CreateRolePanel;
  private game: Game;
  private mAvatars: op_gameconfig.IAvatar[];
  private mParam: any;
  constructor($roleManager: CreateRoleManager) {
    super();
    this.roleManager = $roleManager;
    this.game = this.roleManager.game;
  }

  enter(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI) {
    this.mAvatars = content.avatars;
    this.mParam = content;
    this.game.peer.render.addScene(SceneName.CREATE_ROLE_SCENE, { createRole: true });
    // if (!this.world.game.scene.getScene(CreateRoleScene.name))
    //   this.world.game.scene.add(CreateRoleScene.name, CreateRoleScene);
    // this.world.game.scene.start(CreateRoleScene.name, {
    //   world: this.world,
    //   role: this
    //   createRole:true
    // });
  }

  start() { // scene: Phaser.Scene **/
    // this.createPanel = new CreateRolePanel(scene, this.world);
    // this.createPanel.show(this.mParam);
    // this.createPanel.on("randomName", this.onRandomNameHandler, this);
    // this.createPanel.on("submit", this.onSubmitHandler, this);

    if (this.game.connection) {
      this.game.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE, this.onCreateErrorHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_GENERATE_NEW_NAME, this.onGenerateNameHandler);
    }
  }

  destroy() {
    if (this.game.connection) {
      this.game.connection.removePacketListener(this);
    }
    this.game.peer.render.removeScene(SceneName.CREATE_ROLE_SCENE);
    // this.world.game.scene.remove(CreateRoleScene.name);
    // if (this.createPanel) this.createPanel.destroy();
  }

  private onRandomNameHandler() {
    const connection = this.game.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE_GENERATE_NEW_NAME);
    connection.send(packet);
  }

  private onSubmitHandler(name: string, avatar: op_gameconfig.IAvatar) {
    const connection = this.game.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE = packet.content;
    content.name = name;
    content.avatar = avatar;
    connection.send(packet);
  }
  private onCreateErrorHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE = packet.content;
    // this.createPanel.showError(content.errorMsg);
    this.game.peer.render.showCreatePanelError(content);
  }

  private onGenerateNameHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_GENERATE_NEW_NAME = packet.content;
    this.game.peer.render.createSetNickName(content.name);
  }
}

import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_gameconfig } from "pixelpai_proto";
import { Logger } from "utils";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";

export class CreateRoleMediator extends BasicMediator {
  private mCreateRole: CreateRole;
  constructor(game: Game) {
    super(ModuleName.CREATEROLE_NAME, game);
    this.game.emitter.on("GenerateName", this.randomNameCallBack, this);
    this.mCreateRole = new CreateRole(this.game);
  }

  // show(param?: any) {
  //   if (param) this.mShowData = param;
  //   if (this.mPanelInit && this.mShow) {
  //       this._show();
  //       return;
  //   }
  //   this.mShow = true;
  //   this.__exportProperty(() => {
  //       this.game.peer.render.showPanel(this.key, param).then(() => {
  //           this.mView = this.game.peer.render[this.key];
  //           this.panelInit();
  //       });
  //       this.mediatorExport();
  //   });
  // }

  randomName() {
    this.mCreateRole.onRandomNameHandler();
  }

  submit(name: string, avatar: op_gameconfig.IAvatar) {
    this.mCreateRole.onSubmitHandler(name, avatar);
  }

  destroy() {
    super.destroy();
    if (this.mCreateRole) {
      this.mCreateRole.destroy();
    }
  }

  protected panelInit() {
    this.game.renderPeer.showCreateRole(this.mShowData);
  }

  private randomNameCallBack(val: string) {
    if (!this.mView) this.mView = this.game.peer.render[ModuleName.CREATEROLE_NAME];
    this.mView.setNickName(val);
  }

  private onError() {

  }
}

class CreateRole extends PacketHandler {
  private mParam: any;
  private mEvent: Map<string, any> = new Map();
  private event: Event;
  constructor(private game: Game) {
    super();
    this.start();
  }

  start() {
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
  }

  public on(type: string, listener: Function, context?: any) {
    this.mEvent.set(type, { listener, context });
  }

  public once(type: string, listener: Function, context?: any) {
    this.mEvent.set(type, { listener, context });
  }

  public off(type: string, listener: Function) {
    this.mEvent.delete(type);
  }

  public onRandomNameHandler() {
    const connection = this.game.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE_GENERATE_NEW_NAME);
    connection.send(packet);
  }

  public onSubmitHandler(name: string, avatar: op_gameconfig.IAvatar) {
    const connection = this.game.connection;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE = packet.content;
    content.name = name;
    content.avatar = avatar;
    connection.send(packet);
  }

  private onCreateErrorHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE = packet.content;
    const error = this.mEvent.get("error");
    if (error) {
      const { listener, context, once } = error;
      listener.call(context, content);
      if (once) this.mEvent.delete("error");
    }
  }

  private onGenerateNameHandler(packet: PBpacket) {
    Logger.getInstance().log("Generate Name: ", packet.content.name);
    this.game.emitter.emit("GenerateName", packet.content.name);
  }
}

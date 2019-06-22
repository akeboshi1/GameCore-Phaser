import { MediatorBase } from "../../base/module/core/MediatorBase";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig } from "pixelpai_proto";
import Globals from "../../Globals";
import { MessageType } from "../../common/const/MessageType";
import { ShopView } from "./view/ShopView";

export class ShopMediator extends MediatorBase {
  private readonly _perPage = 50;
  get view(): ShopView {
    return <ShopView>this.viewComponent;
  }

  onRegister() {
    super.onRegister();
    this.queryShopProps();
    this.view.onBuyItem.add(this.onBuyItemHandler, this);
    Globals.MessageCenter.on(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
  }

  onRemove() {
    this.view.onBuyItem.remove(this.onBuyItemHandler, this);
    Globals.MessageCenter.cancel(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
    super.onRemove();
  }

  private queryShopProps() {
    if (!!this.m_Param === false) return;

    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
    let content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
    content.id = this.m_Param[0].id;
    content.page = 1;
    content.perPage = this._perPage;
    Globals.SocketManager.send(pkt);
  }

  private queryPackageHandler(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
    this.view.addItems(data.items);
  }

  private onBuyItemHandler(item: op_gameconfig.IItem) {
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = item.id;

    Globals.SocketManager.send(pkt);
  }
}
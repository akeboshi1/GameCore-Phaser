import { MediatorBase } from "../../base/module/core/MediatorBase";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_gameconfig } from "pixelpai_proto";
import Globals from "../../Globals";
import { MessageType } from "../../common/const/MessageType";
import { ShopView } from "./view/ShopView";

export class ShopMediator extends MediatorBase {
  private readonly _perPage = 50;
  private _curPage: number;
  private fetching: boolean;
  private isEnd = false;
  get view(): ShopView {
    return <ShopView>this.viewComponent;
  }

  onRegister() {
    super.onRegister();
    this._curPage = 1;
    this.queryShopProps(this._curPage, this._perPage);
    this.view.onBuyItem.add(this.onBuyItemHandler, this);
    this.view.scroll.changeIndex.add(this.onChangeIndex, this);
    Globals.MessageCenter.on(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
  }

  onRemove() {
    this.view.onBuyItem.remove(this.onBuyItemHandler, this);
    Globals.MessageCenter.cancel(MessageType.QUERY_PACKAGE, this.queryPackageHandler, this);
    this.view.scroll.changeIndex.remove(this.onChangeIndex, this);
    super.onRemove();
  }

  private queryShopProps(page: number = 1, perPage: number = 50) {
    if (!!this.m_Param === false) return;
    this.fetching = true;

    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
    let content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
    content.id = this.m_Param[0].id;
    content.page = page;
    content.perPage = perPage;
    Globals.SocketManager.send(pkt);
  }

  private queryPackageHandler(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
    if (data.items.length > 0) {
      this.view.addItems(data.items);
    } else {
      this.isEnd = true;
    }
    this.fetching = false;
  }

  private onBuyItemHandler(item: op_gameconfig.IItem) {
    let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
    let content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
    content.uiId = this.m_Param[0].id;
    content.componentId = item.id;

    Globals.SocketManager.send(pkt);
  }

  private onChangeIndex(rate) {
    if (rate >= 0.9 && this.fetching === false && this.isEnd === false) {
      this._curPage++;
      this.queryShopProps(this._curPage);
    }
  }
}
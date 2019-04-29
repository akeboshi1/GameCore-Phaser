import {MediatorBase} from "../../base/module/core/MediatorBase";
import {StorageView} from "./view/StorageView";
import {StorageListItem} from "./view/item/StorageListItem";
import Globals from "../../Globals";
import {op_client, op_gameconfig, op_virtual_world} from "pixelpai_proto";
import {UIEvents} from "../../base/component/event/UIEvents";
import {PBpacket} from "net-socket-packet";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI;
import {Log} from "../../Log";

export class StorageMediator extends MediatorBase {

    private get view(): StorageView {
        return this.viewComponent as StorageView;
    }

    public onRegister(): void {
        super.onRegister();
        this.initView();
        this.view.m_List.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
    }

    private onListItemUp(item: StorageListItem): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        let elementInfo: ElementInfo = Globals.DataCenter.SceneData.mapInfo.getElementInfo(param.id);
        if (elementInfo) {
            let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
            let content: OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
            content.uiId = elementInfo.package.id;
            content.componentId = item.data.id;

            Globals.SocketManager.send(pkt);
            Globals.ModuleManager.destroyModule(ModuleTypeEnum.STORAGE);
        }
    }

    private initView(): void {
        let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.getParam()[0];
        let elementInfo: ElementInfo = Globals.DataCenter.SceneData.mapInfo.getElementInfo(param.id);
        if (elementInfo == null || elementInfo.package.items.length === 0) {
            return;
        }
        this.renderList(elementInfo.package.items);
    }

    private renderList(value: any[]): void {
        this.view.m_List.onClear();
        let len = value.length;
        let item: StorageListItem;
        for (let i = 0; i < len; i++) {
            item = new StorageListItem(Globals.game);
            item.setEnable(true);
            // let animation: op_gameconfig.Animation = new op_gameconfig.Animation();
            // animation.baseLoc = "-102,-149";
            // animation.collisionArea = "1,1,1,1&1,1,1,1&1,1,1,1&1,1,1,1";
            // animation.frame = [0];
            // animation.frameRate = 12;
            // animation.id = 11095928;
            // animation.name = "idle";
            // animation.originPoint = [3, 3];
            // animation.walkOriginPoint = [3, 3];
            // animation.walkableArea = "1,0,0,1&0,0,0,0&0,0,0,0&0,0,0,1";
            // value[i].animations = [animation];
            // value[i].animationName = "idle";
            // value[i].display = {
            //     texturePath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.png",
            //     dataPath: "lainson/elements/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d/4/fce84fe9db16315e04be8be0b0f2c4cfdf5d8c0d.json"
            // };
            item.data = value[i];
            this.view.m_List.addItem(item);
        }
    }
}

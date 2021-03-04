import {BasicMediator, DecorateManager, Game} from "gamecore";
import {MessageType, ModuleName} from "structure";
import {Logger} from "utils";
import {op_client, op_def, op_pkt_def} from "pixelpai_proto";
import PKT_PackageType = op_pkt_def.PKT_PackageType;
import {BaseDataConfigManager} from "../../data/base.data.config.manager";

export class PicaDecorateMediator extends BasicMediator {

    private readonly QUICK_SELECT_COUNT: number = 6;

    private mDecorateManager: DecorateManager;
    private mCacheData_UpdateCount: Array<{ baseID: string, count: number }> = [];
    private mCacheData_SelectFurniture: string = "";

    constructor(game: Game) {
        super(ModuleName.PICADECORATE_NAME, game);

        this.game.emitter.on(MessageType.DECORATE_SELECTE_ELEMENT, this.onSelectFurniture, this);
        this.game.emitter.on(MessageType.DECORATE_UNSELECT_ELEMENT, this.onUnselectFurniture, this);
        this.game.emitter.on(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, this.updateFurnitureCount, this);
    }

    show(param?: any) {
        super.show(param);

        if (this.game.roomManager.currentRoom === null || this.game.roomManager.currentRoom.decorateManager === null) {
            Logger.getInstance().error("no decorateManager: ",
                this.game.roomManager.currentRoom !== null, this.game.roomManager.currentRoom.decorateManager !== null);
            return;
        }
        this.mDecorateManager = this.game.roomManager.currentRoom.decorateManager;
        this.mDecorateManager.dealEntryData();
    }

    destroy() {
        this.game.emitter.off(MessageType.DECORATE_SELECTE_ELEMENT, this.onSelectFurniture, this);
        this.game.emitter.off(MessageType.DECORATE_UNSELECT_ELEMENT, this.onUnselectFurniture, this);
        this.game.emitter.off(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, this.updateFurnitureCount, this);
        super.destroy();
    }

    isSceneUI() {
        return false;
    }

    // called by view
    public btnHandler_Close() {
        this.mDecorateManager.exit();
    }

    public btnHandler_SaveAndExit() {
        this.mDecorateManager.save();
    }

    public btnHandler_RemoveAll() {
        this.mDecorateManager.removeAll();
    }

    public btnHandler_Reverse() {
        this.mDecorateManager.reverse();
    }

    public btnHandler_Bag() {
        this.mDecorateManager.openBag();
    }

    public onFurnitureClick(baseID: string) {
        this.mDecorateManager.addFromBag(baseID);
    }

    // ..

    // called by decorate manager
    public onSelectFurniture(baseID: string) {
        if (!this.bagData) return;
        if (!this.mView) {
            this.mCacheData_SelectFurniture = baseID;
            return;
        }

        const count = this.mDecorateManager.getBagCount(baseID);
        const bagData = this.bagData.getItem(PKT_PackageType.FurniturePackage, baseID);
        if (bagData) {
            bagData.count = count;
            this.mView.setSelectedFurniture(bagData);
        } else {
            const configMgr = <BaseDataConfigManager> this.game.configManager;
            const configItem = configMgr.getItemBase(baseID);
            configItem.count = count;
            this.mView.setSelectedFurniture(configItem);
        }
        this.mView.hideSaveBtn();
    }

    public onUnselectFurniture() {
        if (this.mView) this.mView.showSaveBtn();
    }

    public updateFurnitureCount(baseID: string, count: number) {
        if (this.mView) this.mView.updateFurnitureCount(baseID, count);
        else {
            const data = {baseID, count};
            this.mCacheData_UpdateCount.push(data);
        }
    }

    // ..

    protected panelInit() {
        super.panelInit();

        let furnitures = this.bagData.getItemsByCategory(op_pkt_def.PKT_PackageType.FurniturePackage, "alltype");
        furnitures.sort((a, b) => {
            if (!a.addedTimestamp) return 1;
            if (!b.addedTimestamp) return -1;

            return b.addedTimestamp - a.addedTimestamp;
        });

        if (furnitures.length > this.QUICK_SELECT_COUNT) {
            furnitures = furnitures.slice(0, this.QUICK_SELECT_COUNT - 1);
        }
        this.mView.setQuickSelectFurnitures(furnitures);

        while (this.mCacheData_UpdateCount.length > 0) {
            const data = this.mCacheData_UpdateCount.pop();
            this.updateFurnitureCount(data.baseID, data.count);
        }

        if (this.mCacheData_SelectFurniture.length > 0) {
            this.onSelectFurniture(this.mCacheData_SelectFurniture);
            this.mCacheData_SelectFurniture = "";
        }
    }

    private get bagData() {
        if (!this.game.user || !this.game.user.userData || !this.game.user.userData.playerBag) {
            return;
        }
        return this.game.user.userData.playerBag;
    }
}

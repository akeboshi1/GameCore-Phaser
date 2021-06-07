import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { IRecharge } from "src/pica/structure/irecharge";
import { EventType, ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaRecharge } from "./PicaRecharge";
export class PicaRechargeMediator extends BasicMediator {
    protected mModel: PicaRecharge;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICARECHARGE_NAME, game);
        this.mModel = new PicaRecharge(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_questbuy", this.sendBuyGiftPackDeBug, this);
        this.game.emitter.on(ModuleName.PICARECHARGE_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_questbuy", this.sendBuyGiftPackDeBug, this);
        this.game.emitter.off(ModuleName.PICARECHARGE_NAME + "_hide", this.hide, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    onDisable() {
        this.proto.on("BOUGHT_GIFTPACK_IDS", this.onBOUGHT_GIFTPACK_IDS, this);
    }

    onEnable() {
        this.proto.off("BOUGHT_GIFTPACK_IDS", this.onBOUGHT_GIFTPACK_IDS, this);
    }
    protected panelInit() {
        super.panelInit();
        this.sendGetGiftPackBoughtStatus();
        this.onBOUGHT_GIFTPACK_IDS(undefined);
    }
    private onUpdatePlayerInfoHandler() {
        const userData = this.game.user.userData;
        this.mView.setMoneyData(userData.money, userData.diamond);
    }
    private sendBuyGiftPackDeBug(obj: { str: string, count: number }) {
        this.game.sendCustomProto("STRING_INT", "giftPackFacade:buyGiftPackDeBug", obj);
    }

    private sendGetGiftPackBoughtStatus() {
        this.game.sendCustomProto("STRING_INT", "giftPackFacade:buyGiftPackDeBug", {});
    }

    private onBOUGHT_GIFTPACK_IDS(packet: any) {
        // const content = packet.content;
        const diamondData = this.getDiamondTestDatas();
        const giftData = this.getGiftTestDatas();
        for (const temp of diamondData) {
            this.config.getBatchItemDatas(temp.items);
            this.config.getBatchItemDatas(temp.firstPurchaseItems);
        }
        for (const temp of giftData) {
            this.config.getBatchItemDatas(temp.items);
            this.config.getBatchItemDatas(temp.firstPurchaseItems);
        }
        this.mView.setDataList([diamondData, giftData]);
    }
    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    get config() {
        return <BaseDataConfigManager>this.game.configManager;
    }
    private getDiamondTestDatas() {
        const datas = [];
        for (let i = 0; i < 6; i++) {
            const temps: IRecharge = {
                id: `${i + 1}`,
                nameid: "这是个礼包",
                price: 50,
                img: "recharge_diamond_9.99",
                double: false,
                items: [<any>{ id: "IA0000019", count: 30 }, <any>{ id: "IF0000018", count: 30 }, <any>{ id: "IF0000013", count: 30 }],
                firstPurchaseItems: [<any>{ id: "IA0000019", count: 30 }, <any>{ id: "IF0000018", count: 30 }],
                des: "这是一对礼包的描述巴拉巴开始不断拉大拉克丝豆瓣"
            };
            datas.push(temps);
        }
        return datas;
    }

    private getGiftTestDatas() {
        const datas = [];
        for (let i = 0; i < 6; i++) {
            const temps: IRecharge = {
                id: `${i + 1}`,
                nameid: "这是个礼包",
                price: 50,
                img: "recharge_diamond_bg",
                double: false,
                items: [<any>{ id: "IA0000019", count: 30 }, <any>{ id: "IF0000018", count: 30 }, <any>{ id: "IF0000013", count: 30 }],
                firstPurchaseItems: undefined,
                des: "这是一对礼包的描述巴拉巴开始不断拉大拉克丝豆瓣"
            };
            datas.push(temps);
        }
        return datas;
    }
}

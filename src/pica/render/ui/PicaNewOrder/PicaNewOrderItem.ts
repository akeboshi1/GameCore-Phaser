import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage, Render, UiManager } from "gamecoreRender";
import { DynamicImageValue, ImageValue } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";

export class PicaNewOrderItem extends Phaser.GameObjects.Container {
    private orderData: any;// op_client.IPKT_Quest
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private leftImg: Phaser.GameObjects.Image;
    private headbg: Phaser.GameObjects.Image;
    private headIcon: DynamicImage;
    private deleteBtn: Button;
    private sendBtn: Button;
    private sendTitle: Phaser.GameObjects.Text;
    private acceleBtn: Button;
    private acceleSpend: ImageValue;
    private calcuTime: ImageValue;
    private materialItems: MaterialItem[] = [];
    private imageValues: DynamicImageValue[] = [];
    private orderfinish: OrderFinishTips;
    private deliverybg: Phaser.GameObjects.Image;
    private sendHandler: Handler;
    private index: number;
    private orderOperator: any;// op_pkt_def.PKT_Order_Operator
    private timeID: any;
    private zoom: number;
    private acceleDiamond: number = 0;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "order_ordinary_list_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.deliverybg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "order_transport_car" });
        this.deliverybg.x = this.width * 0.5 - this.deliverybg.width * 0.5 - 10 * this.dpr;
        this.leftImg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "order_ordinary_title" });
        this.leftImg.x = -this.width * 0.5 + this.leftImg.width * 0.5 + 6 * dpr;
        this.leftImg.y = 0 * dpr;
        this.headbg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "order_head_bg" });
        this.headbg.x = this.width * 0.5 - this.headbg.width * 0.5 - 13 * dpr;
        this.headbg.y = -5 * dpr;
        this.headIcon = new DynamicImage(this.scene, this.headbg.x, this.headbg.y - 3 * dpr);
        this.deleteBtn = new Button(this.scene, UIAtlasName.order_new, "order_delete", "order_delete");
        this.deleteBtn.setInteractiveSize(25 * dpr, 25 * dpr);
        this.deleteBtn.x = this.width * 0.5 - 2 * dpr;
        this.deleteBtn.y = -this.height * 0.5 + 2 * dpr;
        this.sendBtn = new Button(this.scene, UIAtlasName.order_new, "order_green_butt", "order_green_butt", i18n.t("order.send"));
        this.sendBtn.x = this.headbg.x;
        this.sendBtn.y = this.headbg.y + 27 * dpr;
        this.sendBtn.setTextStyle({ fontSize: 10 * dpr });
        this.sendTitle = this.scene.make.text({ x: this.width * 0.5 - 5 * dpr, y: 0, text: i18n.t("order.deliverying"), style: { color: "#ffffff", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.sendTitle.setOrigin(1, 0.5);
        this.acceleBtn = new Button(this.scene, UIAtlasName.order_new, "order_red_butt", "order_red_butt", i18n.t("order.accele"));
        this.acceleBtn.x = -15 * dpr;
        this.acceleBtn.y = 0;
        this.acceleBtn.setTextStyle({ fontSize: 11 * dpr });
        this.acceleSpend = new ImageValue(this.scene, 30 * dpr, 10 * dpr, UIAtlasName.order_new, "order_reward_diamond", this.dpr);
        this.acceleSpend.x = this.acceleBtn.x;
        this.acceleSpend.y = this.acceleBtn.y - this.acceleBtn.height * 0.5 - 10 * dpr;
        this.calcuTime = new ImageValue(this.scene, 30 * dpr, 10 * dpr, UIAtlasName.order_new, "order_time_icon", dpr);
        this.calcuTime.setTextStyle(UIHelper.colorStyle("#144B99", 12 * dpr));
        this.calcuTime.setFontStyle("bold");
        this.calcuTime.setLayout(1);
        this.calcuTime.x = -this.width * 0.5 + 68 * dpr;
        this.calcuTime.y = -8 * dpr;
        this.orderfinish = new OrderFinishTips(scene, dpr, zoom);
        this.orderfinish.y = -5 * dpr;
        this.orderfinish.x = -10 * dpr;
        this.sendBtn.on(ClickEvent.Tap, this.onSendHandler, this);
        this.acceleBtn.on(ClickEvent.Tap, this.onAcceleHandler, this);
        this.deleteBtn.on(ClickEvent.Tap, this.onRefreshHandler, this);
        this.add([this.bg, this.deliverybg, this.leftImg, this.headbg, this.headIcon, this.orderfinish, this.deleteBtn, this.sendBtn, this.sendTitle, this.acceleBtn, this.acceleSpend, this.calcuTime]);
        // this.setInteractive();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setOrderData(data: any, index: number) {// op_client.IPKT_Quest
        this.orderData = data;
        this.index = index;
        this.hideAllElement();
        if (data.questType === 5) {
            this.bg.setFrame("order_precious_list_bg");
            this.leftImg.setFrame("order_precious_title");
        } else {
            this.bg.setFrame("order_ordinary_list_bg");
            this.leftImg.setFrame("order_ordinary_title");
        }
        if (data.stage !== 4) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END
            const texturePath = data.display.texturePath + `_${this.dpr}x.png`;
            const url = Url.getOsdRes(texturePath);
            this.headIcon.load(url);
            this.headIcon.visible = true;
        }
        if (data.stage === 1) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_ACCEPTABLE
            this.deliveryState(data);
            this.orderOperator = 0;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELIVERY
        } else if (data.stage === 2) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING
            this.deliveryingState(data);
        } else if (data.stage === 3) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED
            this.rewardState(data);
            this.orderOperator = 3;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_GET_REWARD

        } else if (data.stage === 4) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END
            this.cooldownState(data);
            this.orderOperator = 1;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_SPEED_UP
        }
    }

    destroy(fromScene?: boolean) {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        super.destroy(fromScene);
    }

    private onAcceleHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["orderoperator", { id: this.index, operator: this.orderOperator, count: this.acceleDiamond }]);
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["orderoperator", { id: this.index, operator: this.orderOperator }]);
    }

    private onRefreshHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["orderoperator", { id: this.index, operator: 2 }]);// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE
    }

    private deliveryState(data: any) {// op_client.IPKT_Quest
        const questType = data.questType;
        this.deleteBtn.visible = true;
        const isenough = this.setOrderMaterials(data);
        if (isenough) {
            this.sendBtn.setFrameNormal("order_green_butt");
            this.sendBtn.setInteractive();
        } else {
            this.sendBtn.setFrameNormal("order_gray_butt");
            this.sendBtn.disInteractive();
        }
        this.sendBtn.visible = true;
        this.sendBtn.setText(i18n.t("order.send"));
        this.sendBtn.setTextColor("#ffffff");
        this.setOrderRewards(data);
    }

    private deliveryingState(data: any) {
        this.sendBtn.setFrameNormal("order_gray_butt");
        this.sendBtn.setText(i18n.t("order.deliverying"));
        this.sendBtn.disInteractive();
        this.sendBtn.visible = true;
        this.deliverybg.visible = true;
        this.deliverybg.x = this.width * 0.5 - this.deliverybg.width * 0.5 - 10 * this.dpr;
        this.calcuTime.visible = true;
        this.calcuTime.x = -this.width * 0.5 + 68 * this.dpr;
        this.calcuTime.y = -8 * this.dpr;
        this.calcuTime.setLayout(1);
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        let intervalTime = Math.ceil(data.deliveryDeadline - data.servertime);
        const timeextu = async () => {
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.setText(timetext);
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);// intervalTime >= 60 ? 60000 : intervalTime * 1000
            else {
                if (this.sendHandler) this.sendHandler.runWith("refreshorder");
                this.timeID = undefined;
            }
            intervalTime--;
        };
        timeextu();
        this.setOrderRewards(data);
    }

    private rewardState(data: any) {// op_client.IPKT_Quest
        this.sendBtn.visible = true;
        this.sendBtn.setInteractive();
        this.sendBtn.setFrameNormal("order_yellow_butt");
        this.sendBtn.setText(i18n.t("order.receive"));
        this.sendBtn.setTextColor("#9A6600");
        this.setOrderRewards(data);
        this.deliverybg.x = -10 * this.dpr;
        this.deliverybg.visible = true;
        this.orderfinish.visible = true;
    }

    private cooldownState(data: any) {// op_client.IPKT_Quest
        this.headIcon.setTexture(UIAtlasName.order_new, "order_head_unknown");
        this.headIcon.visible = true;
        this.acceleBtn.visible = true;
        this.acceleBtn.setInteractive();
        this.acceleSpend.visible = true;
        this.calcuTime.visible = true;
        this.calcuTime.x = -17 * this.dpr;
        this.calcuTime.y = this.height * 0.5 - 8 * this.dpr;
        this.calcuTime.setLayout(2);
        this.headbg.y = 0 * this.dpr;
        this.headIcon.y = this.headbg.y - 3 * this.dpr;
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        let intervalTime = Math.ceil(data.refreshDeadline - data.servertime);
        const timeextu = async () => {
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.setText(timetext);
            this.acceleSpend.setFrameValue(minute + "", UIAtlasName.order_new, "order_reward_diamond");
            this.acceleDiamond = minute;
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);
            else {
                if (this.sendHandler) this.sendHandler.runWith("refreshorder");
                this.timeID = undefined;
            }
            intervalTime--;
        };
        timeextu();
    }

    private setOrderMaterials(data) {
        let offsetpos = -this.width * 0.5 + 58 * this.dpr;
        let isenough = true;
        for (let i = 0; i < data.targets.length; i++) {
            const itemData = data.targets[i];
            let item: MaterialItem;
            if (i < this.materialItems.length) {
                item = this.materialItems[i];
            } else {
                item = new MaterialItem(this.scene, this.dpr, this.zoom);
                item.on(ClickEvent.Tap, this.onMaterialHandler, this);
                this.add(item);
                this.materialItems.push(item);
            }
            item.setMaterialData(itemData);
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 8 * this.dpr;
            item.y = -10 * this.dpr;
            item.visible = true;
            if (isenough)
                isenough = itemData.count >= itemData.neededCount;
        }
        return isenough;
    }

    private setOrderRewards(data: any) {
        let offsetpos = -this.width * 0.5 + 40 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: DynamicImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new DynamicImageValue(this.scene, 20 * this.dpr, 18 * this.dpr, UIAtlasName.order_new, "order_reward_diamond", this.dpr);
                this.add(item);
                this.imageValues.push(item);
                // item.setOffset(0, 0 * this.dpr);
            }
            // item.setFrameValue(`${reward.count}`, this.key, this.getIconName(reward.display.texturePath) + "_s");
            item.setText(`${reward.count}`);
            item.load(Url.getOsdRes(reward.texturePath));
            item.setTextStyle(UIHelper.whiteStyle(this.dpr, 11));
            const imageWidth = item.textWidth + 20 * this.dpr;
            item.x = offsetpos + imageWidth * 0.5;
            offsetpos += imageWidth + 15 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 + 1 * this.dpr;
            item.visible = true;
        }
    }
    private onMaterialHandler(pointer, obj: MaterialItem) {
        PicaItemTipsPanel.Inst.showTips(obj, obj.itemData);
    }
    private hideAllElement() {
        this.deleteBtn.visible = false;
        this.sendBtn.visible = false;
        this.sendBtn.disInteractive();
        this.sendTitle.visible = false;
        this.acceleBtn.visible = false;
        this.acceleBtn.disInteractive();
        this.acceleSpend.visible = false;
        this.calcuTime.visible = false;
        this.orderfinish.visible = false;
        this.deliverybg.visible = false;
        for (const item of this.materialItems) {
            item.visible = false;
            item.removeListen();
        }
        for (const item of this.imageValues) {
            item.visible = false;
        }
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        this.headbg.y = -5 * this.dpr;
        this.headIcon.y = this.headbg.y - 3 * this.dpr;
    }
}
class MaterialItem extends ButtonEventDispatcher {
    public itemData: any;// op_client.ICountablePackageItem
    private icon: DynamicImage;
    private value: BBCodeText;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(30 * dpr, 40 * dpr);
        this.icon = new DynamicImage(scene, 0, -5 * dpr);
        this.icon.setSize(28 * dpr, 28 * dpr);
        this.value = new BBCodeText(this.scene, 0, this.height * 0.5 + 0 * dpr, "", UIHelper.blackStyle(dpr, 10)).setOrigin(0.5);
        this.add([this.icon, this.value]);
        this.enable = true;
    }
    public setMaterialData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.itemData = data;
        const url = Url.getOsdRes(data.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleX = 28 * this.dpr / this.icon.displayWidth;
            this.icon.scaleY = this.icon.scaleX;
        });
        this.value.text = `${data.count}/${data.neededCount}`;
    }
}

class OrderRewardItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: DynamicImage;
    private imageValue: DynamicImageValue;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_reward" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = new DynamicImage(this.scene, 0, 0);// scene.make.image({ key, frame: "order_silver_middle" });
        this.icon.scale = dpr * 0.8;
        this.add([this.bg, this.icon]);
    }

    public setItemData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.imageValue = new DynamicImageValue(this.scene, 30 * this.dpr, 20 * this.dpr, this.key, undefined, this.dpr);
        this.imageValue.setText(`${data.count}`);
        this.imageValue.load(Url.getOsdRes(data.texturePath));
        // this.imageValue.setFrameValue(`${data.count}`, this.key, this.getIconName(data.texturePath) + "_s");
        this.imageValue.x = 3 * this.dpr;
        this.imageValue.y = this.height - this.imageValue.height * 0.5 + 6 * this.dpr;
        this.imageValue.setOffset(0, this.dpr);
        this.imageValue.setTextStyle({ color: "#2154BD" });
        this.add([this.imageValue]);
        // this.icon.setFrame(this.getIconName(data.texturePath));
        this.icon.load(Url.getOsdRes(data.texturePath));
    }

    private getIconName(url: string) {
        const texturepath = url;
        const lastindex = texturepath.lastIndexOf("/");
        const lastindex2 = texturepath.lastIndexOf(".");
        const frame = texturepath.slice(lastindex + 1, lastindex2);
        return frame;
    }
}
class OrderFinishTips extends Phaser.GameObjects.Container {
    private tipsImg: ImageValue;
    private bg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.bg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "illustrate_favorites_popup_title" });
        this.setSize(this.bg.width, this.bg.height);
        this.tipsImg = new ImageValue(scene, 50 * dpr, 20 * dpr, UIAtlasName.order_new, "order_transport_perfection", dpr, UIHelper.colorStyle("#FFD248", dpr * 12));
        this.tipsImg.setLayout(2);
        this.tipsImg.setText(i18n.t("order.finishtips"));
        this.add([this.bg, this.tipsImg]);
    }
}

import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage, Render, UiManager } from "gamecoreRender";
import { DynamicImageValue, ImageValue } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { Font, Handler, i18n, Url } from "utils";

export class PicaNewOrderItem extends Phaser.GameObjects.Container {
    private orderData: any;// op_client.IPKT_Quest
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private leftImg: Phaser.GameObjects.Image;
    private headIcon: DynamicImage;
    private deleteBtn: Button;
    private sendBtn: Button;
    private sendTitle: Phaser.GameObjects.Text;
    private acceleBtn: Button;
    private acceleSpend: ImageValue;
    private calcuTime: ImageValue;
    private materialItems: MaterialItem[] = [];
    private imageValues: DynamicImageValue[] = [];
    private orderRewards: OrderRewardItem[] = [];
    private deliverybg: Phaser.GameObjects.Image;
    private sendHandler: Handler;
    private index: number;
    private orderOperator: any;// op_pkt_def.PKT_Order_Operator
    private timeID: any;
    private mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.bg = this.mScene.make.image({ key: UIAtlasName.order_new, frame: "order_ordinary_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.leftImg = this.mScene.make.image({ key: UIAtlasName.order_new, frame: "order_ordinary_title" });
        this.add(this.leftImg);
        this.leftImg.x = -this.width * 0.5 + this.leftImg.width * 0.5 + 4 * dpr;
        this.leftImg.y = 5 * dpr;
        this.headIcon = new DynamicImage(this.mScene, this.leftImg.x, 0);
        this.deleteBtn = new Button(this.mScene, UIAtlasName.order_new, "order_delete", "order_delete");
        this.deleteBtn.x = this.width * 0.5 - this.deleteBtn.width * 0.5;
        this.deleteBtn.y = -this.height * 0.5 + this.deleteBtn.height * 0.5;
        this.sendBtn = new Button(this.mScene, UIAtlasName.order_new, "order_green_butt", "order_green_butt", i18n.t("order.send"));
        this.sendBtn.x = this.width * 0.5 - this.sendBtn.width * 0.5 - 5 * dpr;
        this.sendBtn.setTextStyle({ fontSize: 10 * dpr });
        this.add(this.sendBtn);
        this.sendTitle = this.mScene.make.text({ x: this.width * 0.5 - 5 * dpr, y: 0, text: i18n.t("order.deliverying"), style: { color: "#ffffff", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.sendTitle.setOrigin(1, 0.5);
        this.add(this.sendTitle);
        this.acceleBtn = new Button(this.mScene, UIAtlasName.order_new, "order_red_butt", "order_red_butt", i18n.t("order.accele"));
        this.acceleBtn.x = 20 * dpr;
        this.acceleBtn.y = 0;
        this.acceleBtn.setTextStyle({ fontSize: 11 * dpr });
        this.add(this.acceleBtn);
        this.acceleSpend = new ImageValue(this.mScene, 30 * dpr, 10 * dpr, UIAtlasName.order_new, "order_reward_diamond", this.dpr);
        this.acceleSpend.x = this.acceleBtn.x;
        this.acceleSpend.y = this.acceleBtn.y - this.acceleBtn.height * 0.5 - 10 * dpr;
        this.add(this.acceleSpend);
        this.calcuTime = new ImageValue(this.mScene, 30 * dpr, 10 * dpr, UIAtlasName.order_new, "order_reward_diamond", dpr);
        this.add(this.calcuTime);
        this.calcuTime.setTextStyle({
            color: "#144B99", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT,
        });
        this.calcuTime.setFontStyle("bold");
        this.calcuTime.x = this.acceleBtn.x;
        this.calcuTime.y = this.acceleBtn.y + this.acceleBtn.height * 0.5 + 10 * dpr;
        this.sendBtn.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.acceleBtn.on(String(ClickEvent.Tap), this.onAcceleHandler, this);
        this.deleteBtn.on(String(ClickEvent.Tap), this.onRefreshHandler, this);
        this.setInteractive();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setOrderData(data: any, index: number) {// op_client.IPKT_Quest
        this.orderData = data;
        this.index = index;
        this.hideAllElement();
        this.bg.setFrame(data.questType === 5 ? "order_precious_bg" : "order_ordinary_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
        if (data.stage !== 4) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END
            const texturePath = data.display.texturePath + `_${this.dpr}x.png`;
            const url = Url.getOsdRes(texturePath);
            this.headIcon.load(url, this, () => {
                // this.headIcon.scale = 1;
                // this.headIcon.scaleY = 49 * this.dpr / this.headIcon.displayHeight;
                // this.headIcon.scaleX = this.headIcon.scaleY;
            });
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
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onRefreshHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, 2]);// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE
    }

    private deliveryState(data: any) {// op_client.IPKT_Quest
        const questType = data.questType;
        this.leftImg.setFrame(questType === 5 ? "order_precious_head_bg" : "order_ordinary_head_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
        this.deleteBtn.visible = true;
        this.deleteBtn.setInteractive();
        this.deleteBtn.setFrameNormal(questType === 5 ? "order_precious_delete_bg" : "order_delete_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
        let offsetpos = -this.width * 0.5 + 58 * this.dpr;
        let isenough = true;
        for (let i = 0; i < data.targets.length; i++) {
            const itemData = data.targets[i];
            let item: MaterialItem;
            if (i < this.materialItems.length) {
                item = this.materialItems[i];
            } else {
                item = new MaterialItem(this.scene, UIAtlasName.order_new, this.dpr);
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
        offsetpos = -this.width * 0.5 + 58 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: DynamicImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new DynamicImageValue(this.scene, 30 * this.dpr, 20 * this.dpr, UIAtlasName.order_new, "order_reward_diamond", this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setOffset(0, this.dpr);
            item.setText(`${reward.count}`);
            item.load(Url.getOsdRes(reward.texturePath));
            // item.setFrameValue(`${reward.count}`, this.key, this.getIconName(reward.texturePath) + "_s");
            item.setTextStyle({ color: questType === 5 ? "#ffffff" : "#2154BD" });// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
            const imageWidth = item.textWidth + 20 * this.dpr;
            item.x = offsetpos + imageWidth * 0.5;
            offsetpos += imageWidth + 5 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 + 0 * this.dpr;
            item.visible = true;
        }
    }

    private deliveryingState(data: any) {// op_client.IPKT_Quest
        if (!this.deliverybg) {
            this.deliverybg = this.scene.make.image({ key: UIAtlasName.order_new, frame: "order_transport" });
            this.addAt(this.deliverybg, 1);
            this.deliverybg.x = this.width * 0.5 - this.deliverybg.width * 0.5 - 10 * this.dpr;
        } else this.deliverybg.visible = true;
        this.leftImg.setFrame("order_ordinary_head_bg");
        this.sendTitle.visible = true;
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        const timeextu = async () => {
            const timeStamp = data.servertime;
            let intervalTime = Math.ceil(data.deliveryDeadline - timeStamp / 1000);
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.visible = true;
            this.calcuTime.setFrameValue(timetext, UIAtlasName.order_new, "order_time_icon");
            this.calcuTime.resetSize();
            this.calcuTime.x = this.width * 0.5 - this.calcuTime.width * 0.5 - 10 * this.dpr;
            this.calcuTime.y = this.height * 0.5 - this.calcuTime.height * 0.5 - 5 * this.dpr;
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);// intervalTime >= 60 ? 60000 : intervalTime * 1000
            else {
                if (this.timeID && this.sendHandler) this.sendHandler.runWith("refreshorder");
                this.timeID = undefined;
            }
        };
        timeextu();
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: DynamicImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new DynamicImageValue(this.scene, 30 * this.dpr, 20 * this.dpr, UIAtlasName.order_new, "order_reward_diamond", this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            // item.setFrameValue(`${reward.count}`, this.key, this.getIconName(reward.display.texturePath) + "_s");
            item.setText(`${reward.count}`);
            item.load(Url.getOsdRes(reward.texturePath));
            item.setTextStyle({ color: "#2154BD" });
            const imageWidth = item.textWidth + 20 * this.dpr;
            item.x = offsetpos + imageWidth * 0.5;
            offsetpos += imageWidth + 5 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 + 0 * this.dpr;
            item.visible = true;
        }
    }

    private rewardState(data: any) {// op_client.IPKT_Quest
        this.leftImg.setFrame("order_ordinary_head_bg");
        this.sendBtn.visible = true;
        this.sendBtn.setInteractive();
        this.sendBtn.setFrameNormal("order_yellow_butt");
        this.sendBtn.setText(i18n.t("order.receive"));
        this.sendBtn.setTextColor("#9A6600");
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: OrderRewardItem;
            if (i < this.orderRewards.length) {
                item = this.orderRewards[i];
            } else {
                item = new OrderRewardItem(this.scene, UIAtlasName.order_new, this.dpr);
                this.add(item);
                this.orderRewards.push(item);
            }
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = -6 * this.dpr;
            item.visible = true;
            item.setItemData(reward);
        }

    }

    private cooldownState(data: any) {// op_client.IPKT_Quest
        this.leftImg.setFrame("order_unknown_head");
        this.headIcon.visible = false;
        this.acceleBtn.visible = true;
        this.acceleBtn.setInteractive();
        this.acceleSpend.visible = true;
        this.calcuTime.visible = true;
        this.calcuTime.y = this.acceleBtn.y + this.acceleBtn.height * 0.5 + 10 * this.dpr;
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        const timeextu = async () => {
            const timeStamp = data.servertime;
            let intervalTime = Math.ceil(data.refreshDeadline - timeStamp / 1000);
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.visible = true;
            this.calcuTime.setFrameValue(timetext, UIAtlasName.order_new, "order_time_icon");
            this.calcuTime.resetSize();
            this.calcuTime.x = this.acceleBtn.x;
            this.acceleSpend.setFrameValue(minute + "", UIAtlasName.order_new, "order_reward_diamond");
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);// intervalTime >= 60 ? 60000 : intervalTime * 1000
            else {
                if (this.timeID && this.sendHandler) this.sendHandler.runWith("refreshorder");
                this.timeID = undefined;
            }
        };
        timeextu();
    }
    private onMaterialHandler(pointer, obj: MaterialItem) {
        if (this.sendHandler) this.sendHandler.runWith(["itemtips", obj]);
    }
    private hideAllElement() {
        this.deleteBtn.visible = false;
        this.deleteBtn.disInteractive();
        this.sendBtn.visible = false;
        this.sendBtn.disInteractive();
        this.sendTitle.visible = false;
        this.acceleBtn.visible = false;
        this.acceleBtn.disInteractive();
        this.acceleSpend.visible = false;
        this.calcuTime.visible = false;
        if (this.deliverybg) this.deliverybg.visible = false;
        for (const item of this.materialItems) {
            item.visible = false;
            item.removeListen();
        }
        for (const item of this.orderRewards) {
            item.visible = false;
        }
        for (const item of this.imageValues) {
            item.visible = false;
        }
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
    }
}
class MaterialItem extends ButtonEventDispatcher {
    public itemData: any;// op_client.ICountablePackageItem
    private bg: Phaser.GameObjects.Image;
    private icon: DynamicImage;
    private value: BBCodeText;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_demand_icon" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = new DynamicImage(scene, 0, -5 * dpr);
        this.icon.setSize(15 * dpr, 15 * dpr);
        this.value = new BBCodeText(this.scene, 0, this.height * 0.5 - 10 * dpr, "60/30", {
            color: "#0",
            fontSize: 8 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0.5);
        this.add([this.bg, this.icon, this.value]);
        this.enable = true;
    }
    public setMaterialData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.itemData = data;
        const url = Url.getOsdRes(data.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleX = 15 * this.dpr / this.icon.displayWidth;
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
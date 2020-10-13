import { BasePanel } from "../Components/BasePanel";
import { UIAtlasKey, UIAtlasName } from "../Ui.atals.name";
import { NineSliceButton, InputText, ClickEvent } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Font } from "../../../utils/font";

export class VerifiedPanel extends BasePanel {
    private mVerifiedBtn: NineSliceButton;
    private mNameInput: InputText;
    private mIDCardInput: InputText;
    private isIDCard = /^[1-9]\d{5}(19|20|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public setVerifiedEnable(val: boolean) {
        if (this.mIDCardInput) {
            this.mNameInput.visible = val;
            this.mIDCardInput.visible = val;
            this.mVerifiedBtn.enable = val;
        }
    }

    protected preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    protected init() {
        const { width, height } = this.scene.cameras.main;
        const mask = this.scene.make.graphics(undefined, false);
        mask.fillStyle(0, 0.6);
        mask.fillRect(-width * 0.5, -height * 0.5, width, height)
            .setInteractive(new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height), Phaser.Geom.Rectangle.Contains);

        const container = this.scene.make.container({  }, false);

        const bg = this.scene.make.image({
            key: UIAtlasKey.common2Key,
            frame: "bg"
        }, false);
        container.setSize(bg.width, bg.height);

        const title_bg = this.scene.make.image({
            y: -16.33 * this.dpr - container.height * 0.5,
            key: UIAtlasKey.common2Key,
            frame: "title"
        }, false).setOrigin(0.5, 0);

        const title = this.scene.make.text({
            y: title_bg.y + 14.67 * this.dpr,
            text: "实名注册",
            style: {
                color: "#905B06",
                fontSize: 16 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0.5, 0);

        this.mNameInput = new InputText(this.scene, 0, 0, 160 * this.dpr, 36 * this.dpr, {
            type: "text",
            placeholder: "请输入真实姓名",
            color: "#838383",
            fontSize: 10 * this.dpr + "px"
        }).setOrigin(0, 0.5);

        this.mIDCardInput = new InputText(this.scene, 0, 0, 160 * this.dpr, 36 * this.dpr, {
            type: "tel",
            maxLength: 18,
            placeholder: "请输入有效身份证号",
            color: "#838383",
            fontSize: 10 * this.dpr + "px"
        }).setOrigin(0, 0.5);

        const nameContainer = this.createInput(this.mNameInput, "*真实姓名：", 0, 0);
        nameContainer.x = -nameContainer.width * 0.5;
        nameContainer.y = 95 * this.dpr + nameContainer.height * 0.5 - container.height * 0.5;
        const idcardContainer = this.createInput(this.mIDCardInput, "*身份证号：", 0, nameContainer.y + nameContainer.height + 15 * this.dpr);
        idcardContainer.x = nameContainer.x;

        const tips = this.scene.make.text({
            y: 40 * this.dpr - container.height * 0.5,
            text: "根据国家新闻出版署发布《关于未成年人沉迷网络\n游戏的通知》规定，网络游戏用户需要使用有效期\n身份证进行实名注册才能体验游戏。",
            style: {
                align: "center",
                fontSize: 10 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#111111"
            }
        }, false).setOrigin(0.5, 0);

        const tips2 = this.scene.make.text({
            y: container.height * 0.5 - 75 * this.dpr,
            text: "请务必保证您的身份信息确实无误，此信息仅作实名认证，我们将严格\n按照有关法律法规妥善保存、保护，不会用做其他用途。",
            style: {
                align: "center",
                fontSize: 8 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#FF0000"
            }
        }, false).setOrigin(0.5, 1);
        this.add([mask, container]);

        this.mVerifiedBtn = new NineSliceButton(this.scene, 0, container.height * 0.5 - 16 * this.dpr, 110 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", "提交认证", this.dpr, this.scale, {
            left: 12 * this.dpr * this.scale,
            top: 12 * this.dpr * this.scale,
            right: 12 * this.dpr * this.scale,
            bottom: 12 * this.dpr * this.scale
        });
        this.mVerifiedBtn.setTextStyle({
            color: "#996600",
            fontSize: 14 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.mVerifiedBtn.on(String(ClickEvent.Down), this.onVerifiedDownHandler, this);
        this.mVerifiedBtn.on(String(ClickEvent.Tap), this.onVerifiedHandler, this);
        this.mVerifiedBtn.y -= this.mVerifiedBtn.height / 2;
        this.mVerifiedBtn.setFontStyle("bold");
        container.add([bg, title_bg, title, nameContainer, idcardContainer, tips, tips2, this.mVerifiedBtn]);
        super.init();

        this.x = width * this.originX;
        this.y = height * this.originY;

        container.y = -this.y * 0.3;
    }

    private onVerifiedHandler() {
        const name = this.mNameInput.text;
        const idCard = this.mIDCardInput.text;
        if (!name) {
            this.emit("error", "[color=#F9361B]名字不能为空[/color]");
            return;
        }
        if (!idCard || idCard.length !== 18) {
            this.emit("error", "[color=#F9361B]证件格式有误[/color]");
            return;
        }
        if (!this.checkIdCard()) {
            this.emit("error", "[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]");
            return;
        }
        this.emit("verified", name, idCard);
    }

    private onVerifiedDownHandler() {
        if (this.mNameInput) {
            this.mNameInput.setBlur();
            this.mIDCardInput.setBlur();
        }
    }

    private createInput(input: InputText, name: string, x: number, y: number) {
        const container = this.scene.make.container({ x, y }, false);
        const text = this.scene.make.text({
            text: name,
            style: {
                color: "#ff0000",
                fontSize: 10 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0, 0.5);
        const boder = this.scene.make.graphics(undefined, false);
        const width = 189 * this.dpr;
        const height = 36.67 * this.dpr;
        boder.fillStyle(0xDDDDDD);
        boder.lineStyle(2 * this.dpr, 0xA1A1A1);
        boder.fillRoundedRect(text.width, -height * 0.5, width, height, 2 * this.dpr);

        input.x = text.width + 10 * this.dpr;
        container.add([text, boder, input]);
        container.setSize(width + input.x, height);
        return container;
    }

    private checkIdCard(): boolean {
        // var city:Object = {11:"北京", 12:"天津", 13:"河北", 14:"山西", 15:"内蒙古", 21:"辽宁", 22:"吉林", 23:"黑龙江 ", 31:"上海", 32:"江苏", 33:"浙江", 34:"安徽", 35:"福建", 36:"江西", 37:"山东", 41:"河南", 42:"湖北 ", 43:"湖南", 44:"广东", 45:"广西", 46:"海南", 50:"重庆", 51:"四川", 52:"贵州", 53:"云南", 54:"西藏 ", 61:"陕西", 62:"甘肃", 63:"青海", 64:"宁夏", 65:"新疆", 71:"台湾", 81:"香港", 82:"澳门", 91:"国外 "};
        const code = this.mIDCardInput.text;
        if (this.isIDCard.test(code)) {
            if (code.length === 18) {
                const codeAry = code.split("");
                // ∑(ai×Wi)(mod 11)
                // 加权因子
                const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                // 校验位
                const parity = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
                let sum = 0;
                let ai = 0;
                let wi = 0;
                for (let i = 0; i < 17; i++ ) {
                    ai = codeAry[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                if (parity[sum % 11] !== codeAry[17].toLocaleUpperCase()) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    get verifiedBtn(): NineSliceButton {
        return this.mVerifiedBtn;
    }
}

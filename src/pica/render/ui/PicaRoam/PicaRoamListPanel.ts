import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaRoamListPanel extends Phaser.GameObjects.Container {
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private poolsStatus: Map<string, op_client.IDRAW_POOL_STATUS[]> = new Map();
    private dpr: number;
    private zoom: number;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
        this.mGameGrid.resetMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        const conWdith = 340 * this.dpr;
        const conHeight = 455 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.content.setInteractive();
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasName.uicommon1, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon1, frame: "title" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY + 3 * this.dpr;
        this.titleTex = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("roam.title"), style: UIHelper.titleYellowStyle_m(this.dpr) }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.setResolution(this.dpr);
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close", "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5, -this.bg.height * 0.5 + this.dpr * 5);
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        const tableConfig = {
            x: 0,
            y: 10 * this.dpr,
            table: {
                width: conWdith - 10 * this.dpr,
                height: conHeight - 50 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 10 * this.dpr,
                cellHeight: 120 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new RoamItem(this.scene, this.dpr, this.zoom);
                }
                cellContainer.setRoamData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell.roamData);
        });
        this.content.add([this.bg, this.titlebg, this.titleTex, this.closeBtn, this.mGameGrid]);
        this.resize();
    }

    public setRoamDataList(datas: op_client.IDRAW_POOL_STATUS[]) {
        this.poolsStatus.clear();
        for (const data of datas) {
            if (this.poolsStatus.has(data.tokenId)) {
                const tempArr = this.poolsStatus.get(data.tokenId);
                tempArr.push(data);
            } else {
                const tempArr = [data];
                this.poolsStatus.set(data.tokenId, tempArr);
            }
        }
        const tempDatas = [];
        this.poolsStatus.forEach((value) => {
            tempDatas.push(value[0]);
        });
        this.mGameGrid.setItems(tempDatas);
        this.mGameGrid.setT(0);
    }

    private onSelectItemHandler(roamData: op_client.IDRAW_POOL_STATUS) {
        if (this.send) this.send.runWith(["roam", this.poolsStatus.get(roamData.tokenId)]);
    }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }

}

class RoamItem extends Phaser.GameObjects.Container {
    private roamData: op_client.IDRAW_POOL_STATUS;
    private dpr: number;
    private zoom: number;
    private bg: NineSlicePatch;
    private dybg: DynamicImage;
    private nameTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private timebg: NineSlicePatch;
    private timetips: Phaser.GameObjects.Text;
    private timeTex: BBCodeText;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(302 * dpr, 110 * dpr);
        this.bg = new NineSlicePatch(scene, 0, 0, this.width, this.height, UIAtlasName.roam, "roam_list_bg", {
            left: 7 * dpr, top: 0, right: 7 * dpr, bottom: 0
        });
        this.dybg = new DynamicImage(scene, 0, 0);
        this.nameTex = this.scene.make.text({
            x: this.width * 0.5 - 20 * dpr, y: -20 * dpr, text: "",
            style: UIHelper.colorStyle("#1F95F8", 22 * dpr)
        }).setOrigin(1, 0.5);
        this.nameTex.setPadding(0, 0, 3 * dpr, 0);
        this.nameTex.setFontStyle("bold italic");
        this.nameTex.setStroke("#ffffff", 2 * dpr);

        this.desTex = this.scene.make.text({
            x: this.width * 0.5 - 10 * dpr, y: 10 * dpr, text: "",
            style: UIHelper.colorStyle("#FFFD50", 22 * dpr)
        }).setOrigin(0.5);
        this.desTex.setPadding(0, 0, 3 * dpr, 0);
        this.desTex.setFontStyle("bold italic");
        const gradient = this.desTex.context.createLinearGradient(0, 0, 0, this.desTex.height);
        gradient.addColorStop(0, "#FFFD50");
        gradient.addColorStop(1, "#FAB600");
        this.desTex.setFill(gradient);
        this.timebg = new NineSlicePatch(this.scene, 0, 0, 84 * dpr, 32 * dpr, UIAtlasName.roam, "roam_countbg", {
            left: 3 * dpr, top: 0, right: 3 * dpr, bottom: 0
        }, 0);
        this.timetips = this.scene.make.text({ text: i18n.t("roam.timeendtips"), style: UIHelper.whiteStyle(dpr, 11) }).setOrigin(0.5);
        this.timeTex = new BBCodeText(this.scene, 0, 0, "", UIHelper.blackStyle(dpr, 8)).setOrigin(0.5);
        (<any>(this.timeTex)).setPadding(3 * dpr, 3 * dpr, 3 * dpr, 0);
        this.timebg.x = -this.width * 0.5 + this.timebg.width * 0.5 + 3 * dpr;
        this.timebg.y = this.height * 0.5 - this.timebg.height * 0.5 - 5 * dpr;
        this.timetips.x = this.timebg.x;
        this.timetips.y = this.timebg.y - 8 * dpr;
        this.timeTex.x = this.timebg.x;
        this.timeTex.y = this.timebg.y + 10 * dpr;
        this.add([this.bg, this.dybg, this.nameTex, this.desTex, this.timebg, this.timetips, this.timeTex]);
        this.desTex.visible = false;
        this.nameTex.visible = false;
    }
    public setRoamData(data: op_client.IDRAW_POOL_STATUS) {
        this.roamData = data;
        // this.desTex.text = "欢乐大礼包等你拿";
        // this.nameTex.text = "皮卡速递";

        if (data.tokenId === "IV0000002") {
            this.dybg.setTexture(UIAtlasName.roam, "roan_banner_diamond");
            const time = 604800000;
            this.timeTex.text = this.getTimeTex(time);
            this.loopTimeOut(time);
            this.timeTex["visible"] = true;
            this.timebg.visible = true;
        } else {
            this.dybg.setTexture(UIAtlasName.roam, "roan_banner_silver");
            this.timeTex["visible"] = false;
            this.timebg.visible = false;
        }
    }

    private loopTimeOut(time: number) {
        const excute = () => {
            setTimeout(() => {
                if (!this.scene) return;
                time -= 60000;
                if (time < 0) time = 0;
                this.timeTex.text = this.getTimeTex(time);
                if (time > 0) {
                    excute();
                }
            }, 60000);
        };
        excute();
    }

    private getTimeTex(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minutes = Math.floor(time / 60000) % 60;
        let text: string = "";
        if (day !== 0 || hour !== 0 || minutes !== 0) {
            text = this.timeFormat(day) + i18n.t("timeuint.day") + this.timeFormat(hour) + i18n.t("timeuint.hour") + this.timeFormat(minutes) + i18n.t("timeuint.minutes");
        } else {
            text = i18n.t("roam.timeend");
        }
        return text;
    }
    private timeFormat(time: number) {
        return `[color=#724DF4][size=${14 * this.dpr}][b]${time}[/b][/size][/color]`;
    }
}

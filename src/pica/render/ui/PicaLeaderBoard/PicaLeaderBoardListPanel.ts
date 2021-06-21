import { ClickEvent } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, GridLayoutGroup } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper } from "utils";
import { UITools } from "../uitool";
import { MainUIRedType } from "picaStructure";
export class PicaLeaderBoardListPanel extends Phaser.GameObjects.Container {
    private backButton: ButtonEventDispatcher;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private gridLayout: GridLayoutGroup;
    private redMap: Map<number, Phaser.GameObjects.Image> = new Map();
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
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 - 5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("leaderboard.title"));
        const conWidth = 323 * this.dpr, conHeight = 330 * this.dpr;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(322 * this.dpr, 74 * this.dpr),
            space: new Phaser.Math.Vector2(0, 9 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add([this.gridLayout, this.backButton]);
        this.resize();
    }

    public setListData() {
        const datas = this.getListData();
        for (const data of datas) {
            const item = new RankingItem(this.scene, 322 * this.dpr, 74 * this.dpr, this.dpr, this.zoom);
            item.setDisplayData(data);
            this.gridLayout.add(item);
            if (data.redType) {
                const img = UITools.creatRedImge(this.scene, item);
                this.redMap.set(data.redType, img);
            }
        }
        this.gridLayout.Layout();
        // this.gridLayout.removeAll();
    }
    setRedsState(reds: number[]) {
        this.redMap.forEach((value, key) => {
            value.visible = reds.indexOf(key) !== -1;
        });
    }
    private getListData() {
        const send = new Handler(this, this.onSelectItemHandler);
        const temp1: RankingItemData = {
            bg: "leaderboard_entrance_bg_1",
            left: "leaderboard_entrance_npc_1",
            textLeaderBoardName: i18n.t("leaderboard.cook"),
            text: i18n.t("leaderboard.cookleaderboard"),
            textColor: "#FFFFFF",
            send,
            tag: "cook",
            redType: MainUIRedType.GALLERY,

        };
        const temp2: RankingItemData = {
            bg: "leaderboard_entrance_bg_2",
            left: "leaderboard_entrance_npc_2",
            textLeaderBoardName: i18n.t("leaderboard.fuben"),
            text: i18n.t("leaderboard.fubenleaderboard"),
            textColor: "#FFFFFF",
            send,
            tag: "fuben"
        };
        const temp3: RankingItemData = {
            bg: "leaderboard_entrance_bg_3",
            left: "leaderboard_entrance_npc_3",
            textLeaderBoardName: i18n.t("leaderboard.guanqia"),
            text: i18n.t("leaderboard.guanqialeaderboard"),
            textColor: "#FFFFFF",
            send,
            tag: "guanqia"
        };
        const temp4: RankingItemData = {
            bg: "leaderboard_entrance_bg_4",
            left: "leaderboard_entrance_npc_4",
            textLeaderBoardName: i18n.t("leaderboard.activity"),
            text: i18n.t("leaderboard.activityleaderboard"),
            textColor: "#FFFFFF",
            send,
            tag: "activity"
        };
        const datas = [temp1, temp2, temp3, temp4];
        return datas;
    }

    private onSelectItemHandler(tag: string) {
        if (this.send) this.send.runWith(tag);
    }
    private onBackHandler() {
        if (this.send) this.send.runWith("back");
    }
}

class RankingItem extends ButtonEventDispatcher {
    private bg: Phaser.GameObjects.Image;
    private leftImg: Phaser.GameObjects.Image;
    private textLeaderBoardName: Phaser.GameObjects.Text;
    private textTex: Phaser.GameObjects.Text;
    private tag: string;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_entrance_bg_1" });
        this.leftImg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_entrance_npc_1" });
        this.textLeaderBoardName = this.scene.make.text({ style: UIHelper.colorStyle("#FFFFFF", 16 * dpr) }).setOrigin(0.5);
        this.textTex = this.scene.make.text({ style: UIHelper.colorStyle("#FFFFFF", 12 * dpr) }).setOrigin(0.5);
        this.add([this.bg, this.leftImg, this.textLeaderBoardName, this.textTex]);
        this.on(ClickEvent.Tap, this.onClickHandler, this);
        this.enable = true;
    }

    public setDisplayData(data: RankingItemData) {
        this.bg.setFrame(data.bg);
        this.leftImg.setFrame(data.left);
        this.textLeaderBoardName.setText(data.textLeaderBoardName);
        this.textTex.setText(data.text);
        this.textLeaderBoardName.setColor(data.textColor);
        this.textTex.setColor(data.textColor);
        this.tag = data.tag;
        this.send = data.send;
        this.leftImg.x = -this.width * 0.5 + this.leftImg.width * 0.5 + 12 * this.dpr;
        this.leftImg.y = this.height * 0.5 - this.leftImg.height * 0.5;
        this.textLeaderBoardName.x = -this.width * 0.5 + this.textLeaderBoardName.width * 0.5 + 71 * this.dpr;
        this.textLeaderBoardName.y = -this.height * 0.5 + this.textLeaderBoardName.height * 0.5 + 20 * this.dpr;
        this.textTex.x = -this.width * 0.5 + this.textTex.width * 0.5 + 71 * this.dpr;
        this.textTex.y = -this.height * 0.5 + this.textTex.height * 0.5 + 42 * this.dpr;
    }
    private onClickHandler() {
        if (this.send) this.send.runWith(this.tag);
    }
}

interface RankingItemData {
    bg: string;
    left: string;
    textLeaderBoardName: string;
    text: string;
    textColor: string;
    tag: string;
    send: Handler;
    redType?: number;
}

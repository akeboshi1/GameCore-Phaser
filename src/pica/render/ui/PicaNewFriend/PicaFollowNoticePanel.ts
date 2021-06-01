import { GameGridTable } from "apowophaserui";
import { Handler, i18n, UIHelper } from "utils";
import { op_client } from "pixelpai_proto";
import { UITools } from "picaRender";
import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
export class PicaFollowNoticePanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private backButton: ButtonEventDispatcher;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("friendlist.follow_notice"));
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 + 15 * this.dpr;
        this.backButton.y = -this.height * 0.5 + this.backButton.height * 0.5 + 30 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 82 * this.dpr,
            table: {
                width: this.width,
                height: this.height - 5 * this.dpr,
                columns: 1,
                cellWidth: this.width,
                cellHeight: 75 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaFollowNoticeItem(this.scene, 280 * this.dpr, 48 * this.dpr, this.dpr);
                }
                cellContainer.setItemData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setPlayerDatas(content: any) {
        this.mGameGrid.setItems(content);
    }
    private onGridTableHandler(item: PicaFollowNoticeItem) {
        if (this.sendHandler) this.sendHandler.runWith(["enter", item]);
    }

    private onBackHandler() {

    }

}
export class PicaFollowNoticeItem extends Phaser.GameObjects.Container {
    protected bg: Phaser.GameObjects.Image;
    protected noticeImg: Phaser.GameObjects.Image;
    protected contentTex: Phaser.GameObjects.Text;
    protected dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.init();

    }
    public setNoticeData(data: any) {
        this.contentTex.text = "";
    }
    protected init() {
        this.bg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_notice_list_bg" });
        this.noticeImg = this.scene.make.image({ key: UIAtlasName.friend_new, frame: "friend_notice_icon" });
        this.contentTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0, 0.5);
        this.add([this.bg, this.noticeImg, this.contentTex]);
        this.layout();
    }
    protected layout() {
        this.noticeImg.x = -this.width * 0.5 + this.noticeImg.width * 0.5 + 10 * this.dpr;
        this.contentTex.x = this.noticeImg.x + this.noticeImg.width * 0.5 + 8 * this.dpr;
    }
}

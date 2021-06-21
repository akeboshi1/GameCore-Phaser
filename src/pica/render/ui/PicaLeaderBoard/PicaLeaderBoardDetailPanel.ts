import { Button, ClickEvent, GameScroller } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { UITools } from "..";
export class PicaLeaderBoardDetailPanel extends Phaser.GameObjects.Container {
    private mBackground: Phaser.GameObjects.Graphics;
    private topBg: Phaser.GameObjects.Graphics;
    private backButton: ButtonEventDispatcher;
    private tipsButton: Button;
    private myRanking: LeaderBoardCell;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private countDown: Phaser.GameObjects.Text;
    private rankText: Phaser.GameObjects.Text;
    private playerText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;

    private gameScroller: GameScroller;
    private backBtnTag: string;

    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    /**
     * @param titleName 返回按钮的文本
     * @param backOrClose "back"or"close"对应返回到list面板或直接退出
     */
    public setTitle(titleName: string, backOrClose: string) {

        this.backBtnTag = backOrClose;
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackBtnHandler, this, titleName);
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 - 5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
        // this.backButton.on(ClickEvent.Tap, this.onBackBtnHandler, backOrClose);
        this.add(this.backButton);
    }
    public setMyRanking(content, avatars?) {
        this.myRanking.setDisplayData(content);
        if (avatars) {
            for (const avatar of avatars) {
                // 找到我的头像
                if (this.myRanking.rankListData.platformId === avatar._id) {
                    this.myRanking.setPlayerData(avatar);
                }
            }
            // Test
            // this.myRanking.setPlayerData(avatars[0]);
        }
        this.myRanking.setLayout();
    }
    public createRankListCells(ranklistData: any[], avatars?) {
        this.gameScroller.clearItems(true);
        if (ranklistData.length === 0) {
            this.gameScroller.visible = false;
        }
        this.gameScroller.visible = true;
        const indexed: number = 0;
        // const mailitems = <PicaMailItem[]>this.gameScroller.getItemList();
        const createMails = () => {
            for (let i = 0; i < ranklistData.length; i++) {
                let item: LeaderBoardCell;
                const curIndexed = indexed + i;
                const data = ranklistData[curIndexed];
                item = new LeaderBoardCell(this.scene, 306 * this.dpr, 66 * this.dpr, this.dpr, this.zoom, 1);
                item.setDisplayData(data);
                if (avatars) {
                    for (const avatar of avatars) {
                        if (item.rankListData.platformId === avatar._id) {
                            item.setPlayerData(avatar);
                        }
                    }
                    // item.setPlayerData(avatars[0]);
                }
                item.setLayout();
                // item.setHandler(new Handler(this, this.onMailItemHandler));
                this.gameScroller.addItem(item);
                item.visible = true;
                item.alpha = 1;
                item.x = 0;
            }
            this.gameScroller.Sort(true);
        };
        createMails();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.myRanking.x = 0 * this.dpr;
        this.myRanking.y = -this.height * 0.5 + this.myRanking.height * 0.5 + 70 * this.dpr;
        // this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 - 5 * this.dpr;
        // this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
        this.setSize(w, h);
    }
    refreshMask() {
        this.gameScroller.refreshMask();
    }
    setHandler(send: Handler) {
        this.send = send;
    }
    init() {
        this.myRanking = new LeaderBoardCell(this.scene, 323 * this.dpr, 78 * this.dpr, this.dpr, this.zoom, 0);

        this.myRanking.x = 0 * this.dpr;
        this.myRanking.y = -this.height * 0.5 + this.myRanking.height * 0.5 + 70 * this.dpr;
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.clear();
        this.mBackground.fillStyle(0xA1A1A1, 1);
        this.mBackground.fillRect(-this.myRanking.width * 0.5 + 8 * this.dpr, -this.height * 0.5 + 139 * this.dpr, this.myRanking.width - 8 * 2 * this.dpr, this.height - 139 * this.dpr);
        // this.myRanking2 = new LeaderBoardCell(this.scene, 306 * this.dpr, 66 * this.dpr, this.dpr, this.zoom, 1);
        // this.myRanking2.x = 0;
        // this.myRanking2.y = -this.height * 0.5 + this.myRanking.height * 0.5 + 175 * this.dpr;
        this.topBg = this.scene.make.graphics(undefined, false);
        this.topBg.clear();
        this.topBg.fillStyle(0xFFFFFF, 1);
        this.topBg.fillRect(-this.myRanking.width * 0.5 + 8 * this.dpr, -this.height * 0.5 + 139 * this.dpr, this.myRanking.width - 8 * 2 * this.dpr, 36 * this.dpr);
        this.rankText = this.scene.make.text({ x: -this.myRanking.width * 0.5 + 25 * this.dpr, y: -this.height * 0.5 + 162 * this.dpr, text: i18n.t("leaderboard.rank"), style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0, 0.5);
        this.playerText = this.scene.make.text({ x: this.rankText.x + 96 * this.dpr, y: this.rankText.y, text: i18n.t("leaderboard.name"), style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0, 0.5);
        this.scoreText = this.scene.make.text({ x: this.playerText.x + 135 * this.dpr, y: this.rankText.y, text: i18n.t("leaderboard.score"), style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0, 0.5);
        this.add([this.myRanking, this.mBackground, this.topBg, this.rankText, this.playerText, this.scoreText]);

        // this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, "***排行榜");
        // this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 - 5 * this.dpr;
        // this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
        // this.backButton.on(ClickEvent.Tap, this.onBackHandler, this);
        this.tipsButton = new Button(this.scene, UIAtlasName.uicommon1, "icon_tips");
        this.tipsButton.setPosition(-this.width * 0.5 + this.dpr * 325 + this.tipsButton.width * 0.5, -this.height * 0.5 + this.dpr * 46 + this.tipsButton.height * 0.5);
        this.tipsButton.on(ClickEvent.Tap, this.onTipsHandler, this);
        this.countDown = this.scene.make.text({ style: UIHelper.colorStyle("#FFFFFF", 10 * this.dpr) }).setOrigin(0.5);
        this.countDown.setSize(111 * this.dpr, 10 * this.dpr);
        this.countDown.setAlign("center");
        this.countDown.setText("赛季倒计时：00天00小时");
        this.countDown.x = -this.width * 0.5 + 202 * this.dpr + this.countDown.width * 0.5;
        // this.countDown.y = -this.height * 0.5 + this.dpr * 50 + this.countDown.height * 0.5;
        this.countDown.y = this.tipsButton.y;

        this.add([this.tipsButton, this.countDown]);
        this.gameScroller = new GameScroller(this.scene, {
            x: 0 * this.dpr,
            y: this.height * 0.5 - (this.height - 174 * this.dpr) * 0.5,
            width: this.width - 27 * 2 * this.dpr,
            height: this.height - 174 * this.dpr,
            // x: 0,
            // y: this.myRanking.y+this.myRanking.height*0.5,
            // width: this.width,
            // height: this.height,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 1 * this.dpr,
            padding: { top: 2 * this.dpr },
            selfevent: true,
            // cellupCallBack: (gameobject) => {
            //     this.onPointerUpHandler(gameobject);
            // },
            // valuechangeCallback: (value: number) => {
            //     this.refreshMailIem();
            // }
        });
        this.add(this.gameScroller);
        this.resize();
    }
    // protected createOptionButtons() {
    //     const arr = [{ text: i18n.t("illustrate.title"), type: 1 }, { text: i18n.t("illustrate.collect"), type: 2 }];
    //     const allLin = 120 * this.dpr;
    //     const cellwidth = allLin / arr.length;
    //     const cellHeight = 20 * this.dpr;
    //     let posx = -allLin / 2;
    //     // tslint:disable-next-line:prefer-for-of
    //     for (let i = 0; i < arr.length; i++) {
    //         const data = arr[i];
    //         const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text, UIHelper.colorStyle("#ffffff", 14 * this.dpr));
    //         item.x = posx + cellwidth * 0.5;
    //         item.setData("item", data.type);
    //         item.setSize(cellwidth, cellHeight);
    //         item.setChangeColor("#FFF449");
    //         item.setNormalColor("#ffffff");
    //         item.setFontStyle("bold");
    //         posx += cellwidth;
    //     }
    // }

    private onTipsHandler() {
        if (this.send) this.send.runWith("showTips");
    }
    private onBackBtnHandler() {
        if (this.send) this.send.runWith(this.backBtnTag);
    }

}
class LeaderBoardCell extends Phaser.GameObjects.Container {
    public rankListData: any;
    public playerData: any;
    private text: Phaser.GameObjects.Text;
    private myBg: Phaser.GameObjects.Image;
    private ranking: Phaser.GameObjects.Image;
    private rankingText: Phaser.GameObjects.Text;
    private headPhotoBg: Phaser.GameObjects.Image;
    private headPhotoImg: Phaser.GameObjects.Image;
    private nickName: Phaser.GameObjects.Text;
    private sign: Phaser.GameObjects.Text;
    private score: Phaser.GameObjects.Text;
    private headicon: DynamicImage;

    private tag: string;
    private send: Handler;
    private dpr: number;
    private zoom: number;
    private layoutStyle: number;
    private ranklistBg: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number, style: number) {
        super(scene, 0, 0);
        this.setSize(width, height);
        // this.width=width;
        // this.height=height;
        this.dpr = dpr;
        this.zoom = zoom;
        this.layoutStyle = style;
        if (this.layoutStyle === 0) {
            this.myBg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_bg_top" });
            this.headPhotoBg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_head_myself_bg" });
            this.text = this.scene.make.text({ style: UIHelper.colorStyle("#FFFC00", 10 * this.dpr) }).setOrigin(0.5);
            this.text.setText("我的排名");
            this.rankingText = this.scene.make.text({ style: UIHelper.colorStyle("#FFFC00", 20 * this.dpr) }).setOrigin(0.5);
            this.rankingText.setText("1");
            this.add([this.myBg, this.text]);
        } else if (this.layoutStyle === 1) {
            this.myBg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_myself_bg" });
            this.headPhotoBg = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_head_bg" });
            this.ranklistBg = this.scene.make.graphics(undefined, false);
            this.ranklistBg.clear();
            this.ranklistBg.fillStyle(0xFFFFFF);
            this.ranklistBg.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
            this.rankingText = this.scene.make.text({ style: UIHelper.colorStyle("#000000", 20 * this.dpr) }).setOrigin(0.5);
            this.rankingText.setText("1");
            // this.ranking = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_bg_top" });
            this.add([this.ranklistBg, this.myBg]);// , this.ranklistBg
        }
        this.nickName = this.scene.make.text({ style: UIHelper.colorStyle("#FFFC00", 12 * this.dpr) }).setOrigin(0.5);
        this.nickName.setText("用户昵称七个字");
        this.nickName.setSize(87, 12);
        this.sign = this.scene.make.text({ style: UIHelper.colorStyle("#FFFFFF", 10 * this.dpr) }).setOrigin(0.5);
        this.nickName.setText("个性签名");
        this.score = this.scene.make.text({ style: UIHelper.colorStyle("#FFFC00", 16 * this.dpr) }).setOrigin(0.5);
        this.score.setText("00000");
        this.add([this.headPhotoBg, this.nickName, this.sign, this.score, this.rankingText]);
        // 如果后面要改为可点击的样式就要继承eventpitch..
        // this.on(ClickEvent.Tap, this.onClickHandler, this);
        // this.enable = true;
        // this.setStyle(style);
        this.headicon = new DynamicImage(this.scene, 0, 0);
        this.headicon.visible = false;
        this.add(this.headicon);
    }

    public setPlayerData(data: any) {
        this.playerData = data;
        const gender = UITools.getGenderFrame(data.gender);
        this.headicon.visible = false;
        if (this.playerData.avatar) {
            const url = Url.getOsdRes(this.playerData.avatar);
            this.headicon.load(url, this, () => {
                // this.headicon.x = -this.width * 0.5 + this.headicon.displayWidth * 0.5 + 10 * this.dpr;
                // this.headicon.x=0;
                this.headicon.visible = true;
            });
        }
    }
    /**
     * 设置文本数据  设置顶部玩家自己的数据时只有rank和score
     * @param data      {
     *                      "rank": 1,
     *                      "platformId": "60bde1d4f0da9b0e7ce1307a",
     *                      "nickname": "player1",
     *                      "score": 99999
     *                  },
     */
    public setDisplayData(data: any) {
        this.rankListData = data;
        if (this.layoutStyle === 0) {
            this.sign.setStyle(UIHelper.colorStyle("#FFFFFF", 10 * this.dpr));
            if (data.rank === 0) {
                this.rankingText.setText("未入榜");
                this.rankingText.setAlign("center");
                this.rankingText.setStyle(UIHelper.colorStyle("#FFFC00", 12 * this.dpr));
            } else {
                this.rankingText.setText(data.rank);
            }
            this.score.setText(data.score);
            this.nickName.setText(data.nickname);
            this.sign.setText("我的签名");
            this.setLayout();
            // TODo
            // this.headPhotoImg=this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_head_myself" });
        } else if (this.layoutStyle === 1) {
            if (data.platformId === "0") {// TODO 如果id是我的，背景发生变化
                this.remove(this.ranklistBg);
            } else {
                this.remove(this.myBg);
            }
            if (data.rank <= 3) {
                if (data.rank === 1) {
                    this.ranking = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_1" });
                    this.nickName.setStyle(UIHelper.colorStyle("#DE4649", 12 * this.dpr));
                    this.score.setStyle(UIHelper.colorStyle("#DE4649", 16 * this.dpr));
                } else if (data.rank === 2) {
                    this.ranking = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_2" });
                    this.nickName.setStyle(UIHelper.colorStyle("#F3B617", 12 * this.dpr));
                    this.score.setStyle(UIHelper.colorStyle("#F3B617", 16 * this.dpr));

                } else if (data.rank === 3) {
                    this.ranking = this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_3" });
                    this.nickName.setStyle(UIHelper.colorStyle("#3DA0FE", 12 * this.dpr));
                    this.score.setStyle(UIHelper.colorStyle("#3DA0FE", 16 * this.dpr));
                }
                this.remove(this.rankingText);
                this.add(this.ranking);
                this.ranking.x = -this.width * 0.5 + this.ranking.width * 0.5 + 10 * this.dpr;
                this.ranking.y = -this.height * 0.5 + this.ranking.height * 0.5 + 12 * this.dpr;
            } else {
                this.remove(this.ranking);
                this.add(this.rankingText);
                // this.rankingText.setText(data.rank);
                this.rankingText.setText(data.rank);
                this.rankingText.x = -this.width * 0.5 + this.rankingText.width * 0.5 + 18 * this.dpr;
                this.rankingText.y = -this.height * 0.5 + this.rankingText.height * 0.5 + 26 * this.dpr;
                this.nickName.setStyle(UIHelper.colorStyle("#333333", 12 * this.dpr));
                this.score.setStyle(UIHelper.colorStyle("#000000", 16 * this.dpr));
            }
            this.sign.setStyle(UIHelper.colorStyle("#9CA5B1", 10 * this.dpr));
            this.nickName.setText(data.nickname);
            this.sign.setText("签名");
            // this.headPhotoImg=this.scene.make.image({ key: UIAtlasName.leader_board, frame: "leaderboard_rank_head" });
            this.score.setText(data.score);
        }
        // this.setLayout();
    }
    /**
     * 控制此物件的内部的元素位置布局
     * 当参数为0时用来显示独立的排行榜最前面的我的排名
     * 当参数为1时当作排行榜的一个小单元
     */
    public setLayout() {
        if (this.layoutStyle === 0) {
            // this.bg
            this.text.x = -this.width * 0.5 + this.text.width * 0.5 + 16 * this.dpr;
            this.text.y = -this.height * 0.5 + this.text.height * 0.5 + 41 * this.dpr;
            this.rankingText.x = -this.width * 0.5 + 35 * this.dpr;
            this.rankingText.y = -this.height * 0.5 + this.rankingText.height * 0.5 + 18 * this.dpr;
            this.headPhotoBg.x = -this.width * 0.5 + 92 * this.dpr;
            this.headPhotoBg.y = -this.height * 0.5 + this.headPhotoBg.height * 0.5 + 11 * this.dpr;
            this.headicon.x = -this.width * 0.5 + 91 * this.dpr;
            this.headicon.y = -3 * this.dpr;
            this.headicon.scale = this.dpr * 0.75;
            this.nickName.x = -this.width * 0.5 + this.nickName.width * 0.5 + 122 * this.dpr;
            this.nickName.y = -this.height * 0.5 + this.nickName.height * 0.5 + 21 * this.dpr;
            this.sign.x = -this.width * 0.5 + 122 * this.dpr + this.sign.width * 0.5;
            this.sign.y = -this.height * 0.5 + 41 * this.dpr + this.sign.height * 0.5;
            this.score.x = -this.width * 0.5 + 275 * this.dpr;
            this.score.y = -this.height * 0.5 + 33 * this.dpr;

        } else if (this.layoutStyle === 1) {
            // this.ranklistBg
            // this.bg
            // this.ranking.x = -this.width * 0.5 + this.ranking.width * 0.5 + 10 * this.dpr;
            // this.ranking.y = -this.height * 0.5 + this.ranking.height * 0.5 + 12 * this.dpr;
            // this.rankingText.x = -this.width * 0.5 + this.rankingText.width*0.5+18 * this.dpr;
            // this.rankingText.y = -this.height * 0.5 + 35 * this.dpr;
            this.headPhotoBg.x = -this.width * 0.5 + 70 * this.dpr;
            this.headPhotoBg.y = -this.height * 0.5 + this.headPhotoBg.height * 0.5 + 14 * this.dpr;
            this.headicon.x = -this.width * 0.5 + 70 * this.dpr;
            this.headicon.y = 2 * this.dpr;
            this.headicon.scale = this.dpr * 0.65;
            this.nickName.x = -this.width * 0.5 + this.nickName.width * 0.5 + 96 * this.dpr;
            this.nickName.y = -this.height * 0.5 + this.nickName.height * 0.5 + 23 * this.dpr;
            this.sign.x = -this.width * 0.5 + 97 * this.dpr + this.sign.width * 0.5;
            this.sign.y = -this.height * 0.5 + 41 * this.dpr + this.sign.height * 0.5;
            this.score.x = -this.width * 0.5 + 257 * this.dpr;
            this.score.y = -this.height * 0.5 + 34 * this.dpr;
        }
    }
    private onClickHandler() {
        if (this.send) this.send.runWith(this.tag);
    }
}

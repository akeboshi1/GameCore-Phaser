import { GameScroller, NineSlicePatch } from "apowophaserui";
import { DynamicImage, ProgressThreeMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font } from "utils";

export class PicaTaskMainPanel extends Phaser.GameObjects.Container {
    private gameScroller: GameScroller;
    private dpr: number;
    private zoom: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
    }

    refreshMask() {
        this.gameScroller.refreshMask();
    }
    protected init() {
        this.gameScroller = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 0,
            space: 10 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        this.add(this.gameScroller);
    }

    private onPointerUpHandler(gameobject) {
    }
}

class MainTaskItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private titleCon: Phaser.GameObjects.Container;
    private titleTex: Phaser.GameObjects.Text;
    private taskDes: Phaser.GameObjects.Text;
    private progress: ProgressThreeMaskBar;
    private progressTex: Phaser.GameObjects.Text;
    private rewardsImg: DynamicImage;
    private rewardRotateImg: Phaser.GameObjects.Image;
    private bg: NineSlicePatch;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
    }

    protected init() {
        this.bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasName.uicommon, "task_chapter_bg", {
            left: 8 * this.dpr, top: 8 * this.dpr, right: 8 * this.dpr, bottom: 8 * this.dpr
        });
        this.titleCon = this.scene.make.container(undefined, false);
        this.titleCon.y = 15 * this.dpr;
        const leftTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_left" });
        leftTitleBg.x = -56 * this.dpr;
        const rightTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_right" });
        rightTitleBg.x = -56 * this.dpr;
        const middleTitleBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_title_middle" });
        this.titleTex = this.scene.make.text({
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#FFF6CA"
            }
        });
        this.titleTex.setFontStyle("bold");
        this.titleCon.add([leftTitleBg, middleTitleBg, rightTitleBg, this.titleTex]);
        this.taskDes = this.scene.make.text({
            x: -this.width * 0.5 + 10 * this.dpr,
            y: -10 * this.dpr,
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#8C6003"
            }
        }).setOrigin(0);
        this.taskDes.setWordWrapWidth(151 * this.dpr, false);
        const rewardbg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_gift_bg" });
        rewardbg.x = this.width * 0.5 - 10 * this.dpr - rewardbg.width * 0.5;
        rewardbg.y = 20 * this.dpr;
        this.rewardRotateImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_chapter_gift_bg1" });
        this.rewardRotateImg.x = rewardbg.x;
        this.rewardsImg.y = rewardbg.y;
        this.rewardsImg = new DynamicImage(this.scene, 0, 0);
        this.rewardsImg.x = rewardbg.x;
        this.rewardsImg.y = rewardbg.y;
        const config = { width: 153 * this.dpr, height: 11 * this.dpr };
        this.progress = new ProgressThreeMaskBar(this.scene, UIAtlasName.uicommon, [], [], undefined, config, config);
        this.progress.x = -this.width * 0.5 + this.progress.width * 0.5 + 15 * this.dpr;
        this.progress.y = 20 * this.dpr;
        this.progressTex = this.scene.make.text({
            x: this.progress.y,
            y: this.progress.y + 10 * this.dpr,
            text: "", style: {
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#794400"
            }
        }).setOrigin(0.5);

        this.add([this.bg, this.titleCon, this.taskDes, this.progress, this.progressTex, rewardbg, this.rewardRotateImg, this.rewardsImg]);
    }
}

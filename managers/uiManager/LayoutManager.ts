/**
 * 自动布局和视窗同步管理器
 * author aaron
 */
import Game = Phaser.Game;
import BaseSingleton from "../../base/BaseSingleton";
import {IAutoLayout} from "./interface/IAutoLayout";

export class LayoutManager extends BaseSingleton {
    public game: Game;
    public layoutList: Array<IAutoLayout>;

    public constructor() {
        super();
        this.layoutList = Array<IAutoLayout>();
    }

    public init(game: Game): void {
        this.game = game;
    }

    /**
     * 注册布局对象
     * @param iLayout
     */
    public register(iLayout: IAutoLayout): void {
        let idx = this.getLayoutIdx(iLayout);
        if (idx === -1)
            this.layoutList.push(iLayout);
        iLayout.layout();
    }


    /**
     * 注销布局对象
     * @param dc        自动布局显示对象
     */
    public unRegister(iLayout: IAutoLayout): void {
        let idx = this.getLayoutIdx(iLayout);
        if (idx !== -1)
            this.layoutList.splice(idx, 1);
    }

    public doLayout(): void {
        let i: number = 0;
        let len: number = this.layoutList.length;
        for (; i < len; i++) {
            this.layoutList[i].layout();
        }
    }

    private getLayoutIdx(iLayout: IAutoLayout): number {
        let i: number = 0;
        let len: number = this.layoutList.length;
        for (; i < len; i++) {
            if (this.layoutList[i] === iLayout) {
                return i;
            }
        }
        return -1;
    }
}


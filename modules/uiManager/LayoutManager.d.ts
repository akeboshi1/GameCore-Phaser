/**
 * 自动布局和视窗同步管理器
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import { ILayout } from '../../base/ILayout';
import Game = Phaser.Game;
export declare class LayoutManager extends BaseSingleton {
    game: Game;
    private layoutList;
    constructor();
    init(game: Game): void;
    /**
     * 注册布局对象
     * @param iLayout
     */
    register(iLayout: ILayout): void;
    /**
     * 注销布局对象
     * @param dc        自动布局显示对象
     */
    unRegister(iLayout: ILayout): void;
    doLayout(): void;
    private getLayoutIdx;
}

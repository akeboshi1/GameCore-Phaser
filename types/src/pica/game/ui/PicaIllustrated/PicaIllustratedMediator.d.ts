import { BasicMediator, Game } from "gamecore";
import { PicaIllustrated } from "./PicaIllustrated";
export declare class PicaIllustratedMediator extends BasicMediator {
    protected mModel: PicaIllustrated;
    private mScneType;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    private onCloseHandler;
    private onQueryRewardsHandler;
    private onQueryCombinationsHandler;
    private setGallaryData;
    private onShowMakePanel;
    private sortGallery;
    private setDoneMissionIdListHandler;
    private getCombinations;
    private get config();
}

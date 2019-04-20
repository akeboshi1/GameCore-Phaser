import BaseSingleton from "../../base/BaseSingleton";
import {LoaderProcessor} from "../../base/loader/LoaderProcessor";
import {Log} from "../../Log";
import {Const} from "../const/Const";
import LoaderTypeEnum = Const.LoaderTypeEnum;

export class LoaderManager extends BaseSingleton {

    private m_LoaderProcessor: LoaderProcessor;
    private game: Phaser.Game;
    constructor() {
        super();
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.m_LoaderProcessor = new LoaderProcessor(this.game);
    }

    public createImageLoader(key: string, png: string): Phaser.Loader {
        if (null == key) {
            Log.warn("加载路径为空");
            return null;
        }
        return this.m_LoaderProcessor.getLoader(key, LoaderTypeEnum.ImageResource);
    }

    public createAtlasLoader(key: string, textureURL: string, atlasURL: string): Phaser.Loader {
        if (null == key) {
            Log.warn("加载路径为空");
            return null;
        }
        return this.m_LoaderProcessor.getLoader(key, LoaderTypeEnum.AtlasResource, textureURL, atlasURL);
    }
}
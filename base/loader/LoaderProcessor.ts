import {HashMap} from "../ds/HashMap";
import {IObjectPool} from "../pool/interfaces/IObjectPool";
import Globals from "../../Globals";
import {Const} from "../../common/const/Const";
import LoaderTypeEnum = Const.LoaderTypeEnum;
import {Load} from "../../Assets";

export class LoaderProcessor {
    /**
     *	加载中的队列
     */
    private m_LoadingList: HashMap;
    protected game: Phaser.Game;
    constructor(game: Phaser.Game) {
        this.game = game;
        this.m_LoadingList = new HashMap();
    }

    protected get pool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("PhaserLoader");
        return op;
    }

    public getLoader(key: string, type: number, ...param: any[]): Phaser.Loader {
        let loader: Phaser.Loader = this.m_LoadingList.getValue(key);
        if (loader) {
            return loader;
        }

        loader = this.pool.alloc() as Phaser.Loader;
        if (null == loader) {
            loader = new Phaser.Loader(this.game);
        }
        switch (type) {
            case LoaderTypeEnum.ImageResource:
                loader.image(key, param[0]);
                break;
            case LoaderTypeEnum.AtlasResource:
                loader.atlas(key, param[0], param[1]);
                break;
            case LoaderTypeEnum.BinaryResource:
                loader.binary(key, param[0]);
                break;
        }
        this.m_LoadingList.add(key, loader);

        loader.onLoadComplete.addOnce(this.loadCompleteHandle, this, 0, key, loader);
        loader.start();

        return loader;
    }

    protected loadCompleteHandle(key: string, loader: Phaser.Loader): void {
        this.m_LoadingList.remove(key);
        this.pool.free(loader);
    }

}
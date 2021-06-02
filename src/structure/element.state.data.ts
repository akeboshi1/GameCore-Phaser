export interface StateConfig {
    type: string; // image,sprite,text
    text?: string;
    image?: {
        key?: string; // 加载图集key
        img?: string;// 图片名 帧动画时为前缀
        animation?: {
            anikey?: string,
            frame?: number[],
            duration?: number,
            repeat?: number
        };
        display?: {
            texturepath?: string;
            datapath?: string;
        }
    };
}

export enum ElementStateType {
    NONE = "none",// 已解锁
    UNFROZEN = "unfrozen",// 未解锁 材料不够
    REPAIR = "repair"// 未解锁 材料够
}

export enum ElementState {
    NONE = 0,
    // 创建element
    INIT = 1,
    // 数据初始化
    DATAINIT =2,
    // 数据准备更新
    DATAUPDATE = 3,
    // 数据更新中
    DATAPROGRESS = 4,
    // 数据更新完毕
    DATACOMPLETE = 5,
    // 预销毁
    PREDESTROY = 6,
    // 完成销毁
    DESTROYED = 7
}

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
    NONE = "none",
    UNFROZEN = "unfrozen",
    REPAIR = "repair"
}

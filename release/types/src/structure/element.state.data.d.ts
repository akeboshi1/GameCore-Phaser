export interface StateConfig {
    type: string;
    text?: string;
    image?: {
        key?: string;
        img?: string;
        animation?: {
            anikey?: string;
            frame?: number[];
            duration?: number;
            repeat?: number;
        };
        display?: {
            texturepath?: string;
            datapath?: string;
        };
    };
}
export declare enum ElementStateType {
    NONE = "none",
    UNFROZEN = "unfrozen",
    REPAIR = "repair"
}
export declare enum ElementState {
    NONE = 0,
    INIT = 1,
    DATAINIT = 2,
    DATAUPDATE = 3,
    DATADEALING = 4,
    DATACOMPLETE = 5,
    PREDESTROY = 5,
    DESTROYED = 6
}

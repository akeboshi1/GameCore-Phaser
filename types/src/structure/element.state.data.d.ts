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

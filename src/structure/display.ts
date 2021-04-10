export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export enum DisplayField {
    BACKEND = 0,
    STAGE,
    FRONTEND,
    FLAG,
    Effect
}

export enum TitleMask {
    TQ_NickName = 0x00010000,
    TQ_Badge = 0x00020000,
    // TQ_   = 0x0004;
}

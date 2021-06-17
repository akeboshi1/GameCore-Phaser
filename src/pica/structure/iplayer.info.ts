import { IAvatar, IDisplay } from "structure";
import { ICountablePackageItem } from "./icountablepackageitem";

// tslint:disable-next-line: class-name
export interface ISELF_PLAYER_INFO {
    id: number; // sprite id
    cid: string; // 玩家角色id, 展示
    like: number; // 点赞
    currentAvatar: IAvatar;
    nickname: string; // 昵称
    level: IPKTLevel; // 等级
    currentTitle: string; // 当前称号
    lifeSkills: IPKTSkill[];
    badges: IPKTBadgeTitle[];  // 徽章
    titles: IPKTBadgeTitle[]; // 称号
    properties: IPKTProperty[];
    handheld: ICountablePackageItem;
    avatarSuit: ICountablePackageItem[];
    gender: string; // 性别
}

export interface IPKTPlayerInfo {
    nickname: string;
    platformId: string;
    level: IPKTLevel;
    gender: string;
}

// 服务端返回客户端其他玩家信息
// tslint:disable-next-line: class-name
export interface IANOTHER_PLAYER_INFO extends ISELF_PLAYER_INFO {
    roomIds: string[];
}
export interface IPKTSkill {

    id: string;

    name?: string;

    display?: IDisplay;

    level?: IPKTLevel;

    quality?: string;

    active?: boolean;

    qualified?: boolean;
}
export interface IPKTBadgeTitle {

    id: string;

    name?: string;

    display?: IDisplay;
}
export interface IPKTProperty {

    key?: string;

    name?: string;

    value?: number;

    tempValue?: number;

    display?: IDisplay;

    max?: number;

    id?: string;
}
export interface IPKTLevel {

    level?: number;

    currentLevelExp?: number;

    nextLevelExp?: number;

    name?: string;
}

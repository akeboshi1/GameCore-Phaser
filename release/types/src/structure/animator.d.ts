import { AvatarSuit } from "./avatar.suit.type";
export declare class Animator {
    AniAction: any;
    constructor(suits?: AvatarSuit[]);
    setSuits(suits: AvatarSuit[]): void;
    getAnimationName(name: any): any;
}

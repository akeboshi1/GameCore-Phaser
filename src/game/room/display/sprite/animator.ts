import { AvatarSuit } from "structure";
import { PlayerState } from "../../element/element";
import { ISprite } from "./sprite";

export class Animator {
    public AniAction: any;
    constructor(suits?: AvatarSuit[]) {
        if (suits) {
            this.setSuits(suits);
        }
    }

    public setSuits(suits: AvatarSuit[]) {
        if (suits) {
            for (const suit of suits) {
                if (suit.suit_type === "weapon") {
                    if (suit.tag) {
                        this.AniAction = JSON.parse(suit.tag).action;
                    }
                }
            }
        }
    }

    public getAnimationName(name) {
        if (this.AniAction) {
            if (name === PlayerState.IDLE) return this.AniAction[0];
            else if (name === PlayerState.WALK) return this.AniAction[1];
        }
        return name;
    }
}

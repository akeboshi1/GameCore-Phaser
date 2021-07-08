import { PlayerState } from "./game.state";
var Animator = /** @class */ (function () {
    function Animator(suits) {
        if (suits) {
            this.setSuits(suits);
        }
    }
    Animator.prototype.setSuits = function (suits) {
        if (suits) {
            this.AniAction = null;
            for (var _i = 0, suits_1 = suits; _i < suits_1.length; _i++) {
                var suit = suits_1[_i];
                if (suit.suit_type === "weapon") {
                    if (suit.tag) {
                        this.AniAction = JSON.parse(suit.tag).action;
                    }
                }
            }
        }
    };
    Animator.prototype.getAnimationName = function (name) {
        if (this.AniAction) {
            if (name === PlayerState.IDLE)
                return this.AniAction[0];
            else if (name === PlayerState.WALK)
                return this.AniAction[1];
        }
        return name;
    };
    return Animator;
}());
export { Animator };
//# sourceMappingURL=animator.js.map
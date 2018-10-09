/**
 * 图层管理
 * author aaron
 */
import BaseSingleton from '../../base/BaseSingleton';
import BasicSprite from '../../display/BasicSprite';
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;
export declare class LayerManager extends BaseSingleton {
    game: Game;
    container: Sprite;
    sceneLayer: BasicSprite;
    animationLayer: BasicSprite;
    uiLayer: BasicSprite;
    dialogLayer: BasicSprite;
    tipLayer: BasicSprite;
    textLineSliderLayer: BasicSprite;
    debugLayer: BasicSprite;
    init(game: Game): void;
    layout(): void;
}

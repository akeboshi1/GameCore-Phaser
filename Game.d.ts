import IGame from './interface/IGame';
import IGameParam from './interface/IGameParam';
import 'phaser-ce';
export default class Game extends Phaser.Game implements IGame {
    constructor(value: IGameParam);
    resize(): void;
}

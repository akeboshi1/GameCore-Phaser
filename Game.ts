import IGame from './interface/IGame';
import IGameParam from './interface/IGameParam'
import 'phaser-ce';
import Boot from './states/boot';

export default class Game extends Phaser.Game implements IGame {
    constructor(value: IGameParam) {
        let config: Phaser.IGameConfig = {
            width: value.width,
            height: value.height,
            renderer: Phaser.AUTO,
            parent: '',
            resolution: 1
        };
        super(config);

        this.state.add('boot', Boot);
        this.state.start('boot');
    }

    public resize(): void {

    }
}
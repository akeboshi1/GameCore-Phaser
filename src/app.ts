import 'p2';
import 'pixi';
import 'phaser';
import Boot from './states/boot';
import * as Utils from './utils/utils';

class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
        super(config);

        this.state.add('boot', Boot);
        this.state.start('boot');
    }
}

function startApp(): void {
    let gameWidth: number = DEFAULT_GAME_WIDTH;
    let gameHeight: number = DEFAULT_GAME_HEIGHT;

    if (SCALE_MODE === 'USER_SCALE') {
        let screenMetrics: Utils.ScreenMetrics = Utils.ScreenUtils.calculateScreenMetrics(gameWidth, gameHeight);

        gameWidth = screenMetrics.gameWidth;
        gameHeight = screenMetrics.gameHeight;
    }

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: '',
        resolution: 1
    };

    let app = new App(gameConfig);
    console.log('startApp------------------------------------------------');
}
// window.onload = () => {
//     startApp();
// };

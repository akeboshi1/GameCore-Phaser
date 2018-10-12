///<reference path="../../node_modules/phaser-plugin-isometric/dist/phaser.plugin.isometric.d.ts"/>
import 'p2';
import 'pixi';
import 'phaser';
import IGame from './interface/IGame';
import IGameParam from './interface/IGameParam'
import 'phaser-ce';
import BootState from './states/boot';
import {Globals} from "./Globals";
import PreloaderState from "./states/preloader";
import GameState from "./states/game";
import {Log} from "./Log";
import 'phaser-isometric';

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

        // 初始化地图数据
        Globals.DataCenter.MapData.setMapInfo(value.mapData);

        this.state.add('boot', BootState);
        this.state.add('preloader', PreloaderState);
        this.state.add('game', GameState);
        this.state.start('boot');
    };

    public resize(): void {
    };

    public update(time: number): void {
        Log.trace("update-->",time);
    }

    public updateLogic(timeStep: number): void{
        Log.trace("updateLogic-->",timeStep);
    }

    public updateRender(timeStep: number): void{
        Log.trace("updateRender-->",timeStep);
    }
}
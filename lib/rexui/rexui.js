import ContainerLite from '../../../plugins/gameobjects/containerlite/ContainerLite.js';
import FadeOutDestroy from '../../../plugins/fade-out-destroy.js';
import FadeIn from '../../../plugins/fade-in.js';

const Container = ContainerLite;
const GetValue = Phaser.Utils.Objects.GetValue;

class Element extends Container {
    constructor(stage, rx, ry, config) {
        var scene = stage.scene;
        super(scene, 0, 0, 2, 2);
        this.stage = stage;
        this.setName(GetValue(config, 'name', ''));

        this.setRatioPosition(rx, ry);
    }

    replace(newGameObject, duration) {
        if (duration === undefined) {
            duration = 0;
        }
        // Fade-out old game object
        var oldGameObject = this.gameObject;
        if (oldGameObject) {
            if (newGameObject) {
                // Put old game object in front of new game object
                oldGameObject.depth = newGameObject.depth + 1;
            }
            this.remove(oldGameObject);
            FadeOutDestroy(oldGameObject, duration);
        }
        // Fade-in new game object
        if (newGameObject) {
            FadeIn(newGameObject, duration);
        }
        // Add new game object to container
        if (newGameObject) {
            newGameObject.setPosition(this.x, this.y);
            this.add(newGameObject);
            this.setSize(newGameObject.width, newGameObject.height);
        } else {
            this.setSize(2, 2);
        }
        return this;
    }

    get gameObject() {
        return this.getChildren()[0];
    }

    get textureKey() {
        var gameObject = this.gameObject;
        if (gameObject) {
            var texture = gameObject.texture;
            return (texture) ? texture.key : undefined;
        } else {
            return undefined;
        }
    }

    get x() {
        return super.x;
    }

    set x(value) {
        super.x = value;
        if (this.stage) {
            this.stage.resetChildState(this);
        }
    }

    get y() {
        return super.y;
    }

    set y(value) {
        super.y = value;
        if (this.stage) {
            this.stage.resetChildState(this);
        }
    }

    get rx() {
        return (this.x - this.stage.left) / this.stage.displayWidth;
    }

    set rx(value) {
        this.x = this.stage.left + (this.stage.displayWidth * value);
    }

    get ry() {
        return (this.y - this.stage.top) / this.stage.displayHeight;
    }

    set ry(value) {
        this.y = this.stage.top + (this.stage.displayHeight * value);
    }

    setRatioPosition(rx, ry) {
        this.rx = rx;
        this.ry = ry;
        return this;
    }

    setRx(rx) {
        this.rx = rx;
        return this;
    }

    setRy(ry) {
        this.ry = ry;
        return this;
    }
}

export default Element;var GetCharacter = function(name) {
    return this.childrenMap.characters[name];
}
export default GetCharacter;var GetElement = function (mapNameList) {
    if (this.childrenMap === undefined) {
        return undefined;
    }

    if (typeof (mapNameList) === 'string') {
        mapNameList = mapNameList.split('.');
    }
    if (mapNameList.length === 0) {
        return undefined;
    }

    var name = mapNameList.shift(),
        element;
    if (name.charAt(0) === '#') {
        name = name.substring(1);
        var elements = GetAllElements(this.childrenMap, tmpArray);
        for (var i = 0, cnt = elements.length; i < cnt; i++) {
            if (elements[i].name === name) {
                element = elements[i];
                break;
            }
        }
        tmpArray.length = 0;
    } else if (name.indexOf('[') === (-1)) {
        element = this.childrenMap[name];
    } else { // name[]
        var innerMatch = name.match(RE_OBJ);
        if (innerMatch != null) {
            var elements = this.childrenMap[innerMatch[1]];
            if (elements) {
                element = elements[innerMatch[2]];
            }
        }
    }

    if (mapNameList.length === 0) {
        return element;
    } else if (element && element.childrenMap) {
        return element.getElement(mapNameList);
    } else {
        return null;
    }
};

var GetAllElements = function (children, out) {
    if (out === undefined) {
        out = [];
    }
    var child;
    for (var key in children) {
        child = children[key];
        if (child.name !== undefined) {
            out.push(child);
        } else {
            GetAllElements(child, out);
        }
    }
    return out;
}

const RE_OBJ = /(\S+)\[(\d+)\]/i;
var tmpArray = [];

export default GetElement;import Element from './Element.js';

var SetBackground = function (textureKey, frame, duration) {
    var gameObject;
    if (typeof (textureKey) === 'string') {
        gameObject = this.scene.add.image(0, 0, textureKey, frame);
    } else {
        gameObject = textureKey;
    }

    if (typeof (frame) === 'number') {
        duration = frame;
    }

    if (duration === undefined) {
        duration = 0;
    }
    if (gameObject) {
        gameObject.depth = this.backgroundDepth;
    }

    if (this.childrenMap.background === undefined) {
        this.setSize(gameObject.width, gameObject.height);
        var background = new Element(this, 0.5, 0.5);
        this.add(background);
        this.childrenMap.background = background;
    }

    this.childrenMap.background.replace(gameObject, duration);
    return this;
}
export default SetBackground;import Element from './Element.js';

var SetCharacter = function (name, textureKey, frame, duration) {
    var gameObject;
    if (typeof (textureKey) === 'string') {
        gameObject = this.scene.add.image(0, 0, textureKey, frame);
    } else {
        gameObject = textureKey;
    }

    if (typeof (frame) === 'number') {
        duration = frame;
    }

    if (duration === undefined) {
        duration = 0;
    }

    if (gameObject) {
        gameObject.depth = this.characterDepth;
    }

    var characters = this.childrenMap.characters;
    if (!characters.hasOwnProperty(name)) {
        var character = new Element(this, 0.5, 0.5);
        this.add(character);
        characters[name] = character;
    }
    characters[name].replace(gameObject, duration);
    return this;
}

export default SetCharacter;import ContainerLite from '../../../plugins/gameobjects/containerlite/ContainerLite.js';
import SetBackground from './SetBackground.js';
import SetCharacter from './SetCharacter.js';
import GetCharacter from './GetCharacter.js';
import GetElement from './GetElement.js';

const Container = ContainerLite;
const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

class Stage extends Container {
    constructor(scene, x, y, config) {
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
        }
        super(scene, x, y, 2, 2);
        this.setName(GetValue(config, 'name', ''));

        this.characterDepth = GetValue(config, 'depth.characher', -2);
        this.backgroundDepth = GetValue(config, 'depth.background', this.characterDepth - 10);

        this.childrenMap = {};
        this.childrenMap.background;
        this.childrenMap.characters = {};
    }

    get left() {
        return this.x - (this.displayWidth * this.originX);
    }

    set left(value) {
        this.x += (value - this.left);
    }

    alignLeft(value) {
        this.left = value;
        return this;
    }

    get right() {
        return (this.x - (this.displayWidth * this.originX)) + this.displayWidth;
    }

    set right(value) {
        this.x += (value - this.right);
    }

    alignRight(value) {
        this.right = value;
        return this;
    }

    get top() {
        return this.y - (this.displayHeight * this.originY);
    }

    set top(value) {
        this.y += (value - this.top);
    }

    alignTop(value) {
        this.top = value;
        return this;
    }

    get bottom() {
        return (this.y - (this.displayHeight * this.originY)) + this.displayHeight;
    }

    set bottom(value) {
        this.y += (value - this.bottom);
    }

    alignBottom(value) {
        this.bottom = value;
        return this;
    }
}

var methods = {
    setBackground: SetBackground,
    setCharacter: SetCharacter,
    getCharacter: GetCharacter,
    getElement: GetElement,
}

Object.assign(
    Stage.prototype,
    methods
);
export default Stage;import BoardPlugin from '../../plugins/board-plugin.js';
import MainState from './states/MainState.js';
import Board from './board/Board.js';

const EE = Phaser.Events.EventEmitter;

class Bejeweled extends EE {
    constructor(scene, config) {
        loadRexBoardPlugin(scene);
        super();

        this.scene = scene;
        this.board = new Board(scene, config);
        this.mainState = new MainState(this, config);

        this.boot();
    }

    boot() {
        // touch control
        this.board
            .onPointerDown(this.selectChess, this)
            .onPointerMove(this.selectChess, this)
            .onPointerUp(this.cancelSelecting, this);

        this.scene.events.on('destroy', this.destroy, this);
    }

    shutdown() {
        super.shutdown();
        this.board.shutdown();
        this.mainState.shutdown();

        this.scene = undefined;
        this.board = undefined;
        this.mainState = undefined;
        return this;
    }

    destroy() {
        this.emit('destroy');
        this.shutdown();
        return this;
    }

    setBoardSize(width, height) {
        this.board.setBoardWidth(width).setBoardHeight(height);
        return this;
    }

    start() {
        this.mainState.goto('START');
        return this;
    }

    selectChess(pointer, chess) {
        this.mainState.selectChess(chess);
    }

    cancelSelecting() {
        this.mainState.selectChess();
    }
}

var loadRexBoardPlugin = function (scene) {
    if (Phaser.Plugins.PluginCache.hasCustom('RexBoardPlugin')) {
        return;
    }
    scene.load.scenePlugin('RexBoardPlugin', BoardPlugin, 'rexBoard', 'rexBoard').start();
}
export default Bejeweled;// methods
import Init from './Init.js'
import Reset from './Reset.js';
import CreateChess from './chess/CreateChess.js';
import Fill from './Fill.js';
import BreakMatch3 from './BreakMatch3.js';
import PreTest from './PreTest.js';
import EliminateChess from './EliminateChess.js';
import Falling from './Falling.js';
import SwapChess from './SwapChess.js';
import GetAllMatch from './match/GetAllMatch.js';

const GetValue = Phaser.Utils.Objects.GetValue;
class Board {
    constructor(scene, config) {
        this.scene = scene;
        this.board = scene.rexBoard.add.board(GetValue(config, 'board', undefined));
        this.match = scene.rexBoard.add.match(GetValue(config, 'match', undefined));
        this.match.setBoard(this.board);

        this.initSymbolsMap = GetValue(config, 'initMap', undefined); // 2d array
        // configuration of chess
        this.chessTileZ = GetValue(config, 'chess.tileZ', 1);
        this.candidateSymbols = GetValue(config, 'chess.symbols', undefined);
        this.chessCallbackScope = GetValue(config, 'chess.scope', undefined);
        this.chessCreateCallback = GetValue(config, 'chess.create', undefined);
        this.chessMoveTo = GetValue(config, 'chess.moveTo', {});
        this.chessMoveTo.occupiedTest = true;

        // internal reference
        this.eliminatingTimer = undefined; // EliminateChess
        this.waitEvents = undefined; // Falling
    }

    shutdown() {
        this.match.destroy();
        this.board.destroy();

        this.board = undefined;
        this.match = undefined;
        this.initSymbolsMap = undefined;
        this.candidateSymbols = undefined;
        this.chessCallbackScope = undefined;
        this.chessCreateCallback = undefined;
        this.chessMoveTo = undefined;

        if (this.eliminatingTimer) {
            this.eliminatingTimer.remove();
            this.eliminatingTimer = undefined;
        }
        if (this.waitEvents) {
            this.waitEvents.destroy();
            this.waitEvents = undefined;
        }
        return this;
    }

    destroy() {
        this.shutdown();
        return this;
    }

    setBoardWidth(width) {
        this.board.setBoardWidth(width);
        return this;
    }

    setBoardHeight(height) {
        this.board.setBoardHeight(height);
        return this;
    }

    setCandidateSymbols(symbols) {
        this.candidateSymbols = symbols;
        return this;
    }

    setChessTileZ(tileZ) {
        this.chessTileZ = tileZ;
        return this;
    }

    setInitSymbolsMap(map) {
        this.initSymbolsMap = map; // 2d array
        return this;
    }

    onPointerDown(callback, scope) {
        this.board
            .setInteractive()
            .on('gameobjectdown', callback, scope);
        return this;
    }

    onPointerMove(callback, scope) {
        this.board
            .setInteractive()
            .on('gameobjectmove', function (pointer, gameObject) {
                if (!pointer.isDown) {
                    return;
                }
                callback.call(scope, pointer, gameObject);
            });
        return this;
    }

    onPointerUp(callback, scope) {
        this.board
            .setInteractive()
            .on('gameobjectup', callback, scope);
        return this;
    }
}

var methods = {
    init: Init,
    reset: Reset,
    createChess: CreateChess,
    fill: Fill,
    breakMatch3: BreakMatch3,
    preTest: PreTest,
    eliminateChess: EliminateChess,
    falling: Falling,
    swapChess: SwapChess,
    getAllMatch: GetAllMatch,
}
Object.assign(
    Board.prototype,
    methods
);
export default Board;/*
1. Pick each match3 line
2. Pick a random chess in this match3 line
3. Change symbol to a different value of all neighbors
*/

import RefreshSymbolCache from './match/RefreshSymbolCache.js';
import GetMatchN from './match/GetMatchN.js';
import RandomSymbol from './chess/RandomSymobl.js';

const GetRandom = Phaser.Utils.Array.GetRandom;

var BreakMatch3 = function () {
    var tileZ = this.chessTileZ,
        scope = this.chessCallbackScope,
        symbols = this.candidateSymbols;

    RefreshSymbolCache.call(this); // only refresh symbol cache once
    GetMatchN.call(this, 3, function (result, board) {
        // Pick a random chess in this match3 line
        var tileXY = GetRandom(result.tileXY);
        var chess = board.tileXYZToChess(tileXY.x, tileXY.y, tileZ);
        var neighborChess = board.getNeighborChess(chess, null);
        // collect symbols of all neighbors
        var excluded = [];
        for (var i = 0, cnt = neighborChess.length; i < cnt; i++) {
            excluded.push(neighborChess[i].getData('symbol'));
        }
        var newSymbol = RandomSymbol(board, tileXY.x, tileXY.y, symbols, scope, excluded);
        if (newSymbol != null) {
            // Change symbol to a different value of all neighbors.
            // It also fires 'changedata_symbol' event.
            chess.setData('symbol', newSymbol);
        }
    });
}

export default BreakMatch3;import FadeOutDestroy from '../../../plugins/fade-out-destroy.js';
var EliminateChess = function (chess, completeCallback, scope) {
    const duration = 500; //ms
    chess.forEach(function (item) {
        FadeOutDestroy(item, duration);
    });
    this.eliminatingTimer = this.scene.time.delayedCall(duration, completeCallback, [], scope); // delay in ms
    return this;
}
export default EliminateChess;/* 
1. Falling down all chess
*/
import WaitEvents from '../../../plugins/waitevents.js';

var Falling = function (completeCallback, scope) {
    var board = this.board,
        chess, moveTo;
    if (this.waitEvents === undefined) {
        this.waitEvents = new WaitEvents();
    }
    this.waitEvents.setCompleteCallback(completeCallback, scope);
    for (var tileY = (this.board.height - 1); tileY >= 0; tileY--) { // bottom to top
        for (var tileX = 0, cnt = this.board.width; tileX < cnt; tileX++) { // left to right
            chess = board.tileXYZToChess(tileX, tileY, this.chessTileZ);
            if (chess === null) {
                continue;
            }
            moveTo = chess.rexMoveTo;
            do {
                moveTo.moveToward(1);
            } while (moveTo.lastMoveResult)
            if (moveTo.isRunning) {
                this.waitEvents.waitEvent(moveTo, 'complete');
            }
        }
    }
    return this;
}

export default Falling;/*
1. Fill empty grids
*/

var Fill = function (map) {
    var symbol;
    var board = this.board,
        symbols = this.candidateSymbols;
    for (var tileY = 0, height = this.board.height; tileY < height; tileY++) {
        for (var tileX = 0, width = this.board.width; tileX < width; tileX++) {
            if (board.contains(tileX, tileY, this.chessTileZ)) { // not empty                
                continue;
            }

            if (map !== undefined) {
                symbol = map[tileX][tileY];
                if (symbol !== '?') {
                    symbols = symbol;
                }
            }
            this.createChess(tileX, tileY, symbols);
        }
    }
}
export default Fill;/* 
1. Fill background tiles
*/
var Init = function () {
    // TODO: assign symobls of board via callback
    return this;
}

export default Init;/*
1. Test if there has any matched line after chess swapping
*/

import RefreshSymbolCache from './match/RefreshSymbolCache.js';
import AnyMatch from './match/AnyMatch.js';

var PreTest = function () {
    var match = this.match;
    var directions = this.board.grid.halfDirections;
    var tileB;
    RefreshSymbolCache.call(this); // only refresh symbol cache once
    for (var tileY = (this.board.height / 2), rowCnt = this.board.height; tileY < rowCnt; tileY++) {
        for (var tileX = 0, colCnt = this.board.width; tileX < colCnt; tileX++) {
            tileA.x = tileX;
            tileA.y = tileY;
            for (var dir = 0, dirCnt = directions.length; dir < dirCnt; dir++) {
                tileB = this.board.getNeighborTileXY(tileA, dir);
                // swap symbol
                swapSymbols(match, tileA, tileB);
                // any match?
                this.preTestResult = AnyMatch.call(this, 3);
                // swap symbol back
                swapSymbols(match, tileA, tileB);

                if (this.preTestResult) {
                    return true;
                }
            }
        }
    }
    return false;
}

var swapSymbols = function (match, tileA, tileB) {
    var symbolA = match.getSymbol(tileA.x, tileA.y);
    var symbolB = match.getSymbol(tileB.x, tileB.y);
    match.setSymbol(tileA.x, tileA.y, symbolB);
    match.setSymbol(tileB.x, tileB.y, symbolA);
};

var tileA = {
    x: 0,
    y: 0
};

export default PreTest;/* 
1. Destroy all chess
2. Fill chess
3. Break match3
*/

var Reset = function() {
    // Destroy all chess
    this.board.removeAllChess();
    // Fill chess (with initial symbol map)
    this.fill(this.initSymbolsMap);
    // Break match3
    this.breakMatch3();
}

export default Reset;var SwapChess = function (chess1, chess2, completeCallback, scope) {
    var rexChess1 = chess1.rexChess,
        rexChess2 = chess2.rexChess;
    rexChess2.setTileZ('$' + rexChess2.$uid); // moveto unique tileZ

    var tileXYZ1 = rexChess1.tileXYZ;
    var tileX1 = tileXYZ1.x,
        tileY1 = tileXYZ1.y;
    var tileXYZ2 = rexChess2.tileXYZ;
    var tileX2 = tileXYZ2.x,
        tileY2 = tileXYZ2.y;
    chess1.rexMoveTo.once('complete', completeCallback, scope);
    chess1.rexMoveTo.moveTo(tileX2, tileY2);
    chess2.rexMoveTo.moveTo(tileX1, tileY1);

    rexChess2.setTileZ(this.chessTileZ); // moveto tileZ back
    return this;
};
export default SwapChess;import RandomSymbol from './RandomSymobl.js';

var CreateChess = function (tileX, tileY, symbols) {
    var scene = this.scene,
        board = this.board,
        scope = this.chessCallbackScope;

    // Get symbol
    var symbol = RandomSymbol(board, tileX, tileY, symbols, scope);
    // Create game object
    var gameObject;
    if (scope) {
        gameObject = this.chessCreateCallback.call(scope, board);
    } else {
        gameObject = this.chessCreateCallback(board);
    }
    // Set symbol, it also fires 'changedata_symbol' event
    gameObject.setData('symbol', symbol);
    // Add to board
    board.addChess(gameObject, tileX, tileY, this.chessTileZ, true);
    // behaviors
    gameObject.rexMoveTo = scene.rexBoard.add.moveTo(gameObject, this.chessMoveTo);
}

export default CreateChess;const GetRandom = Phaser.Utils.Array.GetRandom;

var RandomSymbol = function (board, tileX, tileY, callback, scope, excluded) {
    var symbol;
    if (Array.isArray(callback)) {
        // pick random symbol from symbol array
        var symbols = callback;
        // excluded: undefined or a symbol array
        if (excluded !== undefined) {
            for (var i = 0, cnt = symbols.length; i < cnt; i++) {
                symbol = symbols[i];
                if (excluded.indexOf(symbol) !== -1) {
                    continue;
                }
                tmpSymbolArray.push(symbol);
            }
            symbol = GetRandom(tmpSymbolArray);
            tmpSymbolArray.length = 0;
        } else {
            symbol = GetRandom(symbols);
        }

    } else if (typeof (obj) === 'function') {
        // symbols from return of callback
        if (scope) {
            symbol = callback.call(scope, board, tileX, tileY, excluded);
        } else {
            symbol = callback(board, tileX, tileY, excluded);
        }
    } else {
        // symbol value
        symbol = callback;
    }
    return symbol;
}

var tmpSymbolArray = [];
export default RandomSymbol;var AnyMatch = function (n) {
    return this.match.anyMatch(n);
}

export default AnyMatch;import RefreshSymbolCache from './RefreshSymbolCache.js';
import GetMatchN from './GetMatchN.js';

const SetStruct = Phaser.Structs.Set;
var GetAllMatch = function () {
    RefreshSymbolCache.call(this) // only refresh symbol cache once
    // Get match5, match4, match3
    var self = this;
    var matchLines = [];
    for (var n = 5; n >= 3; n--) {
        GetMatchN.call(this, n, function (result, board) {
            var newSet = new SetStruct(board.tileXYArrayToChessArray(result.tileXY, self.chessTileZ));
            for (var i = 0, cnt = matchLines.length; i < cnt; i++) {
                if (subSetTest(matchLines[i], newSet)) {
                    return; // not a new set
                }
            }
            matchLines.push(newSet);
        });
    }
    return matchLines;
}

var subSetTest = function (setA, setB) {
    // Return true if setB is a subset of setA
    var itemsA = setA.entries;
    for (var i = 0, cnt = itemsA.length; i < cnt; i++) {
        if (!setB.contains(itemsA[i])) {
            return false;
        }
    }
    return true;
};

export default GetAllMatch;var GetMatchN = function (n, callback, scope) {
    this.match.match(n, callback, scope);
    return this;
}

export default GetMatchN;var RefreshSymbolCache = function () {
    this.match.refreshSymbols(function (tileXY, board) {
        // TODO: Return null if not in valid area
        if (tileXY.y < (board.height / 2)) {
            return null;
        }
        var chess = board.tileXYZToChess(tileXY.x, tileXY.y, this.chessTileZ);
        if (chess == null) {
            return null;
        }
        return chess.getData('symbol');
    }, this);
};

export default RefreshSymbolCache;import FSM from '../../../plugins/fsm.js';
import MatchState from './MatchState.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class State extends FSM {
    constructor(parent, config) {
        super(config);
        this.parent = parent; // Bejeweled
        this.scene = parent.scene; // Bejeweled.scene
        this.board = parent.board; // Bejeweled.board
        this.selectedChess1;
        this.selectedChess2;
        this.matchState = new MatchState(parent, config); // sub-state        

        var debug = GetValue(config, 'debug', false);
        if (debug) {
            this.on('statechange', this.printState, this);
        }
    }

    shutdown() {
        super.shutdown();
        this.matchState.shutdown();

        this.parent = undefined;
        this.scene = undefined;
        this.board = undefined;
        this.selectedChess1 = undefined;
        this.selectedChess2 = undefined;
        return this;
    }

    destroy() {
        this.shutdown();
        return this;
    }

    // START
    enter_START() {
        this.board.init(); // Fill background tiles
        this.next();
    }
    next_START() {
        return 'RESET';
    }
    // START

    // RESET
    enter_RESET() {
        this.board.reset(); // Refill chess
        this.next();
    }
    next_RESET() {
        return 'PRETEST';
    }
    // RESET


    // PRETEST
    enter_PRETEST() {
        this.next();
    }
    next_PRETEST() {
        var nextState;
        if (this.board.preTest()) {
            nextState = 'SELECT1';
        } else {
            nextState = 'RESET';
        }
        return nextState;
    }
    // PRETEST

    // SELECT1
    enter_SELECT1() {
        this.selectedChess1 = undefined;
        this.selectedChess2 = undefined;
    }
    next_SELECT1() {
        var nextState;
        if (this.selectedChess1 !== undefined) {
            nextState = 'SELECT2';
        }
        return nextState;
    }
    // SELECT1


    // SELECT2    
    next_SELECT2() {
        var nextState;
        if ((this.selectedChess2 !== undefined) &&
            this.board.board.areNeighbors(this.selectedChess1, this.selectedChess2)) {
            nextState = 'SWAP';
        } else {
            nextState = 'SELECT1';
        }
        return nextState;
    }
    // SELECT2

    // SWAP
    enter_SWAP() {
        this.board.swapChess(this.selectedChess1, this.selectedChess2, this.next, this);
    }
    next_SWAP() {
        return 'MATCH3';
    }
    // SWAP

    // MATCH3
    enter_MATCH3() {
        this.matchState
            .once('complete', this.next, this)
            .goto('START');
    }
    next_MATCH3() {
        var nextState;
        if (this.matchState.totalMatchedLinesCount === 0) {
            nextState = 'UNDOSWAP';
        } else {
            nextState = 'PRETEST';
        }
        return nextState;
    }
    // MATCH3

    // UNDO_SWAP
    enter_UNDOSWAP() {
        this.board.swapChess(this.selectedChess1, this.selectedChess2, this.next, this);
    }
    next_UNDOSWAP() {
        return 'SELECT1';
    }
    // UNDO_SWAP

    // debug
    printState() {
        console.log('Main state: ' + this.prevState + ' -> ' + this.state);
    }

    // Select chess
    selectChess(chess) {
        switch (this.state) {
            case 'SELECT1':
                this.selectedChess1 = chess;
                this.next();
                break;
            case 'SELECT2':
                this.selectedChess2 = chess;
                this.next();
                break;
        }
    }
}

export default State;import FSM from '../../../plugins/fsm.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const SetStruct = Phaser.Structs.Set;

class State extends FSM {
    constructor(parent, config) {
        super(config);
        this.parent = parent; // Bejeweled
        this.scene = parent.scene; // Bejeweled.scene
        this.board = parent.board; // Bejeweled.board
        this.totalMatchedLinesCount = 0;
        this.eliminatedChessArray;

        // callbacks
        // on matched lines
        this.onMatchLinesCallback = GetValue(config, 'onMatchLinesCallback', undefined);
        this.onMatchLinesCallbackScope = GetValue(config, 'onMatchLinesCallbackScope', undefined);
        // on eliminating chess
        this.onEliminatingChessCallback = GetValue(config, 'onEliminatingChessCallback', undefined);
        this.onEliminatingChessCallbackScope = GetValue(config, 'onEliminatingChessCallbackScope', undefined);
        // on falling chess
        this.onFallingChessCallback = GetValue(config, 'onFallingChessCallback', undefined);
        this.onFallingChessCallbackScope = GetValue(config, 'onFallingChessCallback', undefined);

        var debug = GetValue(config, 'debug', false);
        if (debug) {
            this.on('statechange', this.printState, this);
        }
    }

    shutdown() {
        super.shutdown();

        this.parent = undefined;
        this.scene = undefined;
        this.board = undefined;
        this.eliminatedChessArray = undefined;
        this.onMatchLinesCallback = undefined;
        this.onMatchLinesCallbackScope = undefined;
        this.onEliminatingChessCallback = undefined;
        this.onEliminatingChessCallbackScope = undefined;
        this.onFallingChessCallback = undefined;
        this.onFallingChessCallbackScope = undefined;
        return this;
    }

    destroy() {
        this.shutdown();
        return this;
    }

    // START
    enter_START() {
        this.totalMatchedLinesCount = 0;
        this.next()
    }
    next_START() {
        return 'MATCH3';
    }
    // START

    // MATCH3
    enter_MATCH3() {
        var matchedLines = this.board.getAllMatch();
        this.totalMatchedLinesCount += matchedLines.length;
        // callback
        var callback = this.onMatchLinesCallback,
            scope = this.onMatchLinesCallbackScope;
        if (callback) {
            var board = this.board.board;
            if (scope) {
                callback.call(scope, matchedLines, board);
            } else {
                callback(matchedLines, board);
            }
            // add or remove eliminated chess
        }
        switch (matchedLines.length) {
            case 0:
                this.eliminatedChessArray = [];
                break;
            case 1:
                this.eliminatedChessArray = matchedLines[0].entries;
                break;
            default:
                // Put all chess to a set
                var newSet = new SetStruct();
                for (var i = 0, cnt = matchedLines.length; i < cnt; i++) {
                    matchedLines[i].entries.forEach(function (value) {
                        newSet.set(value);
                    });
                }
                this.eliminatedChessArray = newSet.entries;
                break;
        }
        this.next();
    }
    next_MATCH3() {
        var nextState;
        if (this.eliminatedChessArray.length === 0) {
            nextState = 'END'
        } else {
            nextState = 'ELIMINATING';
        }
        return nextState;
    }
    // MATCH3

    // ELIMINATING
    enter_ELIMINATING() {
        // callback
        var task;
        var chessArray = this.eliminatedChessArray,
            callback = this.onEliminatingChessCallback,
            scope = this.onEliminatingChessCallbackScope;
        if (callback) {
            var board = this.board.board;
            if (scope) {
                task = callback.call(scope, chessArray, board);
            } else {
                task = callback(chessArray, board);
            }
        }
        // remove eliminated chess
        var board = this.board.board;
        chessArray.forEach(board.removeChess, board);
        // run eliminating task
        if (task) {
            // custom eliminating task, wait for 'complete' event
            task.once('complete', this.next, this);
        } else {
            // default eliminating task
            this.board.eliminateChess(chessArray, this.next, this);
        }
    }
    next_ELIMINATING() {
        return 'FALLING';
    }
    exit_ELIMINATING() {
        this.eliminatedChessArray = undefined;
    }
    // ELIMINATING

    // FALLING
    enter_FALLING() {
        // callback
        var task;
        var callback = this.onFallingChessCallback,
            scope = this.onFallingChessCallbackScope;
        if (callback) {
            var board = this.board.board;
            if (scope) {
                task = callback.call(scope, board);
            } else {
                task = callback(board);
            }
        }
        // run falling task
        if (task) {
            // custom falling task, wait for 'complete' event
            task.once('complete', this.next, this);
        } else {
            // default falling task
            this.board.falling(this.next, this);
        }
    }
    next_FALLING() {
        return 'FILL';
    }
    // FALLING

    // FILL
    enter_FILL() {
        this.board.fill();
        this.next();
    }
    next_FILL() {
        return 'MATCH3';
    }
    // FILL

    // END
    enter_END() {
        this.emit('complete');
    }
    // END

    printState() {
        console.log('Match state: ' + this.prevState + ' -> ' + this.state);
    }
}
export default State;export default {
    getData(key, defaultValue) {
        return this.questionManager.getData(key, defaultValue);
    },

    setData(key, value) {
        this.questionManager.setData(key, value);
        return this;
    },

    incData(key, inc, defaultValue) {
        this.questionManager.incData(key, inc, defaultValue);
        return this;
    },

    mulData(key, mul, defaultValue) {
        this.questionManager.mulData(key, mul, defaultValue);
        return this;
    },

    clearData() {
        this.questionManager.clearData();
        return this;
    },
};import QuestionManager from '../../plugins/logic/quest/questions/QuestionManager.js';
import QuestMethods from './QuestMethods.js';
import DataMethods from './DataMethods.js';

const EE = Phaser.Events.EventEmitter;
const GetValue = Phaser.Utils.Objects.GetValue;

class DialogQuest extends EE {
    constructor(config) {
        super();

        if (config === undefined) {
            config = {};
        }
        if (!config.quest) {
            config.quest = true;
        }

        this.dialog = GetValue(config, 'dialog', undefined);
        this.questionManager = new QuestionManager(config);

        // Attach events
        this.questionManager
            .on('quest', function (question) {
                var choices = this.dialog.getElement('choices');
                var options = question.options, option;
                for (var i = 0, cnt = choices.length; i < cnt; i++) {
                    option = options[i];
                    if (option) {
                        this.dialog.showChoice(i);
                        this.emit('update-choice', choices[i], option, this);
                    } else {
                        this.dialog.hideChoice(i);
                    }
                }
                this.emit('update-dialog', this.dialog, question, this);
            }, this);

        this.dialog
            .on('button.click', function (button, groupName, index) {
                var eventName = 'click-' + ((groupName === 'choices') ? 'choice' : 'action');
                this.emit(eventName, button, this.dialog, this);
            }, this)
    }
}

Object.assign(
    DialogQuest.prototype,
    QuestMethods,
    DataMethods,
);


export default DialogQuest;export default {
    start(key) {
        this.questionManager
            .restartQuest()
            .getNextQuestion(key);
        return this;
    },

    next(key) {
        this.questionManager
            .getNextQuestion(key);
        return this;
    },

    isLast() {
        return this.questionManager.isLastQuestion();
    },
};import RoundRectangle from './roundrectangle/RoundRectangle.js';
import BBCodeText from './bbcodetext/BBCodeText.js';
import TagText from './tagtext/TagText.js';
import Container from './container/Container.js';

import Sizer from './sizer/Sizer.js';
import GridSizer from './gridsizer/GridSizer.js';
import FixWidthSizer from './fixwidthsizer/FixWidthSizer.js';

import Label from './label/Label.js';
import Buttons from './buttons/Buttons.js';
import Dialog from './dialog/Dialog.js';
import Tabs from './tabs/Tabs.js';
import Slider from './slider/Slider.js';
import GridTable from './gridtable/GridTable.js';
import Menu from './menu/Menu.js';
import TextBox from './textbox/Textbox.js';
import NumberBar from './numberbar/NumberBar.js';
import Pages from './pages/Pages.js';
import TextBlock from './textblock/TextBlock.js';
import TextArea from './textarea/TextArea.js';
import ScrollableBlock from './scrollableblock/ScrollableBlock.js';
import ScrollablePanel from './scrollablepanel/ScrollablePanel.js';
import Chart from './chart/Chart.js';
import Video from './video/Video.js';
import VideoCanvas from './video/VideoCanvas.js';
import YoutubePlayer from './youtubeplayer/YoutubePlayer.js';

import {
    Show,
    Hide
} from './utils/Hide.js';
import Edit from '../../plugins/behaviors/textedit/Edit.js';

export default {
    RoundRectangle: RoundRectangle,
    BBCodeText: BBCodeText,
    TagText: TagText,
    Container: Container,

    Sizer: Sizer,
    GridSizer: GridSizer,
    FixWidthSizer: FixWidthSizer,

    Label: Label,
    Buttons: Buttons,
    Dialog: Dialog,
    Tabs: Tabs,
    Slider: Slider,
    GridTable: GridTable,
    Menu: Menu,
    TextBox: TextBox,
    NumberBar: NumberBar,
    Pages: Pages,
    TextBlock: TextBlock,
    TextArea: TextArea,
    ScrollableBlock: ScrollableBlock,
    ScrollablePanel: ScrollablePanel,
    Chart: Chart,
    Video: Video,
    VideoCanvas: VideoCanvas,
    YoutubePlayer: YoutubePlayer,

    hide: Hide,
    show: Show,
    edit: Edit,
};class ObjectFactory {
    constructor(scene) {
        this.scene = scene;
    }

    static register(type, callback) {
        ObjectFactory.prototype[type] = callback;
    }
};
export default ObjectFactory;import ObjectFactory from './ObjectFactory.js';

import RoundRectangleFactory from './roundrectangle/RoundRectangleFactory.js';
import BBCodeTextFactory from './bbcodetext/BBCodeTextFactory.js';
import TagTextFactory from './tagtext/TagTextFactory.js';
import ContainerFactory from './container/ContainerFactory.js';

import SizerFactory from './sizer/SizerFactory.js';
import GridSizerFactory from './gridsizer/GridSizerFactory.js';
import FixWidthSizerFactory from './fixwidthsizer/FixWidthSizerFactory.js';

import LabelFactory from './label/LabelFactory.js';
import ButtonsFactory from './buttons/ButtonsFactory.js';
import DialogFactory from './dialog/DialogFactory.js';
import TabsFactory from './tabs/TabsFactory.js';
import SliderFactory from './slider/SliderFactory.js';
import GridTableFactory from './gridtable/GridTableFactory.js';
import MenuFactory from './menu/MenuFactory.js';
import TextBoxFactory from './textbox/TextboxFactory.js';
import NumberBarFactory from './numberbar/NumberBarFactory.js';
import PagesFactory from './pages/PagesFactory.js';
import TextBlockFactory from './textblock/TextBlockFactory.js';
import TextAreaFactory from './textarea/TextAreaFactory.js';
import ScrollableBlockFactory from './scrollableblock/ScrollableBlockFactory.js';
import ScrollablePanelFactory from './scrollablepanel/ScrollablePanelFactory.js';
import ToastFactory from './toast/ToastFactory.js';
import ChartFactory from './chart/ChartFactory.js';
import VideoFactory from './video/VideoFactory.js';
import VideoCanvasFactory from './video/VideoCanvasFactory.js';
import YoutubePlayerFactory from './youtubeplayer/YoutubePlayerFactory.js';

import TapFactory from './tap/TapFactory.js';
import PressFactory from './press/PressFactory.js';
import SwipeFactory from './swipe/SwipeFactory.js';
import PanFactory from './pan/PanFactory.js';
import PinchFactory from './pinch/PinchFactory.js';
import RotateFactory from './rotate/RotateFactory.js';

import {
    Show,
    Hide,
    IsShown,
} from './utils/Hide.js';
import Edit from '../../plugins/behaviors/textedit/Edit.js';

class UIPlugin extends Phaser.Plugins.ScenePlugin {
    constructor(scene, pluginManager) {
        super(scene, pluginManager);

        this.add = new ObjectFactory(scene);
    }
}

var methods = {
    hide: Hide,
    show: Show,
    isShown: IsShown,
    edit: Edit,
}

Object.assign(
    UIPlugin.prototype,
    methods
);


export default UIPlugin;var AddChildrenMap = function (key, gameObject) {
    if (this.childrenMap === undefined) {
        this.childrenMap = {};
    }
    this.childrenMap[key] = gameObject;
    return this;
}

export default AddChildrenMap;import Container from '../container/Container.js';
import Methods from './Methods.js';
import Anchor from '../../../plugins/behaviors/anchor/Anchor.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Base extends Container {
    constructor(scene, x, y, minWidth, minHeight, config) {
        var anchorX, anchorY;
        if (typeof (x) === 'string') {
            anchorX = x;
            anchorY = y;
            x = 0;
            y = 0;
        }

        super(scene, x, y, 2, 2);

        this.isRexSizer = true;
        this.setMinSize(minWidth, minHeight);
        this.setName(GetValue(config, 'name', ''));
        this.rexSizer = {};
        this.backgroundChildren = undefined;

        if (anchorX !== undefined) {
            this._anchor = new Anchor(this, {
                x: anchorX,
                y: anchorY,
            });;
        }

        this.setDraggable(GetValue(config, 'draggable', false));
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        if (this.backgroundChildren !== undefined) {
            this.backgroundChildren.length = 0;
        }
        super.destroy(fromScene);
    }

    setMinSize(minWidth, minHeight) {
        this.setMinWidth(minWidth).setMinHeight(minHeight);
        return this;
    }

    setMinWidth(minWidth) {
        if (minWidth == null) {
            minWidth = 0;
        }
        this.minWidth = minWidth;
        return this;
    }

    setMinHeight(minHeight) {
        if (minHeight == null) {
            minHeight = 0;
        }
        this.minHeight = minHeight;
        return this;
    }

    get childrenWidth() {
        if (this._childrenWidth === undefined) {
            this._childrenWidth = this.getChildrenWidth();
        }
        return this._childrenWidth;
    }

    get childrenHeight() {
        if (this._childrenHeight === undefined) {
            this._childrenHeight = this.getChildrenHeight();
        }
        return this._childrenHeight;
    }

    get left() {
        return this.x - (this.displayWidth * this.originX);
    }

    set left(value) {
        this.x += (value - this.left);
    }

    alignLeft(value) {
        this.left = value;
        return this;
    }

    get right() {
        return (this.x - (this.displayWidth * this.originX)) + this.displayWidth;
    }

    set right(value) {
        this.x += (value - this.right);
    }

    alignRight(value) {
        this.right = value;
        return this;
    }

    get centerX() {
        return (this.left + this.right) / 2;
    }

    set centerX(value) {
        this.x += (value - this.centerX);
    }

    alignCenterX(value) {
        this.centerX = value;
        return this;
    }

    get top() {
        return this.y - (this.displayHeight * this.originY);
    }

    set top(value) {
        this.y += (value - this.top);
    }

    alignTop(value) {
        this.top = value;
        return this;
    }

    get bottom() {
        return (this.y - (this.displayHeight * this.originY)) + this.displayHeight;
    }

    set bottom(value) {
        this.y += (value - this.bottom);
    }

    alignBottom(value) {
        this.bottom = value;
        return this;
    }

    get centerY() {
        return (this.top + this.bottom) / 2;
    }

    set centerY(value) {
        this.y += (value - this.centerY);
    }

    alignCenterY(value) {
        this.centerY = value;
        return this;
    }

    pin(gameObject) {
        super.add(gameObject);
        return this;
    }

    addBackground(gameObject) {
        if (this.backgroundChildren === undefined) {
            this.backgroundChildren = [];
        }

        super.add(gameObject);

        var config = this.getSizerConfig(gameObject);
        config.parent = this;
        this.backgroundChildren.push(gameObject);
        return this;
    }
}

Object.assign(
    Base.prototype,
    Methods
);

export default Base;var DrawBounds = function (graphics, color) {
    if (color === undefined) {
        color = 0xffffff;
    }
    var children = this.getAllChildren([this]),
        child;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (!child.getBounds) {
            continue;
        }
        graphics.lineStyle(1, color).strokeRectShape(child.getBounds(globRect));
    }
    return this;
}

var globRect = new Phaser.Geom.Rectangle();

export default DrawBounds;import FadeIn from '../../../plugins/fade-in.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

export default function (duration) {
    if (IsPlainObject(duration)) {
        var config = duration;
        duration = GetValue(config, 'duration', undefined);
    }

    this._fade = FadeIn(this, duration, this._fade);
    return this;
}import FadeOutDestroy from '../../../plugins/fade-out-destroy.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

export default function (duration, destroyMode) {
    if (IsPlainObject(duration)) {
        var config = duration;
        duration = GetValue(config, 'duration', undefined);
        destroyMode = GetValue(config, 'destroy', undefined);
    }
    this._fade = FadeOutDestroy(this, duration, destroyMode, this._fade);
    return this;
};var GetAllChildrenSizers = function (out) {
    if (out === undefined) {
        out = [];
    }
    var startIdx = out.length;
    var children = this.getChildrenSizers(out);
    var endIdx = out.length;
    for (var i = startIdx; i < endIdx; i++) {
        children[i].getAllChildrenSizers(out);
    }

    return out;
}
export default GetAllChildrenSizers;// Override
var GetChildrenHeight = function () {
    return 0;
}

export default GetChildrenHeight;// Override
var GetChildrenSizers = function(out) {
    if (out === undefined) {
        out = [];
    }
    return out;
}
export default GetChildrenSizers;// Override
var GetChildrenWidth = function () {
    return 0;
}

export default GetChildrenWidth;var GetElement = function (mapNameList) {
    if (this.childrenMap === undefined) {
        return undefined;
    }

    if (typeof (mapNameList) === 'string') {
        mapNameList = mapNameList.split('.');
    }
    if (mapNameList.length === 0) {
        return undefined;
    }

    var name = mapNameList.shift(),
        element;
    if (name.charAt(0) === '#') {
        name = name.substring(1);
        var elements = GetAllElements(this.childrenMap, tmpArray);
        for (var i = 0, cnt = elements.length; i < cnt; i++) {
            if (elements[i].name === name) {
                element = elements[i];
                break;
            }
        }
        tmpArray.length = 0;
    } else if (name.indexOf('[') === (-1)) {
        element = this.childrenMap[name];
    } else { // name[]
        var innerMatch = name.match(RE_OBJ);
        if (innerMatch != null) {
            var elements = this.childrenMap[innerMatch[1]];
            if (elements) {
                element = elements[innerMatch[2]];
            }
        }
    }

    if (mapNameList.length === 0) {
        return element;
    } else if (element && element.childrenMap) {
        return element.getElement(mapNameList);
    } else {
        return null;
    }
};

var GetAllElements = function (children, out) {
    if (out === undefined) {
        out = [];
    }
    var child;
    for (var key in children) {
        child = children[key];
        if (child.name !== undefined) {
            out.push(child);
        } else {
            GetAllElements(child, out);
        }
    }
    return out;
}

const RE_OBJ = /(\S+)\[(\d+)\]/i;
var tmpArray = [];

export default GetElement;import GetSizerConfig from '../utils/GetSizerConfig.js';

var GetTopmostSizer = function (gameObject) {
    if (gameObject === undefined) {
        gameObject = this;
    }
    var parent = GetSizerConfig(gameObject).parent;
    while (parent) {
        gameObject = parent;
        parent = GetSizerConfig(gameObject).parent;
    }
    return gameObject;
}

export default GetTopmostSizer;var IsInTouching = function (pointer) {
    if (globRect === undefined) {
        globRect = new Phaser.Geom.Rectangle();
    }
    this.getBounds(globRect);

    if (pointer !== undefined) {
        return globRect.contains(pointer.x, pointer.y);

    } else {
        var inputManager = this.scene.input.manager;
        var pointersTotal = inputManager.pointersTotal;
        var pointers = inputManager.pointers;
        for (var i = 0; i < pointersTotal; i++) {
            pointer = pointers[i];
            if (globRect.contains(pointer.x, pointer.y)) {
                return true;
            }
        }
        return false;

    }

}

var globRect = undefined;

export default IsInTouching;// Override
var Layout = function (parent, newWidth, newHeight) {}
export default Layout;import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;
const ALIGN_CENTER = Phaser.Display.Align.CENTER;

var LayoutBackgrounds = function () {
    if (this.backgroundChildren === undefined) {
        return;
    }
    var backgrounds = this.backgroundChildren;

    var child;
    var x = this.left,
        y = this.top,
        width = this.width,
        height = this.height;

    for (var i = 0, cnt = backgrounds.length; i < cnt; i++) {
        child = backgrounds[i];
        if (child.rexSizer.hidden) {
            continue;
        }
        ResizeGameObject(child, width, height);
        GlobZone.setPosition(x, y).setSize(width, height);
        AlignIn(child, GlobZone, ALIGN_CENTER);
        this.resetChildPositionState(child);
    }
}

export default LayoutBackgrounds;var LayoutInit = function (parent) {
    if (parent) {
        return;
    }

    var children = this.getAllChildrenSizers([this]);
    var child, parent;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (!child.rexSizer) {
            continue;
        }
        child._layoutInit();
    }
}
export default LayoutInit;import GetSizerConfig from '../utils/GetSizerConfig.js';
import PushIntoBounds from './PushIntoBounds.js';
import DrawBounds from './DrawBounds.js';
import AddChildrenMap from './AddChildrenMap.js';
import GetElement from './GetElement.js';
import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetAllChildrenSizers from './GetAllChildrenSizers.js';
import GetChildrenSizers from './GetChildrenSizers.js';
import Layout from './Layout.js';
import LayoutInit from './LayoutInit.js';
import _layoutInit from './_layoutInit.js';

import PopUp from './PopUp.js';
import ScaleDownDestroy from './ScaleDownDestroy.js';
import FadeIn from './FadeIn.js';
import FadeOutDestroy from './FadeOutDestroy.js';
import IsInTouching from './IsInTouching.js';
import GetTopmostSizer from './GetTopmostSizer.js';
import LayoutBackgrounds from './LayoutBackgrounds.js';
import SetDraggable from './SetDraggable.js';

export default {
    getSizerConfig: GetSizerConfig,
    pushIntoBounds: PushIntoBounds,
    drawBounds: DrawBounds,
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    addChildrenMap: AddChildrenMap,
    addElement: AddChildrenMap,
    getElement: GetElement,
    getAllChildrenSizers: GetAllChildrenSizers,
    getChildrenSizers: GetChildrenSizers,
    layout: Layout,
    layoutBackgrounds: LayoutBackgrounds,
    layoutInit: LayoutInit,
    _layoutInit: _layoutInit,

    popUp: PopUp,
    scaleDownDestroy: ScaleDownDestroy,
    fadeIn: FadeIn,
    fadeOutDestroy: FadeOutDestroy,
    isInTouching: IsInTouching,
    getTopmostSizer: GetTopmostSizer,
    setDraggable: SetDraggable,
};import PopUp from '../../../plugins/popup.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

export default function (duration, orientation, ease) {
    if (IsPlainObject(duration)) {
        var config = duration;
        duration = GetValue(config, 'duration', undefined);
        orientation = GetValue(config, 'orientation', undefined);
        ease = GetValue(config, 'ease', undefined);
    }

    this._scale = PopUp(this, duration, orientation, ease, this._scale);
    return this;
};import GetDefaultBounds from '../../../plugins/utils/defaultbounds/GetDefaultBounds.js';

var PushIntoBounds = function (bounds) {
    if (bounds === undefined) {
        bounds = GetDefaultBounds(this.scene);
    }

    this.left = Math.max(this.left, bounds.left);
    this.right = Math.min(this.right, bounds.right);
    this.top = Math.max(this.top, bounds.top);
    this.bottom = Math.min(this.bottom, bounds.bottom);
    return this;
}

export default PushIntoBounds;import ScaleDownDestroy from '../../../plugins/scale-down-destroy.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

export default function (duration, orientation, ease, destroyMode) {
    if (IsPlainObject(duration)) {
        var config = duration;
        duration = GetValue(config, 'duration', undefined);
        orientation = GetValue(config, 'orientation', undefined);
        ease = GetValue(config, 'ease', undefined);
        destroyMode = GetValue(config, 'destroy', undefined);
    }

    this._scale = ScaleDownDestroy(this, duration, orientation, ease, destroyMode, this._scale);
    return this;
}var SetDraggable = function (draggable) {
    if (draggable === undefined) {
        draggable = true;
    }

    if (this.input && this.input.hasOwnProperty('draggable')) {
        // Draggable is already registered
        this.input.draggable = draggable;
    } else if (draggable) {
        // Register draggable
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.on('drag', onDrag, this);
    } else {
        // Not draggable and draggable is not registered yet, do nothing
    }
    return this;
}

var onDrag = function (pointer, dragX, dragY) {
    var topmostParent = this.getTopmostSizer();
    topmostParent.x += (dragX - this.x);
    topmostParent.y += (dragY - this.y);
}

export default SetDraggable;// Override
var _layoutInit = function () {}
export default _layoutInit;import BBCodeText from '../../../plugins/gameobjects/text/bbocdetext/BBCodeText.js';
export default BBCodeText;import BBCodeText from './BBCodeText.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('BBCodeText', function (x, y, text, style) {
    var gameObject = new BBCodeText(this.scene, x, y, text, style);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.BBCodeText', BBCodeText);

export default BBCodeText;import {
    ButtonSetInteractive,
    FireEvent
} from './ButtonSetInteractive.js';
import {
    Show,
    Hide,
    IsShown,
} from '../utils/Hide.js';

export default {
    getButton(index) {
        var button;
        if (typeof (index) === 'number') {
            button = this.childrenMap.buttons[index];
        } else {
            button = index;
            if (this.childrenMap.buttons.indexOf(button) === -1) {
                button = undefined;
            }
        }
        return button;
    },

    emitButtonClick(index) {
        // index or button game object
        FireEvent.call(this, 'button.click', index);
        return this;
    },

    showButton(index) {
        Show(this.getButton(index));
        return this;
    },

    hideButton(index) {
        Hide(this.getButton(index));
        return this;
    },

    isButtonShown(index) {
        IsShown(this.getButton(index));
        return this;
    },

    forEachButtton(callback, scope) {
        var buttons = this.childrenMap.buttons;
        for (var i = 0, cnt = buttons.length; i < cnt; i++) {
            if (scope) {
                callback.call(scope, buttons[i], i, buttons);
            } else {
                callback(buttons[i], i, buttons);
            }
        }
        return this;
    }
}import Sizer from '../sizer/Sizer.js';
import Space from '../utils/Space.js';
import {
    ButtonSetInteractive,
    FireEvent
} from './ButtonSetInteractive.js';
import ButtonMethods from './ButtonMethods.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Buttons extends Sizer {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }
        // Create 
        super(scene, config);
        this.type = 'rexButtons';
        this.eventEmitter = GetValue(config, 'eventEmitter', this);
        this.groupName = GetValue(config, 'groupName', undefined);

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var buttons = GetValue(config, 'buttons', undefined);
        if (buttons && buttons.length === 0) {
            buttons = undefined;
        }

        // Space
        var buttonSpace = GetValue(config, 'space', 0);

        if (background) {
            this.addBackground(background);
        }

        if (buttons) {
            var buttonsAlign = GetValue(config, 'align', undefined); // undefined/left/top: no space
            var clickConfig = GetValue(config, 'click', undefined);

            // Add space
            if (
                (buttonsAlign === 'right') ||
                (buttonsAlign === 'bottom') ||
                (buttonsAlign === 'center')
            ) {
                this.add(Space(scene), 1, 'center', 0, false);
            }

            var button, padding;
            for (var i = 0, cnt = buttons.length; i < cnt; i++) {
                button = buttons[i];
                // Add to sizer
                if (this.orientation === 0) {
                    padding = {
                        left: (i >= 1) ? buttonSpace : 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                } else {
                    padding = {
                        left: 0,
                        right: 0,
                        top: (i >= 1) ? buttonSpace : 0,
                        bottom: 0
                    }
                }
                this.add(button, 0, 'center', padding, true);
                ButtonSetInteractive.call(this, button, clickConfig);
            }

            // Add space
            if (buttonsAlign === 'center') {
                this.add(Space(scene), 1, 'center', 0, false);
            }
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('buttons', (buttons) ? buttons : []);
    }
}

Object.assign(
    Buttons.prototype,
    ButtonMethods,
);

export default Buttons;import ButtonBehavior from '../../../plugins/input/button/Button.js';

var ButtonSetInteractive = function (button, clickConfig) {
    //Default: Fire 'click' event when touch released after pressed.
    button._buttonBehavior = new ButtonBehavior(button, clickConfig);

    button._buttonBehavior.on('click', function (buttonBehavior, gameObject, pointer) {
        FireEvent.call(this, 'button.click', button, pointer);
    }, this);

    button
        .on('pointerover', function (pointer) {
            FireEvent.call(this, 'button.over', button, pointer);
        }, this)
        .on('pointerout', function (pointer) {
            FireEvent.call(this, 'button.out', button, pointer);
        }, this)
}

var FireEvent = function (eventName, button, pointer) {
    var index;
    if (typeof (button) === 'number') {
        index = button;
        button = this.childrenMap.buttons[index];
        if (!button) {
            return;
        }
    } else {
        index = this.childrenMap.buttons.indexOf(button);
        if (index === -1) {
            return;
        }
    }

    if (this.groupName !== undefined) {
        this.eventEmitter.emit(eventName, button, this.groupName, index, pointer);
    } else {
        this.eventEmitter.emit(eventName, button, index, pointer);
    }
}

export {
    ButtonSetInteractive,
    FireEvent
};import Buttons from './Buttons.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('buttons', function (config) {
    var gameObject = new Buttons(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Buttons', Buttons);

export default Buttons;import Canvas from '../../../plugins/gameobjects/canvas/Canvas.js';
import SetChart from './SetChart.js';
import GetChartDataset from './GetChartDataset.js';
import GetChartData from './GetChartData.js';
import SetChartData from './SetChartData.js';
import UpdateChart from './UpdateChart.js';

// This plugin does not contain chart.js
// Load chart.js in preload stage -
// scene.load.script('chartjs', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js');

class Chart extends Canvas {
    constructor(scene, x, y, width, height, config) {
        super(scene, x, y, width, height);
        this.type = 'rexChart';
        this.chart = undefined;

        if (config !== undefined) {
            this.setChart(config);
        }
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
        super.destroy(fromScene);
    }

    resize(width, height) {
        if ((width === this.width) && (height === this.height)) {
            return this;
        }

        super.resize(width, height);

        if (this.chart) {
            var chart = this.chart;
            chart.height = this.canvas.height;
            chart.width = this.canvas.width;
            chart.aspectRatio = (chart.height) ? chart.width / chart.height : null;
            chart.update();
        }
        return this;
    }
}

var methods = {
    setChart: SetChart,
    getChartDataset: GetChartDataset,
    getChartData: GetChartData,
    setChartData: SetChartData,
    updateChart: UpdateChart,
}
Object.assign(
    Chart.prototype,
    methods
);

export default Chart;import Chart from './Chart.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('chart', function (x, y, width, height, config) {
    var gameObject = new Chart(this.scene, x, y, width, height, config);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Chart', Chart);

export default Chart;var GetChartData = function (datasetIndex, dataIndex) {
    var dataset = this.getChartDataset(datasetIndex);
    if (dataset === undefined) {
        return undefined;
    }
    if (typeof (dataIndex) === 'string') {
        var labels = this.chart.data.labels;
        dataIndex = labels.indexOf(dataIndex);
        if (dataIndex === -1) {
            return undefined;
        }
    }
    return dataset.data[dataIndex];
}
export default GetChartData;var GetChartDataset = function (datasetIndex) {
    if (this.chart === undefined) {
        return undefined;
    }

    if (typeof (datasetIndex) === 'string') {
        var datasets = this.chart.data.datasets, dataset;
        for (var i = 0, cnt = datasets.length; i < cnt; i++) {
            dataset = datasets[i];
            if (dataset.label === datasetIndex) {
                return dataset;
            }
        }
    } else {
        return this.chart.data.datasets[datasetIndex];
    }

    return undefined;
}

export default GetChartDataset;var SetChart = function (config) {
    if (!window.Chart) {
        var msg = `Can not find chartjs! Load chartjs in preload stage.
scene.load.script('chartjs', 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js');`
        console.error(msg);
        return this;
    }

    if (this.chart) {
        this.chart.destroy();        
    }
    this.chart = new Chart(this.context, FillConfig(this, config));
    return this;
}

var FillConfig = function (canvas, config) {
    // Get options
    if (config === undefined) {
        config = {};
    }
    if (config.options === undefined) {
        config.options = {};
    }
    var options = config.options;

    // Fill options
    options.responsive = false;
    options.maintainAspectRatio = false;
    if (!options.hasOwnProperty('devicePixelRatio')) {
        options.devicePixelRatio = 1;
    }

    // Get animation config
    var noAnimation = false;
    if (options.animation === undefined) {
        options.animation = {};
    } else if (options.animation === false) {
        noAnimation = true;
        options.animation = {};
    }
    var animationConfig = options.animation;

    // Fill animation config
    if (noAnimation) {
        animationConfig.duration = 0;
    }

    var onProgress = animationConfig.onProgress;
    animationConfig.onProgress = function (animation) {
        if (onProgress) {
            onProgress(animation);
        }
        canvas.needRedraw();
    }

    var onComplete = animationConfig.onComplete;
    animationConfig.onComplete = function (animation) {
        if (onComplete) {
            onComplete(animation);
        }
        canvas.needRedraw();
    }
    return config;
}

export default SetChart;var SetChartData = function (datasetIndex, dataIndex, value) {
    if (this.chart === undefined) {
        return this;
    }

    var dataset = this.getChartDataset(datasetIndex);
    if (typeof (dataIndex) === 'string') {
        var labels = this.chart.data.labels;
        dataIndex = labels.indexOf(dataIndex);
        if (dataIndex === -1) {
            return this;
        }
    }
    dataset.data[dataIndex] = value;
    return this;
};
export default SetChartData;
var UpdateChart = function () {
    if (this.chart === undefined) {
        return this;
    }
    this.chart.update();
}
export default UpdateChart;import Container from '../../../plugins/gameobjects/containerlite/ContainerLite.js';
export default Container;import Container from './Container.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('container', function (x, y, width, height, children) {
    var gameObject = new Container(this.scene, x, y, width, height, children);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Container', Container);

export default Container;export default {
    getChoice(index) {
        return this.childrenMap.choicesSizer.getButton(index);
    },

    getAction(index) {
        return this.childrenMap.actionsSizer.getButton(index);
    },

    emitChoiceClick(index) {
        this.childrenMap.choicesSizer.emitButtonClick(index);
        return this;
    },

    emitActionClick(index) {
        this.childrenMap.actionsSizer.emitButtonClick(index);
        return this;
    },

    showChoice(index) {
        this.childrenMap.choicesSizer.showButton(index);
        return this;
    },

    showAction(index) {
        this.childrenMap.actionsSizer.showButton(index);
        return this;
    },

    hideChoice(index) {
        this.childrenMap.choicesSizer.hideButton(index);
        return this;
    },

    hideAction(index) {
        this.childrenMap.actionsSizer.hideButton(index);
        return this;
    },

    forEachChoice(callback, scope) {
        this.childrenMap.choicesSizer.forEachButtton(callback, scope);
        return this;
    },

    forEachChoice(callback, scope) {
        this.childrenMap.choicesSizer.forEachButtton(callback, scope);
        return this;
    },

    forEachAction(callback, scope) {
        this.childrenMap.actionsSizer.forEachButtton(callback, scope);
        return this;
    }
};import Sizer from '../sizer/Sizer.js';
import Buttons from '../buttons/Buttons.js';
import Space from '../utils/Space.js';
import ButtonMethods from './ButtonMethods.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Dialog extends Sizer {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }
        // Create sizer        
        config.orientation = 1; // Top to bottom
        super(scene, config);
        this.type = 'rexDialog';
        this.eventEmitter = GetValue(config, 'eventEmitter', this);

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var title = GetValue(config, 'title', undefined);
        var toolbar = GetValue(config, 'toolbar', undefined);
        if (toolbar && toolbar.length === 0) {
            toolbar = undefined;
        }
        var content = GetValue(config, 'content', undefined);
        var description = GetValue(config, 'description', undefined);
        var choicesSizer;
        var choices = GetValue(config, 'choices', undefined);
        if (choices && choices.length === 0) {
            choices = undefined;
        }
        var actionsSizer;
        var actions = GetValue(config, 'actions', undefined);
        if (actions && actions.length === 0) {
            actions = undefined;
        }
        var clickConfig = GetValue(config, 'click', undefined);

        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);

        if (background) {
            this.addBackground(background);
        }

        // title only
        if (title && !toolbar) {
            var align = GetValue(config, 'align.title', 'center');
            var titleSpace = GetValue(config, 'space.title', 0);
            var padding = {
                left: paddingLeft,
                right: paddingRight,
                top: paddingTop,
                bottom: (content || description || choices || actions) ? titleSpace : paddingBottom
            }
            var expand = GetValue(config, 'expand.title', true);
            this.add(title, 0, align, padding, expand);
        }

        var toolbarSizer;
        if (toolbar) {
            toolbarSizer = new Buttons(scene, {
                groupName: 'toolbar',
                buttons: toolbar,
                orientation: 0, // Left-right
                space: GetValue(config, 'space.toolbarItem', 0),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
        }

        // toolbar only
        if (toolbar && !title) {
            var titleSpace = GetValue(config, 'space.title', 0);
            var padding = {
                left: paddingLeft,
                right: paddingRight,
                top: paddingTop,
                bottom: (content || description || choices || actions) ? titleSpace : paddingBottom
            }
            var expand = GetValue(config, 'expand.toolbar', true);
            this.add(toolbarSizer, 0, 'center', padding, expand);
        }

        // tilte and toolbar
        if (title && toolbar) {
            var titleSizer = new Sizer(scene, {
                orientation: 0
            });
            // Add title
            var align = GetValue(config, 'align.title', 'left');
            var expand = GetValue(config, 'expand.title', true);
            // Add space if not expand
            if (
                !expand &&
                ((align === 'right') || (align === 'center'))
            ) {
                titleSizer.add(Space(scene), 1, 'center', 0, false);
            }
            var padding = {
                left: GetValue(config, 'space.titleLeft', 0),
                right: GetValue(config, 'space.titleRight', 0),
                top: 0,
                bottom: 0
            }
            titleSizer.add(title, (expand) ? 1 : 0, 'center', padding, expand);
            // Add space if not expand
            if (
                !expand &&
                ((align === 'left') || (align === 'center'))
            ) {
                titleSizer.add(Space(scene), 1, 'center', 0, false);
            }
            // Add toolbar
            titleSizer.add(toolbarSizer, 0, 'right', 0, false);
            // Add sizer to dialog
            var titleSpace = GetValue(config, 'space.title', 0);
            var padding = {
                left: paddingLeft,
                right: paddingRight,
                top: paddingTop,
                bottom: (content || description || choices || actions) ? titleSpace : paddingBottom
            };
            this.add(titleSizer, 0, 'center', padding, true);
        }

        if (content) {
            var align = GetValue(config, 'align.content', 'center');
            var contentSpace = GetValue(config, 'space.content', 0);
            var padding = {
                left: paddingLeft + GetValue(config, 'space.contentLeft', 0),
                right: paddingRight + GetValue(config, 'space.contentRight', 0),
                top: (title || toolbar) ? 0 : paddingTop,
                bottom: (description || choices || actions) ? contentSpace : paddingBottom
            }
            var expand = GetValue(config, 'expand.content', true);
            this.add(content, 0, align, padding, expand);
        }

        if (description) {
            var align = GetValue(config, 'align.description', 'center');
            var descriptionSpace = GetValue(config, 'space.description', 0);
            var padding = {
                left: paddingLeft + GetValue(config, 'space.descriptionLeft', 0),
                right: paddingRight + GetValue(config, 'space.descriptionRight', 0),
                top: (title || toolbar || content) ? 0 : paddingTop,
                bottom: (choices || actions) ? descriptionSpace : paddingBottom
            }
            var expand = GetValue(config, 'expand.description', true);
            this.add(description, 0, align, padding, expand);
        }

        if (choices) {
            var align = GetValue(config, 'align.choices', 'center');
            choicesSizer = new Buttons(scene, {
                groupName: 'choices',
                buttons: choices,
                orientation: 1, // Top-Bottom
                space: GetValue(config, 'space.choice', 0),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
            var choicesSpace = GetValue(config, 'space.choices', 0);
            var padding = {
                left: paddingLeft + GetValue(config, 'space.choicesLeft', 0),
                right: paddingRight + GetValue(config, 'space.choicesRight', 0),
                top: (title || toolbar || content || description) ? 0 : paddingTop,
                bottom: (actions) ? choicesSpace : paddingBottom
            }
            var expand = GetValue(config, 'expand.choices', true);
            this.add(choicesSizer, 0, align, padding, expand);
        }

        if (actions) {
            actionsSizer = new Buttons(scene, {
                groupName: 'actions',
                buttons: actions,
                orientation: 0, // Left-right
                space: GetValue(config, 'space.action', 0),
                align: GetValue(config, 'align.actions', 'center'),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            })
            var padding = {
                left: paddingLeft + GetValue(config, 'space.actionsLeft', 0),
                right: paddingRight + GetValue(config, 'space.actionsRight', 0),
                top: (title || toolbar || content || description || choices) ? 0 : paddingTop,
                bottom: paddingBottom
            }
            var expand = GetValue(config, 'expand.actions', true);
            this.add(actionsSizer, 0, 'center', padding, expand);
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('title', title);
        this.addChildrenMap('toolbar', toolbar);
        this.addChildrenMap('content', content);
        this.addChildrenMap('choices', choices);
        this.addChildrenMap('actions', actions);
        this.addChildrenMap('choicesSizer', choicesSizer);
        this.addChildrenMap('actionsSizer', actionsSizer);
    }
}

Object.assign(
    Dialog.prototype,
    ButtonMethods,
);

export default Dialog;import Dialog from './Dialog.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('dialog', function (config) {
    var gameObject = new Dialog(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Dialog', Dialog);

export default Dialog;import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';
import GetBoundsConfig from '../utils/GetBoundsConfig.js';
import ORIENTATIONMODE from '../utils/OrientationConst.js';
import GetMaxChildWidth from './GetMaxChildWidth.js';
import GetMaxChildHeight from './GetMaxChildHeight.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;
const RemoveItem = Phaser.Utils.Array.Remove;
const ALIGN_CENTER = Phaser.Display.Align.CENTER;

class FixWidthSizer extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, orientation, space) {
        var config;
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(orientation)) {
            config = orientation;
        } else if (IsPlainObject(space)) {
            config = space;
        }

        if (config !== undefined) {
            orientation = GetValue(config, 'orientation', 0);
            space = GetValue(config, 'space', config);
        }
        if (orientation === undefined) {
            orientation = 0;
        }
        if (space === undefined) {
            space = 0;
        }
        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexFixWidthSizer';
        this.sizerChildren = [];
        this.setOrientation(orientation);
        this.setPadding(space);
        this.setItemSpacing(GetValue(space, 'item', 0));
        this.setLineSpacing(GetValue(space, 'line', 0));
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.sizerChildren.length = 0;
        super.destroy(fromScene);
    }

    setOrientation(orientation) {
        if (typeof (orientation) === 'string') {
            orientation = ORIENTATIONMODE[orientation];
        }
        this.orientation = orientation;
        return this;
    }

    setPadding(paddingConfig) {
        this.padding = GetBoundsConfig(paddingConfig, this.padding);
        return this;
    }

    setItemSpacing(space) {
        this.itemSpacing = space;
        return this;
    }

    setLineSpacing(space) {
        this.lineSpacing = space;
        return this;
    }

    add(gameObject, paddingConfig) {
        super.add(gameObject);

        if (paddingConfig === undefined) {
            paddingConfig = 0;
        }

        var config = this.getSizerConfig(gameObject);
        config.parent = this;
        config.align = ALIGN_CENTER;
        config.padding = GetBoundsConfig(paddingConfig);
        this.sizerChildren.push(gameObject);
        return this;
    }

    insert(index, gameObject, paddingConfig, expand) {
        this.add(gameObject, paddingConfig, expand);
        this.moveTo(gameObject, index);
        return this;
    }

    remove(gameObject) {
        var config = this.getSizerConfig(gameObject);
        if (config.parent !== this) {
            return this;
        }
        config.parent = undefined;
        RemoveItem(this.sizerChildren, gameObject);
        super.remove(gameObject);
        return this;
    }

    get maxChildWidth() {
        if (this._maxChildWidth === undefined) {
            this._maxChildWidth = GetMaxChildWidth.call(this);
        }
        return this._maxChildWidth;
    }

    get maxChildHeight() {
        if (this._maxChildHeight === undefined) {
            this._maxChildHeight = GetMaxChildHeight.call(this);
        }
        return this._maxChildHeight;
    }
}

Object.assign(
    FixWidthSizer.prototype,
    Methods
);

export default FixWidthSizer;import FixWidthSizer from './FixWidthSizer.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('fixWidthSizer', function (x, y, minWidth, minHeight, orientation, space) {
    var gameObject = new FixWidthSizer(this.scene, x, y, minWidth, minHeight, orientation, space);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.FixWidthSizer', FixWidthSizer);

export default FixWidthSizer;var GetChildHeight = function (child) {
    var padding = child.rexSizer.padding;
    return child.height + padding.top + padding.bottom;
}
export default GetChildHeight;var GetChildrenHeight = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result;
    if (this.orientation === 0) { // x
        result = 0;
    } else { // y
        result = this.maxChildHeight;
    }
    result = Math.max(result, this.minHeight);
    return result;
}

export default GetChildrenHeight;var GetChildrenSizers = function(out) {
    if (out === undefined) {
        out = [];
    }
    var children = this.sizerChildren,
        child;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child.isRexSizer) {
            out.push(child);
        }
    }
    return out;
}
export default GetChildrenSizers;var GetChildrenWidth = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result;
    if (this.orientation === 0) { // x
        result = this.maxChildWidth;
    } else { // y
        result = 0;
    }
    result = Math.max(result, this.minWidth);
    return result;
}

export default GetChildrenWidth;var GetChildWidth = function (child) {
    var padding = child.rexSizer.padding;
    return child.width + padding.left + padding.right;
}
export default GetChildWidth;import GetChildHeight from './GetChildHeight.js';

var GetMaxChildHeight = function (children) {
    if (children === undefined) {
        children = this.sizerChildren;
    }
    var result = 0;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        result = Math.max(result, GetChildHeight(children[i]));
    }
    return result;
}
export default GetMaxChildHeight;import GetChildWidth from './GetChildWidth.js';

var GetMaxChildWidth = function (children) {
    if (children === undefined) {
        children = this.sizerChildren;
    }
    var result = 0;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        result = Math.max(result, GetChildWidth(children[i]));
    }
    return result;
}
export default GetMaxChildWidth;import RunChildrenWrap from './RunChildrenWrap.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent, newWidth, newHeight) {
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    // Set size
    if (newWidth === undefined) {
        var padding = this.padding;
        newWidth = Math.max(this.maxChildWidth + padding.left + padding.right, this.minWidth);
    }
    if (newHeight === undefined) {
        var padding = this.padding;
        newHeight = Math.max(this.maxChildHeight + padding.top + padding.bottom, this.minHeight);
    }

    var lineInnerWidth, padding = this.padding;
    if (this.orientation === 0) { // x
        lineInnerWidth = newWidth - padding.left - padding.right;
    } else { // y
        lineInnerWidth = newHeight - padding.top - padding.bottom;
    }
    var wrapResult = RunChildrenWrap.call(this, lineInnerWidth);
    // Expanded height is less then min-lines-height
    if (this.orientation === 0) { // x
        newHeight = Math.max(newHeight, wrapResult.height + padding.top + padding.bottom);
    } else { // y
        newWidth = Math.max(newWidth, wrapResult.height + left + padding.right);
    }
    this.resize(newWidth, newHeight);

    // Layout children    
    var child, childConfig, padding;
    var startX = this.left,
        startY = this.top;
    var itemX, itemY;
    var x, y, width, height; // Align zone

    // Layout each line
    var lines = wrapResult.lines;
    var line, lineChlidren;
    if (this.orientation === 0) { // x
        itemX = startX
        itemY = startY + this.padding.top;
    } else {
        itemX = startX + this.padding.left;
        itemY = startY
    }
    for (var i = 0, icnt = lines.length; i < icnt; i++) {
        line = lines[i];
        lineChlidren = line.children;

        for (var j = 0, jcnt = lineChlidren.length; j < jcnt; j++) {
            child = lineChlidren[j];
            childConfig = child.rexSizer;
            padding = childConfig.padding;
            if (this.orientation === 0) { // x
                x = (itemX + padding.left);
                if (j === 0) {
                    x += this.padding.left;
                } else {
                    x += this.itemSpacing;
                }

                y = (itemY + padding.top);
                width = child.width;
                height = child.height;
                itemX = x + child.width + padding.right;
            } else { // y
                x = (itemX + padding.left);

                y = (itemY + padding.top);
                if (j === 0) {
                    y += this.padding.top;
                } else {
                    y += this.itemSpacing;
                }

                width = child.width;
                height = child.height;
                itemY = y + child.height + padding.bottom;
            }

            GlobZone.setPosition(x, y).setSize(width, height);
            AlignIn(child, GlobZone, childConfig.align);
            this.resetChildPositionState(child);
        }

        if (this.orientation === 0) { // x
            itemX = startX;
            itemY += line.height + this.lineSpacing;
        } else { // y
            itemX += line.height + this.lineSpacing;
            itemY = startY;
        }
    }

    // Layout background children
    this.layoutBackgrounds();

    return this;
}

export default Layout;import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetChildrenSizers from './GetChildrenSizers.js';
import Layout from './Layout.js';

export default {
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    getChildrenSizers: GetChildrenSizers,
    layout: Layout,
};import GetWidth from './GetChildWidth.js';
import GetHeight from './GetChildHeight.js';

var RunChildrenWrap = function (lineWidth) {
    var result = {
        lines: [],
        width: 0,
        height: 0
    };
    var children = this.sizerChildren;
    var child, childWidth, remainder = 0;
    var lastLine, lines = result.lines;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child.rexSizer.hidden) {
            continue;
        }

        if (child.isRexSizer) {
            child.layout(); // Use original size
        }

        childWidth = GetChildWidth(child, this.orientation);
        // New line
        if (remainder < childWidth) {
            if (lastLine) {
                var curLineWidth = lineWidth - (remainder + this.itemSpacing);
                result.width = Math.max(result.width, curLineWidth);
                result.height += lastLine.height + this.lineSpacing;
            }

            lastLine = {
                children: [],
                remainder: 0,
                height: 0
            };
            lines.push(lastLine);
            remainder = lineWidth;
        }

        remainder -= childWidth + this.itemSpacing;
        lastLine.children.push(child);
        lastLine.remainder = remainder;
        lastLine.height = Math.max(lastLine.height, GeChildHeight(child, this.orientation));
    }

    if (lastLine) {
        result.height += lastLine.height;
    }
    return result;
}

var GetChildWidth = function (child, orientation) {
    return (orientation === 0) ? GetWidth(child) : GetHeight(child);
}

var GeChildHeight = function (child, orientation) {
    return (orientation === 0) ? GetHeight(child) : GetWidth(child);
}

export default RunChildrenWrap;var GetChildrenHeight = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result = 0,
        rowHeight;
    var children = this.gridChildren;
    var child, padding, childHeight, proportion;

    for (var i = 0; i < this.rowCount; i++) {
        proportion = this.rowProportions[i];
        rowHeight = 0;
        if ((proportion === undefined) || (proportion === 0)) {
            for (var j = 0; j < this.columnCount; j++) {
                child = children[(i * this.columnCount) + j];
                if (!child) {
                    continue;
                }
                if (child.rexSizer.hidden) {
                    continue;
                }

                childHeight = (child.isRexSizer) ?
                    Math.max(child.minHeight, child.childrenHeight) :
                    child.height;
                padding = child.rexSizer.padding;
                childHeight += (padding.top + padding.bottom);
                rowHeight = Math.max(rowHeight, childHeight);
            }
            result += rowHeight;
        }
        this.rowHeight[i] = rowHeight;
    }
    return result;
}

export default GetChildrenHeight;var GetChildrenSizers = function (out) {
    if (out === undefined) {
        out = [];
    }
    var children = this.gridChildren,
        child;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child && child.isRexSizer) {
            out.push(child);
        }
    }
    return out;
}
export default GetChildrenSizers;var GetChildrenWidth = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result = 0,
        columnWidth;
    var children = this.gridChildren;
    var child, padding, childWidth, proportion;

    for (var i = 0; i < this.columnCount; i++) {
        proportion = this.columnProportions[i];
        columnWidth = 0;
        if ((proportion === undefined) || (proportion === 0)) {
            for (var j = 0; j < this.rowCount; j++) {
                child = children[(j * this.columnCount) + i];
                if (!child) {
                    continue;
                }
                if (child.rexSizer.hidden) {
                    continue;
                }

                childWidth = (child.isRexSizer) ?
                    Math.max(child.minWidth, child.childrenWidth) :
                    child.width;
                padding = child.rexSizer.padding;
                childWidth += (padding.left + padding.right);
                columnWidth = Math.max(columnWidth, childWidth);
            }
            result += columnWidth;
        }
        this.columnWidth[i] = columnWidth;
    }
    return result;
}

export default GetChildrenWidth;var GetExpandedChildHeight = function (child, rowHeight) {
    var newHeight;
    var childConfig = child.rexSizer;    
    if (childConfig.expand) {
        var padding = childConfig.padding;
        newHeight = rowHeight - padding.top - padding.bottom;
    }
    return newHeight;
}

export default GetExpandedChildHeight;var GetExpandedChildWidth = function (child, colWidth) {
    var newWidth;
    var childConfig = child.rexSizer;    
    if (childConfig.expand) {
        var padding = childConfig.padding;
        newWidth = colWidth - padding.left - padding.right;
    }
    return newWidth;
}

export default GetExpandedChildWidth;import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';
import GetBoundsConfig from '../utils/GetBoundsConfig.js';
import ALIGNMODE from '../utils/AlignConst.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;
const RemoveItem = Phaser.Utils.Array.Remove;
const ALIGN_CENTER = Phaser.Display.Align.CENTER;

class GridSizer extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, columnCount, rowCount, columnProportions, rowProportions) {
        var config;
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
            columnProportions = GetValue(config, 'columnProportions', undefined);
            rowProportions = GetValue(config, 'rowProportions', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
            columnProportions = GetValue(config, 'columnProportions', undefined);
            rowProportions = GetValue(config, 'rowProportions', undefined);
        } else if (IsPlainObject(columnCount)) {
            config = columnCount;
            columnCount = GetValue(config, 'column', 0);
            rowCount = GetValue(config, 'row', 0);
            columnProportions = GetValue(config, 'columnProportions', undefined);
            rowProportions = GetValue(config, 'rowProportions', undefined);
        } else if (IsPlainObject(columnProportions)) {
            config = columnProportions;
            columnProportions = GetValue(config, 'columnProportions', undefined);
            rowProportions = GetValue(config, 'rowProportions', undefined);
        }
        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexGridSizer';
        this.initialGrid(columnCount, rowCount, columnProportions, rowProportions);

    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.gridChildren.length = 0;
        super.destroy(fromScene);
    }

    setColumnProportion(columnIndex, proportion) {
        if (columnIndex >= this.columnProportions.length) {
            return this;
        }
        this.columnProportions[columnIndex] = proportion;
        return this;
    }

    setRowProportion(rowIndex, proportion) {
        if (rowIndex >= this.rowProportions.length) {
            return this;
        }
        this.rowProportions[rowIndex] = proportion;
        return this;
    }

    add(gameObject, columnIndex, rowIndex, align, paddingConfig, expand) {
        super.add(gameObject);
        if (IsPlainObject(columnIndex)) {
            var config = columnIndex;
            columnIndex = GetValue(config, 'column', 0);
            rowIndex = GetValue(config, 'row', 0);
            align = GetValue(config, 'align', ALIGN_CENTER);
            paddingConfig = GetValue(config, 'padding', 0);
            expand = GetValue(config, 'expand', false);
        }
        if (typeof (align) === 'string') {
            align = ALIGNMODE[align];
        }
        if (align === undefined) {
            align = ALIGN_CENTER;
        }
        if (paddingConfig === undefined) {
            paddingConfig = 0;
        }
        if (expand === undefined) {
            expand = true;
        }

        var config = this.getSizerConfig(gameObject);
        config.parent = this;
        config.align = align;
        config.padding = GetBoundsConfig(paddingConfig);
        config.expand = expand;
        this.gridChildren[(rowIndex * this.columnCount) + columnIndex] = gameObject;
        return this;
    }

    remove(gameObject) {
        var config = this.getSizerConfig(gameObject);
        if (config.parent !== this) {
            return this;
        }
        config.parent = undefined;
        RemoveItem(this.gridChildren, gameObject);

        if (this.backgroundChildren !== undefined) {
            RemoveItem(this.backgroundChildren, gameObject);
        }
        super.remove(gameObject);
        return this;
    }

    get totalColumnProportions() {
        var result = 0,
            proportion;
        for (var i = 0; i < this.columnCount; i++) {
            proportion = this.columnProportions[i];
            if (proportion > 0) {
                result += proportion;
            }
        }
        return result;
    }

    get totalRowProportions() {
        var result = 0,
            proportion;
        for (var i = 0; i < this.rowCount; i++) {
            proportion = this.rowProportions[i];
            if (proportion > 0) {
                result += proportion;
            }
        }
        return result;
    }

    initialGrid(columnCount, rowCount, columnProportions, rowProportions) {
        this.columnCount = columnCount;
        this.rowCount = rowCount;
        this.gridChildren = [];
        this.gridChildren.length = columnCount * rowCount;
        this.columnProportions = [];
        this.columnProportions.length = columnCount;
        this.columnWidth = [];
        this.columnWidth.length = columnCount;
        this.rowProportions = [];
        this.rowProportions.length = rowCount;
        this.rowHeight = [];
        this.rowHeight.length = rowCount;

        if (columnProportions) {
            var columnProportionsIsNumber = (typeof (columnProportions) === 'number');
            for (var i = 0; i < columnCount; i++) {
                if (columnProportionsIsNumber) {
                    this.setColumnProportion(i, columnProportions);
                } else {
                    var columnProportion = columnProportions[i];
                    if (columnProportion > 0) {
                        this.setColumnProportion(i, columnProportion);
                    }
                }
            }
        }
        if (rowProportions) {
            var rowProportionsIsNumber = (typeof (rowProportions) === 'number');
            for (var i = 0; i < rowCount; i++) {
                if (rowProportionsIsNumber) {
                    this.setRowProportion(i, rowProportions);
                } else {
                    var rowProportion = rowProportions[i];
                    if (rowProportion > 0) {
                        this.setRowProportion(i, rowProportion);
                    }
                }
            }
        }

        return this;
    }
}

Object.assign(
    GridSizer.prototype,
    Methods
);

export default GridSizer;import GridSizer from './GridSizer.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('gridSizer', function (x, y, minWidth, minHeight, columnCount, rowCount, columnProportions, rowProportion) {
    var gameObject = new GridSizer(this.scene, x, y, minWidth, minHeight, columnCount, rowCount, columnProportions, rowProportion);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.GridSizer', GridSizer);

export default GridSizer;import GetExpandedChildWidth from './GetExpandedChildWidth.js';
import GetExpandedChildHeight from './GetExpandedChildHeight.js';
import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent, newWidth, newHeight) {
    // Skip invisible sizer
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    var totalColumnProportions = this.totalColumnProportions;
    var totalRowProportions = this.totalRowProportions;

    // Set size
    if (newWidth === undefined) {
        if (parent && (totalColumnProportions > 0)) { // Expand to parent width
            var padding = this.rexSizer.padding;
            newWidth = parent.width - padding.left - padding.right;
        } else {
            newWidth = Math.max(this.childrenWidth, this.minWidth);
        }
    }
    if (newHeight === undefined) {
        if (parent && (totalRowProportions > 0)) { // Expand to parent height
            var padding = this.rexSizer.padding;
            newHeight = parent.height - padding.top - padding.bottom;
        } else {
            newHeight = Math.max(this.childrenHeight, this.minHeight);
        }
    }
    this.resize(newWidth, newHeight);

    var proportionWidthLength;
    if (totalColumnProportions > 0) {
        proportionWidthLength = (this.width - this.childrenWidth) / totalColumnProportions;
    } else {
        proportionWidthLength = 0;
    }
    var proportionHeightLength;
    if (totalRowProportions > 0) {
        proportionHeightLength = (this.height - this.childrenHeight) / totalRowProportions;
    } else {
        proportionHeightLength = 0;
    }

    // Layout children
    var child, childConfig, padding;
    var startX = this.left,
        startY = this.top;
    var itemX = startX,
        itemY = startY;
    var x, y, width, height; // Align zone
    var childWidth, childHeight;
    // Layout grid children
    var colProportion, rowProportion,
        colWidth, rowHeight;
    for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
        rowProportion = this.rowProportions[rowIndex] || 0;
        rowHeight = (rowProportion === 0) ? this.rowHeight[rowIndex] : (rowProportion * proportionHeightLength);

        itemX = startX;
        for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
            colProportion = this.columnProportions[columnIndex] || 0;
            colWidth = (colProportion === 0) ? this.columnWidth[columnIndex] : (colProportion * proportionWidthLength);

            child = this.gridChildren[(rowIndex * this.columnCount) + columnIndex];
            if ((!child) || (child.rexSizer.hidden)) {
                itemX += colWidth;
                continue;
            }

            childWidth = GetExpandedChildWidth(child, colWidth);
            childHeight = GetExpandedChildHeight(child, rowHeight);
            if (child.isRexSizer) {
                child.layout(this, childWidth, childHeight);
            } else {
                ResizeGameObject(child, childWidth, childHeight);
            }

            childConfig = child.rexSizer;
            padding = childConfig.padding;
            x = (itemX + padding.left);
            width = colWidth - padding.left - padding.right;
            y = (itemY + padding.top);
            height = rowHeight - padding.top - padding.bottom;

            GlobZone.setPosition(x, y).setSize(width, height);
            AlignIn(child, GlobZone, childConfig.align);
            this.resetChildPositionState(child);

            itemX += colWidth;
        }

        itemY += rowHeight;
    }


    // Layout background children
    this.layoutBackgrounds();

    return this;
}

export default Layout;import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetChildrenSizers from './GetChildrenSizers.js';
import Layout from './Layout.js';
import _layoutInit from './_layoutInit.js';

export default {
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    getChildrenSizers: GetChildrenSizers,
    layout: Layout,
    _layoutInit: _layoutInit,
};var LayoutInitChild = function () {
    this._childrenWidth = undefined;
    this._childrenHeight = undefined;
}
export default LayoutInitChild;import Scrollable from '../utils/scrollable/Scrollable.js';
import GetScrollMode from '../utils/GetScrollMode.js';
import GridTableCore from '../../../plugins/gameobjects/gridtable/GridTable.js';
import InjectProperties from './InjectProperties.js';
import TableOnCellVisible from './TableOnCellVisible.js';
import TableSetInteractive from './input/TableSetInteractive.js';
import NOOP from '../../../plugins/utils/object/NOOP.js';
import SetItems from './SetItems.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class GridTable extends Scrollable {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        // Create grid table core
        var scrollMode = GetScrollMode(config);
        var tableConfig = GetValue(config, 'table', undefined)
        if (tableConfig === undefined) {
            tableConfig = {};
        }
        tableConfig.scrollMode = scrollMode;
        tableConfig.clamplTableOXY = GetValue(config, 'clamplChildOY', false);
        var tableWidth = GetValue(tableConfig, 'width', undefined);
        var tableHeight = GetValue(tableConfig, 'height', undefined);
        var table = new GridTableCore(scene, 0, 0, tableWidth, tableHeight, tableConfig);
        var proportion, expand;
        if (scrollMode === 0) {
            proportion = (tableWidth === undefined) ? 1 : 0;
            expand = (tableHeight === undefined);
        } else {
            proportion = (tableHeight === undefined) ? 1 : 0;
            expand = (tableWidth === undefined);
        }
        // Inject properties for scrollable interface
        InjectProperties(table);

        // Fill config of scrollable
        config.type = 'rexGridTable';
        config.child = {
            gameObject: table,
            proportion: proportion,
            expand: expand,
        };
        var spaceConfig = GetValue(config, 'space', undefined);
        if (spaceConfig) {
            spaceConfig.child = spaceConfig.table;
        }
        super(scene, config);

        this.addChildrenMap('table', table);

        this.eventEmitter = GetValue(config, 'eventEmitter', this);
        var callback = GetValue(config, 'createCellContainerCallback', NOOP);
        var scope = GetValue(config, 'createCellContainerCallbackScope', undefined);
        this.setCreateCellContainerCallback(callback, scope);

        TableOnCellVisible.call(this, table);

        if (GetValue(tableConfig, 'interactive', true)) {
            TableSetInteractive.call(this, table);
        }
        this.setItems(GetValue(config, 'items', []));
    }

    setCreateCellContainerCallback(callback, scope) {
        this.createCellContainerCallback = callback;
        this.createCellContainerCallbackScope = scope;
        return this;
    }

    refresh() {
        var table = this.childrenMap.child;
        table.updateTable(true);
        return this;
    }
}

var methods = {
    setItems: SetItems
}
Object.assign(
    GridTable.prototype,
    methods
);

export default GridTable;import GridTable from './GridTable.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('gridTable', function (config) {
    var gameObject = new GridTable(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.GridTable', GridTable);

export default GridTable;var InjectProperties = function (table) {
    Object.defineProperty(table, 'childOY', {
        configurable: true,
        get: function () {
            return table.tableOY;
        },
        set: function (value) {
            table.tableOY = value;
        }
    });
    Object.defineProperty(table, 'topChildOY', {
        get: function () {
            return table.topTableOY;
        }
    });
    Object.defineProperty(table, 'bottomChildOY', {
        get: function () {
            return table.bottomTableOY;
        }
    });
};
export default InjectProperties;var SetItems = function (items) {
    if (items === undefined) {
        this.items.length = 0;
    } else {
        this.items = items;
    }

    var table = this.childrenMap.child;
    table.setCellsCount(this.items.length);
    table.updateTable(true);

    this.resizeController();
    return this;
}

export default SetItems;var TableOnCellVisible = function (table) {
    table.on('cellvisible', function (cell, cellContainer) {
        var callback = this.createCellContainerCallback;
        var scope = this.createCellContainerCallbackScope;
        cell.item = this.items[cell.index];
        var container;
        if (scope) {
            container = callback.call(scope, cell, cellContainer);
        } else {
            container = callback(cell, cellContainer);
        }
        if (container.setOrigin) {
            container.setOrigin(0);
        }
        if (container.isRexSizer) {
            container.layout(); // Use original size
        }

        cell.item = undefined;
        cell.setContainer(container);
    }, this);
}
export default TableOnCellVisible;import Button from '../../../../plugins/input/button/Button.js';
import EmitCellEvent from './EmitCellEvent.js';

var ClickCell = function (table) {
    table._click = new Button(table, {
        threshold: 10
    });
    table._click.on('click', function (button, gameObject, pointer) {
        EmitCellEvent(this.eventEmitter, 'cell.click', gameObject, pointer.x, pointer.y);
    }, this);
};

export default ClickCell;var EmitCellEvent = function (eventEmitter, eventName, table, x, y) {
    var cellIndex;
    if (y === undefined) {
        cellIndex = x;
    } else {
        cellIndex = table.pointerToCellIndex(x, y);
    }
    if ((cellIndex === null) || (cellIndex === undefined)) {
        return;
    }
    var cellContainer = table.getCellContainer(cellIndex);
    eventEmitter.emit(eventName, cellContainer, cellIndex);
}

export default EmitCellEvent;import EmitCellEvent from './EmitCellEvent.js';

var OverCell = function (table) {
    table
        .on('pointermove', OnMove, this)
        .on('pointerover', OnMove, this)
        .on('pointerup', OnOut, this)
        .on('pointerout', OnOut, this);
}

var OnMove = function (pointer) {
    if (pointer.isDown) {
        return;
    }
    var table = this.childrenMap.child;
    var cellIndex = table.pointerToCellIndex(pointer.x, pointer.y);
    if (cellIndex === this._lastOverCellIndex) {
        return;
    }

    var preCellIndex = this._lastOverCellIndex;
    this._lastOverCellIndex = cellIndex;
    EmitCellEvent(this.eventEmitter, 'cell.out', table, preCellIndex);
    EmitCellEvent(this.eventEmitter, 'cell.over', table, cellIndex);
}

var OnOut = function () {
    var table = this.childrenMap.child;
    var cellIndxe = this._lastOverCellIndex;
    this._lastOverCellIndex = undefined;
    EmitCellEvent(this.eventEmitter, 'cell.out', table, cellIndxe);
}

export default OverCell;import Press from '../../press/Press.js';
import EmitCellEvent from './EmitCellEvent.js';

var PressCell = function (table) {
    table._press = new Press(table);
    table._press
        .on('pressstart', function (press) {
            var table = press.gameObject;
            var cellIndex = table.pointerToCellIndex(press.x, press.y);
            press._cellIndex = cellIndex;
            EmitCellEvent(this.eventEmitter, 'cell.pressstart', table, cellIndex);
        }, this)
        .on('pressend', function (press) {
            var table = press.gameObject;
            var cellIndex = press._cellIndex;
            press._cellIndex = undefined;
            EmitCellEvent(this.eventEmitter, 'cell.pressend', table, cellIndex);
        }, this)
};

export default PressCell;import ClickCell from './ClickCell.js';
import OverCell from './OverCell.js';
import TapCell from './TapCell.js';
import PressCell from './PressCell.js';

var TableSetInteractive = function (table) {
    table.setInteractive();

    ClickCell.call(this, table);
    OverCell.call(this, table);
    TapCell.call(this, table);
    PressCell.call(this, table);
}

export default TableSetInteractive;import Tap from '../../tap/Tap.js';
import EmitCellEvent from './EmitCellEvent.js';

var TapCell = function (table) {
    table._tap = new Tap(table);
    table._tap
        .on('tap', function (tap) {
            var eventName = `cell.${tap.tapsCount}tap`
            EmitCellEvent(this.eventEmitter, eventName, tap.gameObject, tap.x, tap.y);
        }, this)
};

export default TapCell;import Sizer from '../sizer/Sizer.js';
import DefaultMask from '../../../plugins/utils/mask/DefaultMask.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Label extends Sizer {
    constructor(scene, config) {
        // Create sizer
        super(scene, config);
        this.type = 'rexLabel';

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var icon = GetValue(config, 'icon', undefined);
        var iconMask = GetValue(config, 'iconMask', undefined);
        var text = GetValue(config, 'text', undefined);
        var action = GetValue(config, 'action', undefined);
        var actionMask = GetValue(config, 'actionMask', undefined);
        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);
        var iconSpace = GetValue(config, 'space.icon', 0);
        var textSpace = GetValue(config, 'space.text', 0);

        if (background) {
            this.addBackground(background);
        }

        if (icon) {
            var padding;
            if (this.orientation === 0) {
                padding = {
                    left: paddingLeft,
                    right: (text || action) ? iconSpace : paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                }
            } else {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: (text || action) ? iconSpace : paddingBottom
                }
            }

            this.add(icon, 0, 'center', padding);

            if (iconMask) {
                iconMask = new DefaultMask(icon, 1); // Circle mask
                icon.setMask(iconMask.createGeometryMask());
                this.add(iconMask, null);
            }
        }

        if (text) {
            var expandTextWidth = GetValue(config, 'expandTextWidth', false);
            var expandTextHeight = GetValue(config, 'expandTextHeight', false);
            var proportion, padding, expand;
            if (this.orientation === 0) {
                proportion = (expandTextWidth) ? 1 : 0;
                padding = {
                    left: (icon) ? 0 : paddingLeft,
                    right: (action) ? textSpace : paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                };
                expand = expandTextHeight;
            } else {
                proportion = (expandTextHeight) ? 1 : 0;
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: (icon) ? 0 : paddingTop,
                    bottom: (action) ? textSpace : paddingBottom
                }
                expand = expandTextWidth;
            }
            this.add(text, proportion, 'center', padding, expand);
        }

        if (action) {
            var padding;
            if (this.orientation === 0) {
                padding = {
                    left: (icon || text) ? 0 : paddingLeft,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                }
            } else {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: (icon || text) ? 0 : paddingTop,
                    bottom: paddingBottom
                }
            }
            this.add(action, 0, 'center', padding);

            if (actionMask) {
                actionMask = new DefaultMask(action, 1); // Circle mask
                icon.setMask(actionMask.createGeometryMask());
                this.add(actionMask, null);
            }
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('icon', icon);
        this.addChildrenMap('iconMask', iconMask);
        this.addChildrenMap('text', text);
        this.addChildrenMap('action', action);
        this.addChildrenMap('actionMask', actionMask);
    }

    get text() {
        var textObject = this.childrenMap.text;
        if (textObject === undefined) {
            return '';
        }
        var value;
        if (textObject.text) {
            value = textObject.text;
        } else {
            value = textObject.getData('text');
        }
        return value;
    }

    set text(value) {
        var textObject = this.childrenMap.text;
        if (textObject === undefined) {
            return;
        }
        if (textObject.setText) {
            textObject.setText(value);
        } else {
            textObject.setData('text', value);
        }
    }

    setText(value) {
        this.text = value;
        return this;
    }

    appendText(value) {
        this.text += value;
    }

    layout(parent, newWidth, newHeight) {
        super.layout(parent, newWidth, newHeight);
        // Pin icon-mask to icon game object
        var iconMask = this.childrenMap.iconMask;
        if (iconMask) {
            iconMask.setPosition();
            this.resetChildPositionState(iconMask);
        }
        // Pin action-mask to action game object
        var actionMask = this.childrenMap.actionMask;
        if (actionMask) {
            actionMask.setPosition();
            this.resetChildPositionState(actionMask);
        }
        return this;
    }

    resize(width, height) {
        super.resize(width, height);
        // Resize icon-mask to icon game object
        var iconMask = this.childrenMap.iconMask;
        if (iconMask) {
            iconMask.resize();
        }
        // Resize action-mask to icon game object
        var actionMask = this.childrenMap.actionMask;
        if (actionMask) {
            actionMask.resize();
        }
        return this;
    }
}

export default Label;import Label from './Label.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('label', function (config) {
    var gameObject = new Label(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Label', Label);

export default Label;var Collapse = function () {
    if (this.root.easeOut) {
        this.scaleDownDestroy(this.root.easeOut);
    } else {
        this.destroy();
    }
    this.collapseSubMenu();
    return this;
}
export default Collapse;var CollapseSubMenu = function () {
    if (this.childrenMap.subMenu === undefined) {
        return this;
    }

    var subMenu = this.childrenMap.subMenu;
    this.childrenMap.subMenu = undefined;
    this.remove(subMenu);
    subMenu.collapse();
    return this;
}
export default CollapseSubMenu;var CreateButtons = function (scene, items, callback, scope) {
    var item;
    var buttons = [],
        button;
    if (items && callback) {
        for (var i = 0, cnt = items.length; i < cnt; i++) {
            item = items[i];
            item.scene = scene;
            if (scope) {
                button = callback.call(scope, item, i);
            } else {
                button = callback(item, i);
            }
            item.scene = undefined;
            buttons.push(button);
        }
    }

    return buttons;
}

export default CreateButtons;var ExpandSubMenu = function (parentButton, items) {
    this.collapseSubMenu();
    var subMenu = new this.constructor(this.scene, {
        items: items,
        orientation: this.orientation,
        createButtonCallback: this.root.createButtonCallback,
        createButtonCallbackScope: this.root.createButtonCallbackScope,
        easeIn: this.root.easeIn,
        easeOut: this.root.easeOut,

        root: this.root,
        parent: parentButton
    });
    this.add(subMenu, null);
    this.childrenMap.subMenu = subMenu;    
    return this;
}

export default ExpandSubMenu;import Buttons from '../buttons/Buttons.js';
import Methods from './Methods.js';
import CreateButtons from './CreateButtons.js';
import GetDefaultBounds from '../../../plugins/utils/defaultbounds/GetDefaultBounds.js';
import MenuSetInteractive from './MenuSetInteractive.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Menu extends Buttons {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        // orientation
        if (!config.hasOwnProperty('orientation')) {
            config.orientation = 1;
        }
        // buttons
        var items = GetValue(config, 'items', undefined);
        var callback = GetValue(config, 'createButtonCallback', undefined);
        var scope = GetValue(config, 'createButtonCallbackScope', undefined);
        config.buttons = CreateButtons(scene, items, callback, scope);
        super(scene, config);
        this.type = 'rexMenu';
        this.items = items;
        this.root = GetValue(config, 'root', this);
        if (this.root === this) {
            this.expandEventName = GetValue(config, 'expandEvent', 'button.click');
            this.easeIn = GetValue(config, 'easeIn', undefined);
            this.easeOut = GetValue(config, 'easeOut', undefined);
            this.bounds = GetValue(config, 'bounds', undefined);
            this.expandOrientation = GetValue(config, 'expandOrientation', undefined);
            if (this.expandOrientation === undefined) {
                var bounds = this.bounds;
                if (bounds === undefined) {
                    bounds = GetDefaultBounds(scene);
                }
                if (this.orientation === 0) { // x
                    // Expand down(1)/up(3)
                    this.expandOrientation = (this.y < bounds.centerY) ? 1 : 3;
                } else {
                    // Expand right(0)/left(2)
                    this.expandOrientation = (this.x < bounds.centerX) ? 0 : 2;
                }
            }
            this.createButtonCallback = callback;
            this.createButtonCallbackScope = scope;
            this.isPassedEvent = false;
        }
        this
            .setOrigin(0)
            .layout();

        // Set position to align parent
        var parent = GetValue(config, 'parent', undefined);
        if (parent) {
            switch (this.root.expandOrientation) {
                case 0: //Expand right
                    this.alignTop(parent.top).alignLeft(parent.right);
                    break;
                case 1: //Expand down
                    this.alignLeft(parent.left).alignTop(parent.bottom);
                    break;
                case 2: //Expand left
                    this.alignTop(parent.top).alignRight(parent.left);
                    break;
                case 3: //Expand up
                    this.alignLeft(parent.left).alignBottom(parent.top);
                    break;
            }
        }
        this.pushIntoBounds(this.root.bounds);

        MenuSetInteractive(this);

        // Ease in menu
        if (this.root.easeIn) {
            this.popUp(this.root.easeIn);
        }
    }

    isInTouching(pointer) {
        if (super.isInTouching(pointer)) {
            return true;
        } else if (this.childrenMap.subMenu) {
            return this.childrenMap.subMenu.isInTouching(pointer);
        } else {
            return false;
        }
    }
}

Object.assign(
    Menu.prototype,
    Methods
);
export default Menu;import Menu from './Menu.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('menu', function (config) {
    var gameObject = new Menu(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Menu', Menu);

export default Menu;var MenuSetInteractive = function (menu) {
    menu
        // Expand sub event
        .on(menu.root.expandEventName, function (button, index) {
            if (this.isPassedEvent) {
                return;
            }
            var subItems = this.items[index].children;
            if (subItems) {
                this.expandSubMenu(button, subItems);
            } else {
                // this.root.on('button.click', button); // TODO
            }
        }, menu)
        // Click any button
        .on('button.click', function (button, index) {
            // Pass event to root menu object
            if (this !== this.root) {
                this.root.isPassedEvent = true;
                this.root.emit('button.click', button, index);
                this.root.isPassedEvent = false;
            }
        }, menu)
        //Pointer over any button
        .on('button.over', function (button, index) {
            // Pass event to root menu object
            if (this !== this.root) {
                this.root.isPassedEvent = true;
                this.root.emit('button.over', button, index);
                this.root.isPassedEvent = false;
            }
        }, menu)
        //Pointer out any button
        .on('button.out', function (button, index) {
            // Pass event to root menu object
            if (this !== this.root) {
                this.root.isPassedEvent = true;
                this.root.emit('button.out', button, index);
                this.root.isPassedEvent = false;
            }
        }, menu);
};

export default MenuSetInteractive;import ExpandSubMenu from './ExpandSubMenu.js';
import Collapse from './Collapse.js';
import CollapseSubMenu from './CollapseSubMenu.js';

export default {
    expandSubMenu: ExpandSubMenu,
    collapse: Collapse,
    collapseSubMenu: CollapseSubMenu,
};import Sizer from '../sizer/Sizer.js';
import Slider from '../slider/Slider.js';
import DefaultMask from '../../../plugins/utils/mask/DefaultMask.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const Percent = Phaser.Math.Percent;
const Linear = Phaser.Math.Linear;

class NumberBar extends Sizer {
    constructor(scene, config) {
        // Create sizer
        super(scene, config);
        this.type = 'rexNumberBar';

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var icon = GetValue(config, 'icon', undefined);
        var iconMask = GetValue(config, 'iconMask', undefined);
        var sliderConfig = GetValue(config, 'slider', undefined);
        var text = GetValue(config, 'text', undefined);

        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);
        var iconSpace = GetValue(config, 'space.icon', 0);
        var sliderSpace = GetValue(config, 'space.slider', 0);

        if (background) {
            this.addBackground(background);
        }

        if (icon) {
            var padding;
            if (this.orientation === 0) {
                padding = {
                    left: paddingLeft,
                    right: (sliderConfig || text) ? iconSpace : paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                }
            } else {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: (sliderConfig || text) ? iconSpace : paddingBottom
                }
            }

            this.add(icon, 0, 'center', padding);

            if (iconMask) {
                iconMask = new DefaultMask(icon, 1); // Circle mask
                icon.setMask(iconMask.createGeometryMask());
                this.add(iconMask, null);
            }
        }

        var slider;
        if (sliderConfig) {
            sliderConfig.orientation = (this.orientation == 0) ? 1 : 0;
            sliderConfig.eventEmitter = this;
            sliderConfig.value = null;
            if (!sliderConfig.hasOwnProperty('input')) {
                sliderConfig.input = -1;
            }
            slider = new Slider(scene, sliderConfig);

            var padding;
            if (this.orientation === 0) {
                padding = {
                    left: (icon) ? 0 : paddingLeft,
                    right: (text) ? sliderSpace : paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                }
            } else {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: (icon) ? 0 : paddingTop,
                    bottom: (text) ? sliderSpace : paddingBottom
                }
            }

            var proportion;
            if (this.orientation === 0) {
                var sliderWidth = GetValue(sliderConfig, 'width', undefined);
                proportion = (sliderWidth === undefined) ? 1 : 0;
            } else {
                var sliderHeight = GetValue(sliderConfig, 'height', undefined);
                proportion = (sliderHeight === undefined) ? 1 : 0;
            }
            this.add(slider, proportion, 'center', padding);
        }


        if (text) {
            var padding;
            if (this.orientation === 0) {
                padding = {
                    left: (icon || sliderConfig) ? 0 : paddingLeft,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom
                }
            } else {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: (icon || sliderConfig) ? 0 : paddingTop,
                    bottom: paddingBottom
                }
            }
            this.add(text, 0, 'center', padding);
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('icon', icon);
        this.addChildrenMap('slider', slider);
        this.addChildrenMap('text', text);

        var callback = GetValue(config, 'valuechangeCallback', null);
        if (callback !== null) {
            var scope = GetValue(config, 'valuechangeCallbackScope', undefined);
            this.on('valuechange', callback, scope);
        }
        this.setEnable(GetValue(config, 'enable', undefined));
        this.setValue(GetValue(config, 'value', 0));
    }

    setEnable(enable) {
        if (this.childrenMap.slider) {
            return this;
        }
        if (enable === undefined) {
            enable = true;
        }
        this.childrenMap.slider.enable = enable;
        return this;
    }

    get value() {
        if (this.childrenMap.slider) {
            return this.childrenMap.slider.value;
        }
        return 0;
    }

    set value(value) {
        if (!this.childrenMap.slider) {
            return;
        }
        this.childrenMap.slider.value = value;
    }

    setValue(value, min, max) {
        if (min !== undefined) {
            value = Percent(value, min, max);
        }
        this.value = value;
        return this;
    }

    addValue(inc, min, max) {
        if (min !== undefined) {
            inc = Percent(inc, min, max);
        }
        this.value += inc;
        return this;
    }

    getValue(min, max) {
        var value = this.value;
        if (min !== undefined) {
            value = Linear(min, max, value);
        }
        return value;
    }

    get text() {
        var textObject = this.childrenMap.text;
        if (textObject === undefined) {
            return '';
        }
        var value;
        if (textObject.text) {
            value = textObject.text;
        } else {
            value = textObject.getData('text');
        }
        return value;
    }

    set text(value) {
        var textObject = this.childrenMap.text;
        if (textObject === undefined) {
            return;
        }
        if (textObject.setText) {
            textObject.setText(value);
        } else {
            textObject.setData('text', value);
        }
    }

    setText(value) {
        this.text = value;
        return this;
    }
}
export default NumberBar;import NumberBar from './NumberBar.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('numberBar', function (config) {
    var gameObject = new NumberBar(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.NumberBar', NumberBar);

export default NumberBar;import ALIGNMODE from '../utils/AlignConst.js';
import GetBoundsConfig from '../utils/GetBoundsConfig.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const ALIGN_LEFTTOP = Phaser.Display.Align.TOP_LEFT;

var AddPage = function (gameObject, key, align, paddingConfig, expand) {
    if (IsPlainObject(key)) {
        var config = key;
        key = GetValue(config, 'key', 0);
        align = GetValue(config, 'align', ALIGN_LEFTTOP);
        paddingConfig = GetValue(config, 'padding', 0);
        expand = GetValue(config, 'expand', false);
    }

    if (typeof (align) === 'string') {
        align = ALIGNMODE[align];
    }

    if (align === undefined) {
        align = ALIGN_CENTER;
    }
    if (paddingConfig === undefined) {
        paddingConfig = 0;
    }
    if (expand === undefined) {
        expand = true;
    }

    var config = this.getSizerConfig(gameObject);
    config.parent = this;
    config.align = align;
    config.padding = GetBoundsConfig(paddingConfig);
    config.expand = expand;
    if (this.sizerChildren.has(key)) {
        this.sizerChildren.get(key).destroy();
    }
    this.sizerChildren.set(key, gameObject);
    gameObject.setVisible(false); // Default is invisible
    this.add(gameObject);
    return this;
}
export default AddPage;var GetChildrenHeight = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result = 0;
    var children = this.sizerChildren.entries;
    var child, padding, childHeight;
    for (var key in children) {
        child = children[key];
        childHeight = (child.isRexSizer) ?
            Math.max(child.minHeight, child.childrenHeight) :
            child.height;

        padding = child.rexSizer.padding;
        childHeight += (padding.top + padding.bottom);
        result = Math.max(childHeight, result);
    }
    return result;
}

export default GetChildrenHeight;var GetChildrenSizers = function (out) {
    if (out === undefined) {
        out = [];
    }
    var children = this.sizerChildren.entries,
        child;
    for (var key in children) {
        child = children[key];
        if (child.isRexSizer) {
            out.push(child);
        }
    }
    return out;
}
export default GetChildrenSizers;var GetChildrenWidth = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result = 0;
    var children = this.sizerChildren.entries;
    var child, padding, childWidth;
    for (var key in children) {
        child = children[key];
        childWidth = (child.isRexSizer) ?
            Math.max(child.minWidth, child.childrenWidth) :
            child.width;

        padding = child.rexSizer.padding;
        childWidth += (padding.left + padding.right);
        result = Math.max(childWidth, result);
    }
    return result;
}

export default GetChildrenWidth;var GetExpandedChildHeight = function (parent, child) {
    var newHeight;
    var childConfig = child.rexSizer;
    var padding = childConfig.padding;
    if (childConfig.expand) {
        newHeight = parent.height - padding.top - padding.bottom;
    }
    return newHeight;
}

export default GetExpandedChildHeight;var GetExpandedChildWidth = function (parent, child) {
    var newWidth;
    var childConfig = child.rexSizer;
    var padding = childConfig.padding;
    if (childConfig.expand) {
        newWidth = parent.width - padding.left - padding.right;
    }
    return newWidth;
}

export default GetExpandedChildWidth;var GetPage = function (key) {
    if (key === undefined) {
        return null;
    } else if (!this.sizerChildren.has(key)) {
        return null;
    } else {
        return this.sizerChildren.get(key);
    }
}
export default GetPage;import GetExpandedChildWidth from './GetExpandedChildWidth.js';
import GetExpandedChildHeight from './GetExpandedChildHeight.js';
import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent, newWidth, newHeight) {
    // Skip invisible sizer
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    // Set size
    if (newWidth === undefined) {
        newWidth = Math.max(this.childrenWidth, this.minWidth);
    }
    if (newHeight === undefined) {
        newHeight = Math.max(this.childrenHeight, this.minHeight);
    }
    this.resize(newWidth, newHeight);

    // Layout children
    var child, childConfig, padding;
    var startX = this.left,
        startY = this.top;
    var x, y, width, height; // Align zone
    var childWidth, childHeight;

    // Layout current page
    var pages = this.pages;
    for (var key in pages) {
        child = pages[key];
        childConfig = child.rexSizer;
        padding = childConfig.padding;

        // Set size
        if (child.isRexSizer) {
            child.layout(
                this,
                GetExpandedChildWidth(this, child),
                GetExpandedChildHeight(this, child));
        } else {
            childWidth = undefined;
            childHeight = undefined;
            if (childConfig.expand) { // Expand height
                childHeight = this.height - padding.top - padding.bottom;
                childWidth = this.width - padding.left - padding.right;
            }
            ResizeGameObject(child, childWidth, childHeight);
        }

        // Set position
        x = (startX + padding.left);
        width = this.width - padding.left - padding.right;
        y = (startY + padding.top);
        height = this.height - padding.top - padding.bottom;
        GlobZone.setPosition(x, y).setSize(width, height);
        AlignIn(child, GlobZone, childConfig.align);
        this.resetChildPositionState(child);
    }

    // Layout background children
    this.layoutBackgrounds();

    return this;
}

export default Layout;import AddPage from './AddPage.js';
import GetPage from './GetPage.js';
import SwapPage from './SwapPage.js';
import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetChildrenSizers from './GetChildrenSizers.js';
import Layout from './Layout.js';
import _layoutInit from './_layoutInit.js';

export default {
    addPage: AddPage,
    getPage: GetPage,
    swapPage: SwapPage,
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    getChildrenSizers: GetChildrenSizers,
    layout: Layout,
    _layoutInit: _layoutInit,
};import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;
const Map = Phaser.Structs.Map;

class Pages extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, config) {
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        }

        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexPages';
        this._previousKey = undefined;
        this._currentKey = undefined;
        this.sizerChildren = new Map();
        this.setSwapMode(GetValue(config, 'swapMode', 0));

        this.addChildrenMap('pages', this.pages);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.sizerChildren.clear();
        super.destroy(fromScene);
    }

    setSwapMode(mode) {
        if (typeof (mode) === 'string') {
            mode = SWAPMODE[mode];
        }
        this.swapMode = mode;
        return this;
    }

    get previousKey() {
        return this._previousKey;
    }

    get currentKey() {
        return this._currentKey;
    }

    set currentKey(key) {
        this.swapPage(key);
    }

    get currentPage() {
        return this.getPage(this.currentKey);
    }

    get previousPage() {
        return this.getPage(this.previousKey);
    }

    get keys() {
        return this.sizerChildren.keys();
    }

    get pages() {
        return this.sizerChildren.entries;
    }
}

Object.assign(
    Pages.prototype,
    Methods
);

const SWAPMODE = {
    invisible: 0,
    destroy: 1
};

export default Pages;import Pages from './Pages.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('pages', function (x, y, minWidth, minHeight, orientation) {
    var gameObject = new Pages(this.scene, x, y, minWidth, minHeight, orientation);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Pages', Pages);

export default Pages;var SwapPage = function (key) {
    this._previousKey = this._currentKey;
    var prevoiusPage = this.previousPage;
    if (prevoiusPage) {
        if (this.swapMode === 0) { // Invisible
            prevoiusPage.setVisible(false);
            this.resetChildVisibleState(prevoiusPage);
            this.emit('pageinvisible', prevoiusPage, this._previousKey, this);
        } else { // Destroy
            prevoiusPage.destroy();
        }
    }

    if (key && !this.sizerChildren.has(key)) {
        this.emit('createpage', key, this);
    }

    this._currentKey = key;
    var currentPage = this.currentPage;
    if (currentPage) {
        currentPage.setVisible(true);
        this.resetChildVisibleState(currentPage);
        this.emit('pagevisible', currentPage, this._currentKey, this);
    }
    return this;
}

export default SwapPage;var LayoutInitChild = function () {
    this._childrenWidth = undefined;
    this._childrenHeight = undefined;
}
export default LayoutInitChild;import Pan from '../../../plugins/input/gestures/pan/Pan.js';
export default Pan;import Pan from './Pan.js';
import ObjectFactory from '../ObjectFactory.js';
import IsGameObject from '../../../plugins/utils/system/IsGameObject.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('pan', function (gameObject, config) {
    if (!IsGameObject(gameObject)) {
        config = gameObject;
        gameObject = this.scene;
    }
    return new Pan(gameObject, config);
});

SetValue(window, 'RexPlugins.UI.Pan', Pan);

export default Pan;import Pinch from '../../../plugins/input/gestures/pinch/Pinch.js';
export default Pinch;import Pinch from './Pinch.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('pinch', function (config) {
    return new Pinch(this.scene, config);
});

SetValue(window, 'RexPlugins.UI.Pinch', Pinch);

export default Pinch;import Press from '../../../plugins/input/gestures/press/Press.js';
export default Press;import Press from './Press.js';
import ObjectFactory from '../ObjectFactory.js';
import IsGameObject from '../../../plugins/utils/system/IsGameObject.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('press', function (gameObject, config) {
    if (!IsGameObject(gameObject)) {
        config = gameObject;
        gameObject = this.scene;
    }
    return new Press(gameObject, config);
});

SetValue(window, 'RexPlugins.UI.Press', Press);

export default Press;import Rotate from '../../../plugins/input/gestures/rotate/Rotate.js';
export default Rotate;import Rotate from './Rotate.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('rotate', function (config) {
    return new Rotate(this.scene, config);
});

SetValue(window, 'RexPlugins.UI.Rotate', Rotate);

export default Rotate;import RoundRectangle from '../../../plugins/gameobjects/shape/roundrectangle/RoundRectangle.js';
export default RoundRectangle;import RoundRectangle from './RoundRectangle.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('roundRectangle', function (x, y, width, height, radiusConfig, fillColor, fillAlpha) {
    var gameObject = new RoundRectangle(this.scene, x, y, width, height, radiusConfig, fillColor, fillAlpha);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.RoundRectangle', RoundRectangle);

export default RoundRectangle;var GetChildrenHeight = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result;
    var child = this.child,
        childConfig = child.rexSizer;
    if (childConfig.hidden) {
        result = 0;
    } else if (this.scrollMode === 0) { // scroll y   
        result = 0;
    } else { // scroll x
        result = (child.isRexSizer) ?
            Math.max(child.minHeight, child.childrenHeight) :
            child.height;
    }

    return result;
}

export default GetChildrenHeight;var GetChildrenWidth = function () {
    if (this.rexSizer.hidden) {
        return 0;
    }

    var result;
    var child = this.child,
        childConfig = child.rexSizer;
    if (childConfig.hidden) {
        result = 0;
    } else if (this.scrollMode === 0) { // scroll y
        result = (child.isRexSizer) ?
            Math.max(child.minWidth, child.childrenWidth) :
            child.width;
    } else { // scroll x
        result = 0;
    }

    return result;
}

export default GetChildrenWidth;import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';
import MaskToGameObject from '../../../plugins/utils/mask/MaskToGameObject.js';

var Layout = function (parent, newWidth, newHeight) {
    // Skip invisible sizer
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    // Set size
    if (newWidth === undefined) {
        newWidth = Math.max(this.childrenWidth, this.minWidth);
    }
    if (newHeight === undefined) {
        newHeight = Math.max(this.childrenHeight, this.minHeight);
    }
    this.resize(newWidth, newHeight);

    // Layout child
    var child = this.child;
    var childWidth, childHeight;
    if (!child.rexSizer.hidden) {
        // Set size
        if (this.scrollMode === 0) {
            childWidth = this.width;
        } else {
            childHeight = this.height;
        }
        if (child.isRexSizer) {
            child.layout(this, childWidth, childHeight);
        } else {
            ResizeGameObject(child, childWidth, childHeight);
        }

        this.resetChildPosition();

        // Layout child mask
        if (this.childMask) {
            var maskGameObject = MaskToGameObject(this.childMask);
            maskGameObject.setPosition().resize();
            this.resetChildPositionState(maskGameObject);
        }
    }

    return this;
}

export default Layout;import SetChild from './SetChild.js';
import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import ResetChildPosition from './ResetChildPosition.js';
import Layout from './Layout.js';

export default {
    setChild: SetChild,
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    resetChildPosition: ResetChildPosition,
    layout: Layout,
};import MaskChildren from '../../../plugins/gameobjects/containerlite/MaskChildren.js';

var ResetChildPosition = function () {
    var x = this.left;
    var y = this.top;
    if (this.scrollMode === 0) {
        y += this.childOY;
    } else {
        x += this.childOY;
    }
    this.child.setPosition(x, y);
    MaskChildren(this, this.childMask, this.child.getAllChildren());
    this.resetChildPositionState(this.child);
};

export default ResetChildPosition;import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';
import SCROLLMODE from '../utils/ScrollModeConst.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

class ScrollableBlock extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, config) {
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        }
        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexScrollableBlock';
        this.child = undefined;
        this.childMask = undefined;
        this._childOY = 0;
        this.execeedTopState = false;
        this.execeedBottomState = false;

        this.setScrollMode(GetValue(config, 'scrollMode', true))
        this.setClampMode(GetValue(config, 'clamplChildOY', true));

        // Add elements
        // No background object, and child does not have padding
        var child = GetValue(config, 'child', undefined);
        var expand = GetValue(config, 'expand', true);
        var childMask = GetValue(config, 'mask', undefined);

        this.setChild(child, expand, childMask);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.child = undefined;
        if (this.childMask) {
            this.childMask.destroy();
            this.childMask = undefined;
        }
        super.destroy(fromScene);
    }

    setScrollMode(mode) {
        if (typeof (mode) === 'string') {
            mode = SCROLLMODE[mode.toLowerCase()];
        }
        this.scrollMode = mode;
        return this;
    }

    setClampMode(mode) {
        this.clampChildOYMode = mode;
        return this;
    }

    get instHeight() {
        return (this.scrollMode === 0) ? this.height : this.width;
    }

    get instWidth() {
        return (this.scrollMode === 0) ? this.width : this.height;
    }

    get childHeight() {
        return (this.scrollMode === 0) ? this.child.height : this.child.width;
    }

    get childWidth() {
        return (this.scrollMode === 0) ? this.child.width : this.child.height;
    }

    get topChildOY() {
        return 0;
    }

    get bottomChildOY() {
        return -this.visibleHeight;
    }

    get visibleHeight() {
        var h;
        var childHeight = this.childHeight;
        var instHeight = this.instHeight;
        if (childHeight > instHeight) {
            h = childHeight - instHeight;
        } else {
            h = 0;
        }

        return h;
    }

    childOYExceedTop(oy) {
        if (oy === undefined) {
            oy = this.childOY;
        }
        return (oy > this.topChildOY);
    }

    childOYExeceedBottom(oy) {
        if (oy === undefined) {
            oy = this.childOY;
        }
        return (oy < this.bottomChildOY);
    }

    get childOY() {
        return this._childOY;
    }

    set childOY(oy) {
        var topChildOY = this.topChildOY;
        var bottomChildOY = this.bottomChildOY;
        var childOYExceedTop = this.childOYExceedTop(oy);
        var childOYExeceedBottom = this.childOYExeceedBottom(oy);

        if (this.clampChildOYMode) {
            if (this.instHeight > this.childHeight) {
                oy = 0;
            } else if (childOYExceedTop) {
                oy = topChildOY
            } else if (childOYExeceedBottom) {
                oy = bottomChildOY;
            }
        }

        if (this._childOY !== oy) {
            this._childOY = oy;
            this.resetChildPosition();
        }

        if (childOYExceedTop) {
            if (!this.execeedTopState) {
                this.emit('execeedtop', this, oy, topChildOY);
            }
        }
        this.execeedTopState = childOYExceedTop;

        if (childOYExeceedBottom) {
            if (!this.execeedBottomState) {
                this.emit('execeedbottom', this, oy, bottomChildOY);
            }
        }
        this.execeedBottomState = childOYExeceedBottom;
    }

    setChildOY(oy) {
        this.childOY = oy;
        return this;
    }

    set t(value) {
        this.childOY = -this.visibleHeight * value;
    }

    get t() {
        var visibleHeight = this.visibleHeight;
        if (visibleHeight === 0) {
            return 0;
        }
        return (this.childOY / -visibleHeight);
    }

    setChildOYByPercentage(percentage) {
        this.t = percentage;
        return this;
    }
}

Object.assign(
    ScrollableBlock.prototype,
    Methods
);

export default ScrollableBlock;import ScrollableBlock from './ScrollableBlock.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('scrollableBlock', function (config) {
    var gameObject = new ScrollableBlock(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.ScrollableBlock', ScrollableBlock);

export default ScrollableBlock;import DefaultMask from '../../../plugins/utils/mask/DefaultMask.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const ALIGN_LEFTTOP = Phaser.Display.Align.TOP_LEFT;

var SetChild = function (gameObject, expand, maskConfig) {
    if (gameObject.setOrigin) {
        gameObject.setOrigin(0);
    }

    this.add(gameObject);

    var config = this.getSizerConfig(gameObject);
    config.parent = this;
    config.align = ALIGN_LEFTTOP;
    config.expand = expand;
    this.child = gameObject;

    // Create mask of child object
    var maskEnable, maskPadding;
    if (maskConfig === true) {
        maskEnable = true;
        maskPadding = 0;
    } else if (maskConfig === false) {
        maskEnable = false;
    } else {
        maskEnable = GetValue(maskConfig, 'mask', true);
        maskPadding = GetValue(maskConfig, 'padding', 0);
    }

    if (maskEnable) {
        var maskGameObject = new DefaultMask(this, 0, maskPadding);
        this.childMask = maskGameObject.createGeometryMask();
        this.add(maskGameObject);
    }

    return this;
}

export default SetChild;import Scrollable from '../utils/scrollable/Scrollable.js';
import GetScrollMode from '../utils/GetScrollMode.js';
import ScrollableBlock from '../scrollableblock/ScrollableBlock.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class ScrollablePanel extends Scrollable {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        // Create scrollable-block
        var scrollMode = GetScrollMode(config);
        var panelConfig = GetValue(config, 'panel', undefined);
        if (panelConfig === undefined) {
            panelConfig = {};
        }
        panelConfig.scrollMode = scrollMode;
        panelConfig.clamplChildOY = GetValue(config, 'clamplChildOY', false);
        var scrollableBlock = new ScrollableBlock(scene, panelConfig);
        var panelWidth = GetValue(panelConfig, 'width', undefined);
        var panelHeight = GetValue(panelConfig, 'height', undefined);
        var proportion, expand;
        if (scrollMode === 0) {
            proportion = (panelWidth === undefined) ? 1 : 0;
            expand = (panelHeight === undefined);
        } else {
            proportion = (panelHeight === undefined) ? 1 : 0;
            expand = (panelWidth === undefined);
        }

        // Fill config of scrollable
        config.type = 'rexScrollablePanel';
        config.child = {
            gameObject: scrollableBlock,
            proportion: proportion,
            expand: expand,
        };
        var spaceConfig = GetValue(config, 'space', undefined);
        if (spaceConfig) {
            spaceConfig.child = spaceConfig.panel;
        }
        super(scene, config);

        this.addChildrenMap('panel', this.childrenMap.child);
    }
}

export default ScrollablePanel;import ScrollablePanel from './ScrollablePanel.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('scrollablePanel', function (config) {
    var gameObject = new ScrollablePanel(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.ScrollablePanel', ScrollablePanel);

export default ScrollablePanel;var GetChildrenHeight = function (minimumMode) {
    if (this.rexSizer.hidden) {
        return 0;
    }

    if (minimumMode === undefined) {
        minimumMode = true;
    }

    var result = 0;
    var children = this.sizerChildren;
    var child, padding, childHeight;
    if (this.orientation === 0) { // x
        // Get maximun height
        for (var i = 0, cnt = children.length; i < cnt; i++) {
            child = children[i];
            if (child.rexSizer.hidden) {
                continue;
            }

            childHeight = (child.isRexSizer) ?
                Math.max(child.minHeight, child.childrenHeight) :
                child.height;

            padding = child.rexSizer.padding;
            childHeight += (padding.top + padding.bottom);
            result = Math.max(childHeight, result);
        }
    } else {
        // Get summation of minimum height
        for (var i = 0, cnt = children.length; i < cnt; i++) {
            child = children[i];
            if (!child.hasOwnProperty('rexSizer')) {
                continue;
            }
            if (child.rexSizer.hidden) {
                continue;
            }

            if (
                (child.rexSizer.proportion === 0) ||
                (minimumMode && (child.rexSizer.proportion > 0))
            ) {
                childHeight = (child.isRexSizer) ?
                    Math.max(child.minHeight, child.childrenHeight) :
                    child.height;
            } else {
                childHeight = 0;
            }
            padding = child.rexSizer.padding;
            childHeight += (padding.top + padding.bottom);
            result += childHeight;
        }
    }
    return result;
}

export default GetChildrenHeight;var GetChildrenProportion = function () {
    var result = 0;
    var children = this.sizerChildren;
    var child, proportion;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child.rexSizer.hidden) {
            continue;
        }
        proportion = child.rexSizer.proportion;
        if (proportion > 0) {
            result += proportion;
        }
    }
    return result;
}
export default GetChildrenProportion;var GetChildrenSizers = function(out) {
    if (out === undefined) {
        out = [];
    }
    var children = this.sizerChildren,
        child;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child.isRexSizer) {
            out.push(child);
        }
    }
    return out;
}
export default GetChildrenSizers;var GetChildrenWidth = function (minimumMode) {
    if (this.rexSizer.hidden) {
        return 0;
    }

    if (minimumMode === undefined) {
        minimumMode = true;
    }

    var result = 0;
    var children = this.sizerChildren;
    var child, padding, childWidth;
    if (this.orientation === 0) { // x
        // Get summation of minimum width
        for (var i = 0, cnt = children.length; i < cnt; i++) {
            child = children[i];
            if (child.rexSizer.hidden) {
                continue;
            }

            if (
                (child.rexSizer.proportion === 0) ||
                (minimumMode && (child.rexSizer.proportion > 0))
            ) {
                childWidth = (child.isRexSizer) ?
                    Math.max(child.minWidth, child.childrenWidth) :
                    child.width;
            } else {
                childWidth = 0;
            }
            padding = child.rexSizer.padding;
            childWidth += (padding.left + padding.right);
            result += childWidth;
        }
    } else {
        // Get maximun width
        for (var i = 0, cnt = children.length; i < cnt; i++) {
            child = children[i];
            if (!child.hasOwnProperty('rexSizer')) {
                continue;
            }
            if (child.rexSizer.hidden) {
                continue;
            }

            childWidth = (child.isRexSizer) ?
                Math.max(child.minWidth, child.childrenWidth) :
                child.width;

            padding = child.rexSizer.padding;
            childWidth += (padding.left + padding.right);
            result = Math.max(childWidth, result);
        }
    }
    return result;
}

export default GetChildrenWidth;var GetExpandedChildHeight = function (parent, child) {
    var newHeight;
    var childConfig = child.rexSizer;
    var padding = childConfig.padding;
    if (parent.orientation === 0) { // x
        if (childConfig.expand) {
            newHeight = parent.height - padding.top - padding.bottom;
        }
    } else { // y
        if ((childConfig.proportion > 0) && (parent.proportionLength > 0)) {
            newHeight = (childConfig.proportion * parent.proportionLength);
        }
    }
    return newHeight;
}

export default GetExpandedChildHeight;var GetExpandedChildWidth = function (parent, child) {
    var newWidth;
    var childConfig = child.rexSizer;
    var padding = childConfig.padding;
    if (parent.orientation === 0) { // x
        if ((childConfig.proportion > 0) && (parent.proportionLength > 0)) {
            newWidth = (childConfig.proportion * parent.proportionLength);
        }
    } else { // y
        if (childConfig.expand) {
            newWidth = parent.width - padding.left - padding.right;
        }
    }
    return newWidth;
}

export default GetExpandedChildWidth;import GetExpandedChildWidth from './GetExpandedChildWidth.js';
import GetExpandedChildHeight from './GetExpandedChildHeight.js';
import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent, newWidth, newHeight) {
    // Skip invisible sizer
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    // Set size
    if (newWidth === undefined) {
        newWidth = Math.max(this.childrenWidth, this.minWidth);
    }
    if (newHeight === undefined) {
        newHeight = Math.max(this.childrenHeight, this.minHeight);
    }
    this.resize(newWidth, newHeight);

    var proportionLength;
    if (this.childrenProportion > 0) {
        var remainder = (this.orientation === 0) ?
            (this.width - this.childrenWidth) :
            (this.height - this.childrenHeight);

        if (remainder > 0) {
            remainder = (this.orientation === 0) ?
                (this.width - this.getChildrenWidth(false)) :
                (this.height - this.getChildrenHeight(false));
            proportionLength = remainder / this.childrenProportion;
        } else {
            proportionLength = 0;
        }
    } else {
        proportionLength = 0;
    }
    this.proportionLength = proportionLength;

    // Layout children    
    var children = this.sizerChildren;
    var child, childConfig, padding;
    var startX = this.left,
        startY = this.top;
    var itemX = startX,
        itemY = startY;
    var x, y, width, height; // Align zone
    var childWidth, childHeight;
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (child.rexSizer.hidden) {
            continue;
        }

        childConfig = child.rexSizer;
        padding = childConfig.padding;

        // Set size
        childWidth = GetExpandedChildWidth(this, child);
        childHeight = GetExpandedChildHeight(this, child);
        if (child.isRexSizer) {
            child.layout(this, childWidth, childHeight);
        } else {
            ResizeGameObject(child, childWidth, childHeight);
        }

        if (childWidth === undefined) {
            childWidth = child.width;
        }
        if (childHeight === undefined) {
            childHeight = child.height;
        }

        // Set position
        if (this.orientation === 0) { // x
            x = (itemX + padding.left);
            if ((childConfig.proportion === 0) || (proportionLength === 0)) {
                width = childWidth;
            } else {
                width = (childConfig.proportion * proportionLength);
            }

            y = (itemY + padding.top);
            height = (this.height - padding.top - padding.bottom);
        } else { // y
            x = (itemX + padding.left);
            width = (this.width - padding.left - padding.right);

            y = (itemY + padding.top);
            if ((childConfig.proportion === 0) || (proportionLength === 0)) {
                height = childHeight;
            } else {
                height = (childConfig.proportion * proportionLength);
            }
        }

        GlobZone.setPosition(x, y).setSize(width, height);
        AlignIn(child, GlobZone, childConfig.align);
        this.resetChildPositionState(child);

        if (this.orientation === 0) { // x
            itemX += (width + padding.left + padding.right);
        } else { // y
            itemY += (height + padding.top + padding.bottom);
        }
    }

    // Layout background children
    this.layoutBackgrounds();

    return this;
}

export default Layout;import GetChildrenWidth from './GetChildrenWidth.js';
import GetChildrenHeight from './GetChildrenHeight.js';
import GetChildrenProportion from './GetChildrenProportion.js';
import GetChildrenSizers from './GetChildrenSizers.js';
import Layout from './Layout.js';
import _layoutInit from './_layoutInit.js';

export default {
    getChildrenWidth: GetChildrenWidth,
    getChildrenHeight: GetChildrenHeight,
    getChildrenProportion: GetChildrenProportion,
    getChildrenSizers: GetChildrenSizers,
    layout: Layout,
    _layoutInit: _layoutInit,
};import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';
import GetBoundsConfig from '../utils/GetBoundsConfig.js';
import ORIENTATIONMODE from '../utils/OrientationConst.js';
import ALIGNMODE from '../utils/AlignConst.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;
const RemoveItem = Phaser.Utils.Array.Remove;
const ALIGN_CENTER = Phaser.Display.Align.CENTER;

class Sizer extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, orientation) {
        var config;
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(orientation)) {
            config = orientation;
        }

        if (config !== undefined) {
            orientation = GetValue(config, 'orientation', 0);
        }
        if (orientation === undefined) {
            orientation = 0;
        }
        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexSizer';
        this.sizerChildren = [];
        this.setOrientation(orientation);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.sizerChildren.length = 0;
        super.destroy(fromScene);
    }

    setOrientation(orientation) {
        if (typeof (orientation) === 'string') {
            orientation = ORIENTATIONMODE[orientation];
        }
        this.orientation = orientation;
        return this;
    }

    add(gameObject, proportion, align, paddingConfig, expand) {
        super.add(gameObject);

        var proportionType = typeof (proportion);
        if (proportion === null) {
            return this;
        } else if (proportionType === 'number') {

        } else if (proportionType === 'string') {
            proportion = PROPORTIONMODE[proportion];
        } else if (IsPlainObject(proportion)) {
            var config = proportion;
            proportion = GetValue(config, 'proportion', 0);
            align = GetValue(config, 'align', ALIGN_CENTER);
            paddingConfig = GetValue(config, 'padding', 0);
            expand = GetValue(config, 'expand', false);
        }

        if (typeof (align) === 'string') {
            align = ALIGNMODE[align];
        }

        if (proportion === undefined) {
            proportion = 0;
        }
        if (align === undefined) {
            align = ALIGN_CENTER;
        }
        if (paddingConfig === undefined) {
            paddingConfig = 0;
        }
        if (expand === undefined) {
            expand = false;
        }

        var config = this.getSizerConfig(gameObject);
        config.parent = this;
        config.proportion = proportion;
        config.align = align;
        config.padding = GetBoundsConfig(paddingConfig);
        config.expand = expand;
        this.sizerChildren.push(gameObject);
        return this;
    }

    insert(index, gameObject, proportion, align, paddingConfig, expand) {
        this.add(gameObject, proportion, align, paddingConfig, expand);
        this.moveTo(gameObject, index);
        return this;
    }

    remove(gameObject) {
        var config = this.getSizerConfig(gameObject);
        if (config.parent !== this) {
            return this;
        }
        config.parent = undefined;
        RemoveItem(this.sizerChildren, gameObject);
        super.remove(gameObject);
        return this;
    }

    get childrenProportion() {
        if (this._childrenProportion === undefined) {
            this._childrenProportion = this.getChildrenProportion();
        }
        return this._childrenProportion;
    }
}

Object.assign(
    Sizer.prototype,
    Methods
);

const PROPORTIONMODE = {
    min: 0,
    full: -1,
}
export default Sizer;import Sizer from './Sizer.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('sizer', function (x, y, minWidth, minHeight, orientation) {
    var gameObject = new Sizer(this.scene, x, y, minWidth, minHeight, orientation);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Sizer', Sizer);

export default Sizer;var LayoutInitChild = function () {
    this._childrenWidth = undefined;
    this._childrenHeight = undefined;
    this._childrenProportion = undefined;
}
export default LayoutInitChild;import GetThumbAlignPoint from './GetThumbAlignPoint.js';

const AlignRight = Phaser.Display.Align.RIGHT_CENTER;
const AlignBottom = Phaser.Display.Align.BOTTOM_CENTER;

var GetEndoint = function (out) {
    if (out === undefined) {
        out = tmpPoint;
    }
    if (this.childrenMap.thumb) {
        var align = (this.orientation === 1) ? AlignRight : AlignBottom;
        GetThumbAlignPoint.call(this, align, out);
    } else {
        if (this.orientation === 0) {
            out.x = this.centerX;
            out.y = this.bottom - 1; // Add 1 pixel margin
        } else {
            out.x = this.right - 1; // Add 1 pixel margin
            out.y = this.centerY;
        }
    }
    return out;
}

var tmpPoint = {};

export default GetEndoint;import GetThumbAlignPoint from './GetThumbAlignPoint.js';

const AlignLeft = Phaser.Display.Align.LEFT_CENTER;
const AlignTop = Phaser.Display.Align.TOP_CENTER;

var GetStartPoint = function (out) {
    if (out === undefined) {
        out = tmpPoint;
    }
    if (this.childrenMap.thumb) {
        var align = (this.orientation === 0) ? AlignTop : AlignLeft;
        GetThumbAlignPoint.call(this, align, out);
    } else {
        if (this.orientation === 0) {
            out.x = this.centerX;
            out.y = this.top + 1; // Add 1 pixel margin
        } else {
            out.x = this.left + 1; // Add 1 pixel margin
            out.y = this.centerY;
        }
    }
    return out;
}

var tmpPoint = {};

export default GetStartPoint;const AlignIn = Phaser.Display.Align.In.QuickSet;

var GetThumbAlignPoint = function (align, out) {
    if (out === undefined) {
        out = tmpPoint;
    }
    var thumb = this.childrenMap.thumb;
    var currentX = thumb.x;
    var currentY = thumb.y;

    AlignIn(thumb, this, align);
    out.x = thumb.x;
    out.y = thumb.y;

    thumb.x = currentX;
    thumb.y = currentY;

    return out;
}

var tmpPoint = {};

export default GetThumbAlignPoint;import PositionToPercent from './PositionToPercent.js';

var OnDragThumb = function (pointer, dragX, dragY) {
    if (!this.enable) {
        return;
    }
    tmpPoint.x = dragX;
    tmpPoint.y = dragY;
    this.value = PositionToPercent(this.getStartPoint(), this.getEndPoint(), tmpPoint);
}
var tmpPoint = {};

export default OnDragThumb;import PositionToPercent from './PositionToPercent.js';

var OnTouchTrack = function (pointer, localX, localY) {
    if (!this.enable) {
        return;
    }
    if (!pointer.isDown) {
        return;
    }
    tmpPoint.x = pointer.worldX;
    tmpPoint.y = pointer.worldY;
    this.value = PositionToPercent(this.getStartPoint(), this.getEndPoint(), tmpPoint);
}
var tmpPoint = {};

export default OnTouchTrack;const Linear = Phaser.Math.Linear;

var PercentToPosition = function (t, startPoint, endPoint, out) {
    if (out === undefined) {
        out = tmpOut;
    }
    out.x = Linear(startPoint.x, endPoint.x, t);
    out.y = Linear(startPoint.y, endPoint.y, t);
    return out;
}
var tmpOut = {};

export default PercentToPosition;const Percent = Phaser.Math.Percent;

var PositionToPercent = function (startPoint, endPoint, currentPoint) {
    var min, max, value;
    if (startPoint.y === endPoint.y) {
        min = Math.min(startPoint.x, endPoint.x);
        max = Math.max(startPoint.x, endPoint.x);
        value = Percent(currentPoint.x, min, max);
    } else if (startPoint.x === endPoint.x) {
        min = Math.min(startPoint.y, endPoint.y);
        max = Math.max(startPoint.y, endPoint.y);
        value = Percent(currentPoint.y, min, max);
    }
    return value
}

export default PositionToPercent;import Sizer from '../sizer/Sizer.js';
import OnDragThumb from './OnDragThumb.js';
import OnTouchTrack from './OnTouchTrack.js';
import GetStartPoint from './GetStartPoint.js';
import GetEndPoint from './GetEndPoint.js';
import UpdateThumb from './UpdateThumb.js';
import UpdateIndicator from './UpdateIndicator.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const Clamp = Phaser.Math.Clamp;
const Linear = Phaser.Math.Linear;
const Percent = Phaser.Math.Percent;

class Slider extends Sizer {
    constructor(scene, config) {
        // Create sizer
        super(scene, config);
        this.type = 'rexSlider';
        this.eventEmitter = GetValue(config, 'eventEmitter', this);

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var track = GetValue(config, 'track', undefined);
        var indicator = GetValue(config, 'indicator', undefined);
        var thumb = GetValue(config, 'thumb', undefined);

        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);

        if (background) {
            this.addBackground(background);
        }

        if (track) {
            var padding = {
                left: paddingLeft,
                right: paddingRight,
                top: paddingTop,
                bottom: paddingBottom
            }
            this.add(track, 0, undefined, padding, true);
        }

        if (indicator) {
            this.add(indicator, null); // Put into container but not layout it
        }

        if (thumb) {
            this.add(thumb, null); // Put into container but not layout it

        }

        // Input
        var inputMode = GetValue(config, 'input', 0);
        if (typeof (inputMode) === 'string') {
            inputMode = INPUTMODE[inputMode];
        }
        switch (inputMode) {
            case 0: // 'drag'
                if (thumb) {
                    thumb.setInteractive();
                    this.scene.input.setDraggable(thumb);
                    thumb.on('drag', OnDragThumb, this);
                }
                break;
            case 1: // 'click'
                this.setInteractive()
                    .on('pointerdown', OnTouchTrack, this)
                    .on('pointermove', OnTouchTrack, this);
                break;
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('track', track);
        this.addChildrenMap('indicator', indicator);
        this.addChildrenMap('thumb', thumb);

        var callback = GetValue(config, 'valuechangeCallback', null);
        if (callback !== null) {
            var scope = GetValue(config, 'valuechangeCallbackScope', undefined);
            this.eventEmitter.on('valuechange', callback, scope);
        }
        this.setEnable(GetValue(config, 'enable', undefined));
        this.setValue(GetValue(config, 'value', 0));
    }

    setEnable(enable) {
        if (enable === undefined) {
            enable = true;
        }
        this.enable = enable;
        return this;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        var oldValue = this._value;
        this._value = Clamp(value, 0, 1);

        if (oldValue !== this._value) {
            this.updateThumb(this._value);
            this.updateIndicator(this._value);
            this.eventEmitter.emit('valuechange', this._value, oldValue, this.eventEmitter);
        }
    }

    setValue(value, min, max) {
        if ((value === undefined) || (value === null)) {
            return this;
        }

        if (min !== undefined) {
            value = Percent(value, min, max);
        }
        this.value = value;
        return this;
    }

    addValue(inc, min, max) {
        if (min !== undefined) {
            inc = Percent(inc, min, max);
        }
        this.value += inc;
        return this;
    }

    getValue(min, max) {
        var value = this.value;
        if (min !== undefined) {
            value = Linear(min, max, value);
        }
        return value;
    }

    layout(parent, newWidth, newHeight) {
        super.layout(parent, newWidth, newHeight);
        this.updateThumb();
        this.updateIndicator();
        return this;
    }
}

const INPUTMODE = {
    drag: 0,
    click: 1,
    none: -1,
}

var methods = {
    getStartPoint: GetStartPoint,
    getEndPoint: GetEndPoint,
    updateThumb: UpdateThumb,
    updateIndicator: UpdateIndicator,
}
Object.assign(
    Slider.prototype,
    methods
);

export default Slider;import Slider from './Slider.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('slider', function (config) {
    var gameObject = new Slider(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Slider', Slider);

export default Slider;import ResizeGameObject from '../../../plugins/utils/size/ResizeGameObject.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;
const AlignLeft = Phaser.Display.Align.LEFT_CENTER;
const AlignTop = Phaser.Display.Align.TOP_CENTER;

var UpdateIndicator = function (t) {
    var indicator = this.childrenMap.indicator;
    if (indicator === undefined) {
        return this;
    }

    if (t === undefined) {
        t = this.value;
    }

    var newWidth, newHeight;
    var thumb = this.childrenMap.thumb;
    if (thumb) {
        if (this.orientation === 0) { // x, extend height
            var thumbBottom = (thumb.y - (thumb.displayHeight * thumb.originY)) + thumb.displayHeight;
            newHeight = thumbBottom - this.top;
        } else { // y, extend width
            var thumbRight = (thumb.x - (thumb.displayWidth * thumb.originX)) + thumb.displayWidth;
            newWidth = thumbRight - this.left;
        }
    } else {
        if (this.orientation === 0) { // x, extend height
            newHeight = this.height * t;
        } else { // y, extend width
            newWidth = this.width * t;
        }
    }
    ResizeGameObject(indicator, newWidth, newHeight);
    var align = (this.orientation === 1) ? AlignLeft : AlignTop;
    AlignIn(indicator, this, align);
    this.resetChildPositionState(indicator);
}

export default UpdateIndicator;import PercentToPosition from './PercentToPosition.js';

var UpdateThumb = function (t) {
    var thumb = this.childrenMap.thumb;
    if (thumb === undefined) {
        return this;
    }

    if (t === undefined) {
        t = this.value;
    }
    PercentToPosition(t, this.getStartPoint(), this.getEndPoint(), thumb);
    this.resetChildPositionState(thumb);
    return this;
}

export default UpdateThumb;import Swipe from '../../../plugins/input/gestures/swipe/Swipe.js';
export default Swipe;import Swipe from './Swipe.js';
import ObjectFactory from '../ObjectFactory.js';
import IsGameObject from '../../../plugins/utils/system/IsGameObject.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('swipe', function (gameObject, config) {
    if (!IsGameObject(gameObject)) {
        config = gameObject;
        gameObject = this.scene;
    }
    return new Swipe(gameObject, config);
});

SetValue(window, 'RexPlugins.UI.Swipe', Swipe);

export default Swipe;import {
    Show,
    Hide
} from '../utils/Hide.js';

export default {
    getButtonsSizer(groupName) {
        return this.childrenMap[groupName + 'ButtonsSizer'];
    },

    getButton(groupName, index) {
        var buttonsSizer = this.getButtonsSizer(groupName);
        return (buttonsSizer) ? buttonsSizer.getButton(index) : undefined;
    },

    emitButtonClick(groupName, index) {
        var buttonsSizer = this.getButtonsSizer(groupName);
        if (!buttonsSizer) {
            return this;
        }
        buttonsSizer.emitButtonClick(index);
        return this;
    },

    emitLeftButtonClick(index) {
        this.childrenMap.leftButtonsSizer.emitButtonClick(index);
        return this;
    },

    emitRightButtonClick(index) {
        this.childrenMap.rightButtonsSizer.emitButtonClick(index);
        return this;
    },

    emitTopButtonClick(index) {
        this.childrenMap.topButtonsSizer.emitButtonClick(index);
        return this;
    },

    emitBottomButtonClick(index) {
        this.childrenMap.bottomButtonsSizer.emitButtonClick(index);
        return this;
    },

    getLeftButton(index) {
        return this.childrenMap.leftButtonsSizer.getButton(index);
    },

    getRightButton(index) {
        return this.childrenMap.rightButtonsSizer.getButton(index);
    },

    getTopButton(index) {
        return this.childrenMap.topButtonsSizer.getButton(index);
    },

    getBottomButton(index) {
        return this.childrenMap.bottomButtonsSizer.getButton(index);
    },

    showButton(groupName, index) {
        Show(this.getButton(groupName, index));
        return this;
    },

    showLeftButton(index) {
        Show(this.getLeftButton(index));
        return this;
    },

    showRightButton(index) {
        Show(this.getRightButton(index));
        return this;
    },

    showTopButton(index) {
        Show(this.getTopButton(index));
        return this;
    },

    showBottomButton(index) {
        Show(this.getBottomButton(index));
        return this;
    },

    hideButton(groupName, index) {
        Hide(this.getButton(groupName, index));
        return this;
    },

    hideLeftButton(index) {
        Hide(this.getLeftButton(index));
        return this;
    },

    hideRightButton(index) {
        Hide(this.getRightButton(index));
        return this;
    },

    hideTopButton(index) {
        Hide(this.getTopButton(index));
        return this;
    },

    hideBottomButton(index) {
        Hide(this.getBottomButton(index));
        return this;
    },

    forEachLeftButton(callback, scope) {
        this.childrenMap.leftButtonsSizer.forEachButtton(callback, scope);
        return this;
    },

    forEachRightButton(callback, scope) {
        this.childrenMap.rightButtonsSizer.forEachButtton(callback, scope);
        return this;
    },

    forEachTopButton(callback, scope) {
        this.childrenMap.topButtonsSizer.forEachButtton(callback, scope);
        return this;
    },

    forEachBottomButton(callback, scope) {
        this.childrenMap.bottomButtonsSizer.forEachButtton(callback, scope);
        return this;
    },
};import GridSizer from '../gridsizer/GridSizer.js';
import Buttons from '../buttons/Buttons.js';
import ButtonMethods from './ButtonMethods.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Tabs extends GridSizer {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }
        // Create sizer
        config.column = 3;
        config.row = 3;
        super(scene, config);
        this.type = 'rexTabs';
        this.eventEmitter = GetValue(config, 'eventEmitter', this);

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var panel = GetValue(config, 'panel', undefined);
        var leftButtons = GetValue(config, 'leftButtons', undefined);
        if (leftButtons && leftButtons.length === 0) {
            leftButtons = undefined;
        }
        var leftButtonsSizer;
        var rightButtons = GetValue(config, 'rightButtons', undefined);
        if (rightButtons && rightButtons.length === 0) {
            rightButtons = undefined;
        }
        var rightButtonsSizer;
        var topButtons = GetValue(config, 'topButtons', undefined);
        if (topButtons && topButtons.length === 0) {
            topButtons = undefined;
        }
        var topButtonsSizer;
        var bottomButtons = GetValue(config, 'bottomButtons', undefined);
        if (bottomButtons && bottomButtons.length === 0) {
            bottomButtons = undefined;
        }
        var bottomButtonsSizer;
        var clickConfig = GetValue(config, 'click', undefined);

        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);
        var leftButtonsOffset = GetValue(config, 'space.leftButtonsOffset', 0);
        var rightButtonsOffset = GetValue(config, 'space.rightButtonsOffset', 0);
        var toptButtonsOffset = GetValue(config, 'space.topButtonsOffset', 0);
        var bottomButtonsOffset = GetValue(config, 'space.bottomButtonsOffset', 0);
        var leftButtonSpace = GetValue(config, 'space.leftButton', 0);
        var rightButtonSpace = GetValue(config, 'space.rightButton', 0);
        var topButtonSpace = GetValue(config, 'space.topButton', 0);
        var bottomButtonSpace = GetValue(config, 'space.bottomButton', 0);


        if (background) {
            this.addBackground(background);
        }

        if (panel) {
            var padding = {
                left: (leftButtons) ? 0 : paddingLeft,
                right: (rightButtons) ? 0 : paddingRight,
                top: (topButtons) ? 0 : paddingTop,
                bottom: (bottomButtons) ? 0 : paddingBottom
            };
            this.add(panel, 1, 1, 'center', padding, true);
        }

        if (leftButtons) {
            leftButtonsSizer = new Buttons(scene, {
                groupName: 'left',
                buttons: leftButtons,
                orientation: 1, // Top-Bottom
                space: leftButtonSpace,
                align: GetValue(config, 'align.leftButtons', undefined),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
            var padding = {
                left: paddingLeft,
                top: leftButtonsOffset,
            };
            this.add(leftButtonsSizer, 0, 1, 'top', padding, false);
        }

        if (rightButtons) {
            rightButtonsSizer = new Buttons(scene, {
                groupName: 'right',
                buttons: rightButtons,
                orientation: 1, // Top-Bottom
                space: rightButtonSpace,
                align: GetValue(config, 'align.rightButtons', undefined),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
            var padding = {
                right: paddingRight,
                top: rightButtonsOffset,
            };
            this.add(rightButtonsSizer, 2, 1, 'top', padding, false);
        }

        if (topButtons) {
            topButtonsSizer = new Buttons(scene, {
                groupName: 'top',
                buttons: topButtons,
                orientation: 0, // Left-Right
                space: topButtonSpace,
                align: GetValue(config, 'align.topButtons', undefined),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
            var padding = {
                top: paddingTop,
                left: toptButtonsOffset,
            };
            this.add(topButtonsSizer, 1, 0, 'left', padding, false);
        }

        if (bottomButtons) {
            bottomButtonsSizer = new Buttons(scene, {
                groupName: 'bottom',
                buttons: bottomButtons,
                orientation: 0, // Left-Right
                space: bottomButtonSpace,
                align: GetValue(config, 'align.bottomButtons', undefined),
                click: clickConfig,
                eventEmitter: this.eventEmitter,
            });
            var padding = {
                bottom: paddingBottom,
                left: bottomButtonsOffset,
            };
            this.add(bottomButtonsSizer, 1, 2, 'left', padding, false);
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('panel', panel);
        this.addChildrenMap('leftButtons', leftButtons);
        this.addChildrenMap('rightButtons', rightButtons);
        this.addChildrenMap('topButtons', topButtons);
        this.addChildrenMap('bottomButtons', bottomButtons);
        this.addChildrenMap('leftButtonsSizer', leftButtonsSizer);
        this.addChildrenMap('rightButtonsSizer', rightButtonsSizer);
        this.addChildrenMap('topButtonsSizer', topButtonsSizer);
        this.addChildrenMap('bottomButtonsSizer', bottomButtonsSizer);
    }
}

Object.assign(
    Tabs.prototype,
    ButtonMethods,
);

export default Tabs;import Tabs from './Tabs.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('tabs', function (config) {
    var gameObject = new Tabs(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Tabs', Tabs);

export default Tabs;import TagText from '../../../plugins/gameobjects/text/tagtext/TagText.js';
export default TagText;import TagText from './TagText.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('tagText', function (x, y, text, style) {
    var gameObject = new TagText(this.scene, x, y, text, style);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.TagText', TagText);

export default TagText;import Tap from '../../../plugins/input/gestures/tap/Tap.js';
export default Tap;import Tap from './Tap.js';
import ObjectFactory from '../ObjectFactory.js';
import IsGameObject from '../../../plugins/utils/system/IsGameObject.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('tap', function (gameObject, config) {
    if (!IsGameObject(gameObject)) {
        config = gameObject;
        gameObject = this.scene;
    }
    return new Tap(gameObject, config);
});

SetValue(window, 'RexPlugins.UI.Tap', Tap);

export default Tap;var AppendText = function (text) {
    this.setText(this.text + text);
    return this;
}
export default AppendText;var InjectProperties = function(textBlock) {
    Object.defineProperty(textBlock, 'childOY', {
        configurable: true,
        get: function () {
            return textBlock.textOY;
        },
        set: function (value) {
            textBlock.textOY = value;
        }
    });
    Object.defineProperty(textBlock, 'topChildOY', {
        get: function () {
            return textBlock.topTextOY;
        }
    });
    Object.defineProperty(textBlock, 'bottomChildOY', {
        get: function () {
            return textBlock.bottomTextOY;
        }
    });
};
export default InjectProperties;var SetText = function (text) {
    var textBlock = this.childrenMap.child;
    textBlock.setText(text);

    this.resizeController();
    return this;
}
export default SetText;import Scrollable from '../utils/scrollable/Scrollable.js';
import TextBlock from '../textblock/TextBlock.js';
import InjectProperties from './InjectProperties.js';
import SetText from './SetText.js';
import AppendText from './AppendText.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class TextArea extends Scrollable {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        // Create text-block
        var textObject = GetValue(config, 'text', undefined);
        var textWidth = GetValue(config, 'textWidth', undefined);
        var textHeight = GetValue(config, 'textHeight', undefined);
        var textMask = GetValue(config, 'textMask', true);
        var content = GetValue(config, 'content', '');
        var textBlock = new TextBlock(scene, {
            width: textWidth,
            height: textHeight,
            text: textObject,
            textMask: textMask,
            content: content,
            clamplTextOY: GetValue(config, 'clamplChildOY', false),
        });
        var proportion = (textWidth === undefined) ? 1 : 0;
        var expand = (textHeight === undefined);
        // Inject properties for scrollable interface
        InjectProperties(textBlock);

        // Fill config of scrollable
        config.scrollMode = 0; // Vertical
        config.type = 'rexTextArea';
        config.child = {
            gameObject: textBlock,
            proportion: proportion,
            expand: expand,
        };
        var spaceConfig = GetValue(config, 'space', undefined);
        if (spaceConfig) {
            spaceConfig.child = spaceConfig.text;
        }
        super(scene, config);

        this.addChildrenMap('text', textObject);
    }

    get text() {
        return this.childrenMap.child.text;
    }

    get linesCount() {
        return this.childrenMap.child.linesCount;
    }
}

var methods = {
    setText: SetText,
    appendText: AppendText,
}
Object.assign(
    TextArea.prototype,
    methods
);

export default TextArea;import TextArea from './TextArea.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('textArea', function (config) {
    var gameObject = new TextArea(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.TextArea', TextArea);

export default TextArea;var GetLines = function (startLineIdx) {
    var endLineIdx = startLineIdx + this.textObject.style.maxLines;
    var text;
    if (this.textObjectType === 0) {
        text = this.lines.slice(startLineIdx, endLineIdx).join('\n');
    } else {
        var startIdx = this.lines.getLineStartIndex(startLineIdx);
        var endIdx = this.lines.getLineEndIndex(endLineIdx - 1);
        text = this.lines.getSliceTagText(startIdx, endIdx, true);
    }
    return text;
}

export default GetLines;import ResizeText from './ResizeText.js';
import ResetTextObjectPosition from './ResetTextObjectPosition.js';
import GlobZone from '../../../plugins/utils/actions/GlobZone.js';

const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent, newWidth, newHeight) {
    // Skip invisible sizer
    if (this.rexSizer.hidden) {
        return this;
    }

    this.layoutInit(parent);

    // Set size
    if (newWidth === undefined) {
        newWidth = this.minWidth;
    }
    if (newHeight === undefined) {
        newHeight = this.minHeight;
    }
    this.resize(newWidth, newHeight);

    // Layout children
    var child, childConfig, padding;
    var startX = this.left,
        startY = this.top;
    var x, y, width, height; // Align zone

    // Layout text child
    // Skip invisible child
    child = this.textObject;
    if (!child.rexSizer.hidden) {
        childConfig = child.rexSizer;
        padding = childConfig.padding;
        x = (startX + padding.left);
        y = (startY + padding.top);
        width = this.width - padding.left - padding.right;
        height = this.height - padding.top - padding.bottom;
        ResizeText.call(this, child, width, height);
        GlobZone.setPosition(x, y).setSize(width, height);
        AlignIn(child, GlobZone, childConfig.align);

        // Layout text mask before reset text position
        if (this.textMask) {
            this.textMask.setPosition().resize();
            this.resetChildPositionState(this.textMask);
        }

        childConfig.preOffsetY = 0; // Clear preOffsetY
        ResetTextObjectPosition.call(this);
    }

    // Layout background children
    this.layoutBackgrounds();

    return this;
}

export default Layout;var LinesCountToTextHeight = function (linesCount) {
    // height = (maxLines * (lineHeight + lineSpacing)) - lineSpacing
    return (linesCount * (this.textLineHeight + this.textLineSpacing)) - this.textLineSpacing;
}
export default LinesCountToTextHeight;import SetTextObject from './SetTextObject.js';
import SetText from './SetText.js';
import UpdateTextObject from './UpdateTextObject.js';
import Layout from './Layout.js';

export default {
    setTextObject: SetTextObject,
    setText: SetText,
    updateTextObject: UpdateTextObject,
    layout: Layout,
};var ResetTextObjectPosition = function () {
    var config = this.textObject.rexSizer;
    this.textObject.y += (config.offsetY - config.preOffsetY);
    config.preOffsetY = config.offsetY;
    this.resetChildPositionState(this.textObject);
}
export default ResetTextObjectPosition;import TextHeightToLinesCount from './TextHeightToLinesCount.js';

var ResizeText = function (textObject, width, height) {
    if ((textObject.width === width) && (textObject.height === height)) {
        return;
    }

    textObject.setFixedSize(width, height);

    var style = textObject.style;
    var wrapWidth = Math.max(width, 0);

    var maxLines = Math.ceil(TextHeightToLinesCount.call(this, height)) + 1;

    if (this.textObjectType === 0) {
        style.wordWrapWidth = wrapWidth;
        style.maxLines = maxLines;
    } else {
        style.wrapWidth = wrapWidth;
        style.maxLines = maxLines;
    }

    // Render content again
    this.setText();
}

export default ResizeText;var SetText = function (text) {
    if (text !== undefined) {
        this.text = text;
    }

    // Wrap content in lines
    if (this.textObjectType === 0) {
        this.lines = this.textObject.getWrappedText(this.text); // lines in array
    } else {
        this.lines = this.textObject.getPenManager(this.text, this.lines); // pen manager
    }

    this.updateTextObject();
    return this;
}
export default SetText;import GetBoundsConfig from '../utils/GetBoundsConfig.js';
import IsTextGameObject from '../../../plugins/utils/text/IsTextGameObject.js';
import DefaultMask from '../../../plugins/utils/mask/DefaultMask.js';

const ALIGN_LEFTTOP = Phaser.Display.Align.TOP_LEFT;

var SetTextObject = function (gameObject, paddingConfig, maskEnable) {
    if (maskEnable === undefined) {
        maskEnable = true;
    }

    this.add(gameObject);
    if (paddingConfig === undefined) {
        paddingConfig = 0;
    }

    var config = this.getSizerConfig(gameObject);
    config.parent = this;
    config.align = ALIGN_LEFTTOP;
    config.padding = GetBoundsConfig(paddingConfig);
    config.expand = true;
    this.textObject = gameObject;
    this.textObjectType = (IsTextGameObject(gameObject)) ? 0 : 1;
    // Add more variables
    config.preOffsetY = 0;
    config.offsetY = 0;

    // Create mask of text object
    if (maskEnable) {
        this.textMask = new DefaultMask(this.textObject);
        this.textObject.setMask(this.textMask.createGeometryMask());
        this.add(this.textMask);
    }
    return this;
}

export default SetTextObject;import BaseSizer from '../basesizer/BaseSizer.js';
import Methods from './Methods.js';
import LinesCountToTextHeight from './LinesCountToTextHeight.js';
import TextHeightToLinesCount from './TextHeightToLinesCount.js';

const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
const GetValue = Phaser.Utils.Objects.GetValue;

class TextBlock extends BaseSizer {
    constructor(scene, x, y, minWidth, minHeight, config) {
        if (IsPlainObject(x)) {
            config = x;
            x = GetValue(config, 'x', 0);
            y = GetValue(config, 'y', 0);
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        } else if (IsPlainObject(minWidth)) {
            config = minWidth;
            minWidth = GetValue(config, 'width', undefined);
            minHeight = GetValue(config, 'height', undefined);
        }

        super(scene, x, y, minWidth, minHeight, config);

        this.type = 'rexTextBlock';
        this.textObject = undefined;
        this.textMask = undefined;
        this.textObjectType = undefined;
        this.lines = undefined; // array (default text object), or pens-manager (tag text object)
        this.text = GetValue(config, 'content', '');
        this._textOY = 0;
        this.execeedTopState = false;
        this.execeedBottomState = false;

        this.setClampMode(GetValue(config, 'clamplTextOY', true));

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var textObject = GetValue(config, 'text', undefined);
        if (textObject === undefined) {
            textObject = createDefaultTextObject(scene);
        }
        var textMaskEnable = GetValue(config, 'textMask', true);

        // Space
        var paddingConfig = GetValue(config, 'space', undefined);

        if (background) {
            this.addBackground(background);
        }

        this.setTextObject(textObject, paddingConfig, textMaskEnable);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }
        this.textObject = undefined;
        this.textMask = undefined;
        if (this.lines === undefined) {
            // Do nothing
        } else if (this.textObjectType === 0) {
            this.lines.length = 0;
        } else {
            this.lines.destroy();
        }
        super.destroy(fromScene);
    }

    setClampMode(mode) {
        this.clampTextOYMode = mode;
        return this;
    }

    get textLineHeight() {
        var style = this.textObject.style;
        return style.metrics.fontSize + style.strokeThickness;
    }

    get textLineSpacing() {
        return this.textObject.lineSpacing;
    }

    get linesCount() {
        var count;
        if (this.lines === undefined) {
            count = 0;
        } else if (this.textObjectType === 0) {
            count = this.lines.length;
        } else {
            count = this.lines.linesCount;
        }
        return count;
    }

    get visibleLinesCount() {
        return Math.floor(TextHeightToLinesCount.call(this, this.textObject.height));
    }

    get topTextOY() {
        return 0;
    }

    get bottomTextOY() {
        return -this.textVisibleHeight;
    }

    get textHeight() {
        return LinesCountToTextHeight.call(this, this.linesCount);
    }

    get textObjectHeight() {
        return this.textObject.height;
    }

    get textVisibleHeight() {
        var h;
        var textHeight = this.textHeight;
        var textObjectHeight = this.textObjectHeight;
        if (textHeight > textObjectHeight) {
            h = textHeight - textObjectHeight;
        } else {
            h = 0;
        }

        return h;
    }

    textOYExceedTop(oy) {
        if (oy === undefined) {
            oy = this.textOY;
        }
        return (oy > this.topTextOY);
    }

    textOYExeceedBottom(oy) {
        if (oy === undefined) {
            oy = this.textOY;
        }
        return (oy < this.bottomTextOY);
    }

    get textOY() {
        return this._textOY;
    }

    set textOY(oy) {
        var topTextOY = this.topTextOY;
        var bottomTextOY = this.bottomTextOY;
        var textOYExceedTop = this.textOYExceedTop(oy);
        var textOYExeceedBottom = this.textOYExeceedBottom(oy);

        if (this.clampTextOYMode) {
            if (this.visibleLinesCount > this.linesCount) {
                oy = 0;
            } else if (textOYExceedTop) {
                oy = topTextOY
            } else if (textOYExeceedBottom) {
                oy = bottomTextOY;
            }
        }

        if (this._textOY !== oy) {
            this._textOY = oy;
            this.updateTextObject();
        }

        if (textOYExceedTop) {
            if (!this.execeedTopState) {
                this.emit('execeedtop', this, oy, topTextOY);
            }
        }
        this.execeedTopState = textOYExceedTop;

        if (textOYExeceedBottom) {
            if (!this.execeedBottomState) {
                this.emit('execeedbottom', this, oy, bottomTextOY);
            }
        }
        this.execeedBottomState = textOYExeceedBottom;
    }

    setTextOY(oy) {
        this.textOY = oy;
        return this;
    }

    set t(value) {
        this.textOY = -this.textVisibleHeight * value;
    }

    get t() {
        var textVisibleHeight = this.textVisibleHeight;
        if (textVisibleHeight === 0) {
            return 0;
        }
        return (this.textOY / -textVisibleHeight);
    }

    setTextOYByPercentage(percentage) {
        this.t = percentage;
        return this;
    }
}

var createDefaultTextObject = function (scene) {
    return scene.add.text(0, 0, '');
};

Object.assign(
    TextBlock.prototype,
    Methods
);

export default TextBlock;import TextBlock from './TextBlock.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('textBlock', function (x, y, minWidth, minHeight, textGameObject, config) {
    var gameObject = new TextBlock(this.scene, x, y, minWidth, minHeight, textGameObject, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.TextBlock', TextBlock);

export default TextBlock;var TextHeightToLinesCount = function (height) {
    // height = (maxLines * (lineHeight + lineSpacing)) - lineSpacing
    return (height - this.textLineSpacing) / (this.textLineHeight + this.textLineSpacing);
}
export default TextHeightToLinesCount;import TextHeightToLinesCount from './TextHeightToLinesCount.js';
import LinesCountToTextHeight from './LinesCountToTextHeight.js';
import GetLines from './GetLines.js';
import ResetTextObjectPosition from './ResetTextObjectPosition.js';

var UpdateTextObject = function () {
    var startLineIndex = Math.max(Math.floor(TextHeightToLinesCount.call(this, -this.textOY)), 0);
    var textOffset = LinesCountToTextHeight.call(this, startLineIndex) + this.textOY;

    this.textObject.setText(GetLines.call(this, startLineIndex));
    this.textObject.rexSizer.offsetY = textOffset;
    ResetTextObjectPosition.call(this);
    return this;
}
export default UpdateTextObject;import Label from '../label/Label.js';
import TextPage from '../../../plugins/textpage.js';
import TextTyping from '../../../plugins/texttyping.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class TextBox extends Label {
    constructor(scene, config) {
        if (config === undefined) {
            config = {
                text: createDefaultTextObject(scene)
            }
        }

        super(scene, config);
        this.type = 'rexTextBox';

        var text = this.childrenMap.text;
        this.page = new TextPage(text, GetValue(config, 'page', undefined));
        this.typing = new TextTyping(text, GetValue(config, 'type', undefined));
        this.typing
            .on('complete', this.onPageEnd, this)
            .on('type', this.onType, this);

        this.textWidth = text.width;
        this.textHeight = text.height;
    }

    start(text, speed) {
        this.page.setText(text);
        if (speed !== undefined) {
            this.typing.setTypeSpeed(speed);
        }
        this.typeNextPage();
        return this;
    }

    typeNextPage() {
        if (!this.page.isLastPage) {
            var txt = this.page.getNextPage();
            this.typing.start(txt);
        } else {
            this.emit('complete');
        }
        return this;
    }

    pause() {
        this.typing.pause();
        return this;
    }

    resume() {
        this.typing.resume();
        return this;
    }

    stop(showAllText) {
        this.typing.stop(showAllText);
        return this;
    }

    get isTyping() {
        return this.typing.isTyping;
    }

    get isLastPage() {
        return this.page.isLastPage;
    }

    get isFirstPage() {
        return this.page.isFirstPage;
    }

    get pageCount() {
        return this.page.pageCount;
    }

    get pageIndex() {
        return this.page.pageIndex;
    }

    onType() {
        var text = this.childrenMap.text;
        if ((this.textWidth !== text.width) || (this.textHeight !== text.height)) {
            this.textWidth = text.width;
            this.textHeight = text.height;
            this.getTopmostSizer().layout();
        }
        this.emit('type');
    }

    onPageEnd() {
        this.emit('pageend');
    }

}

var createDefaultTextObject = function (scene) {
    return scene.add.text(0, 0, '', {
        wordWrap: {
            width: 200,
        },
        maxLines: 5
    });
};

export default TextBox;import TextBox from './TextBox.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('textBox', function (config) {
    var gameObject = new TextBox(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.TextBox', TextBox);

export default TextBox;export default {
    popUp: 0,
    fadeIn: 1,
    scaleDown: 0,
    fadeOut: 1,
}export default {
    popUp: function (gameObject, duration) {
        gameObject.popUp(duration);
    },

    scaleDown: function (gameObject, duration) {
        gameObject.scaleDownDestroy(duration, undefined, undefined, false);
    },

    fadeIn: function (gameObject, duration) {
        gameObject.fadeIn(duration);
    },

    fadeOut: function (gameObject, duration) {
        gameObject.fadeOut(duration, false);
    },
}import Label from '../label/Label.js';
import Const from './Const.js';
import DefaulttransitCallbacks from './DefaultTransitCallbacks.js';
import Player from '../../../plugins/logic/runcommands/tcrp/Player.js';
import NOOP from '../../../plugins/utils/object/NOOP.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Toast extends Label {
    constructor(scene, config) {
        if (config === undefined) {
            config = {
                text: createDefaultTextObject(scene)
            }
        }

        super(scene, config);
        this.type = 'rexToast';

        this.setTransitInTime(GetValue(config, 'duration.in', 200));
        this.setDisplayTime(GetValue(config, 'duration.hold', 1200));
        this.setTransitOutTime(GetValue(config, 'duration.out', 200));
        this.setTransitInCallback(GetValue(config, 'transitIn', Const.popUp));
        this.setTransitOutCallback(GetValue(config, 'transitOut', Const.scaleDown));

        this.player = new Player(this, { dtMode: 1 });
        this.messages = [];

        this.setVisible(false);
    }

    destroy(fromScene) {
        //  This Game Object has already been destroyed
        if (!this.scene) {
            return;
        }

        this.player.destroy();
        this.player = undefined;
        this.messages = undefined;
        super.destroy(fromScene);
    }

    setDisplayTime(time) {
        this.displayTime = time;
        return this;
    }

    setTransitOutTime(time) {
        this.transitOutTime = time;
        return this;
    }

    setTransitInTime(time) {
        this.transitInTime = time;
        return this;
    }

    setTransitInCallback(callback) {
        if (typeof (callback) === 'string') {
            callback = Const[callback];
        }

        switch (callback) {
            case Const.popUp:
                callback = DefaulttransitCallbacks.popUp;
                break;
            case Const.fadeIn:
                callback = DefaulttransitCallbacks.fadeIn;
                break;
        }

        this.transitInCallback = callback;
        // callback = function(gameObject, duration) {}
        return this;
    }

    setTransitOutCallback(callback) {
        if (typeof (callback) === 'string') {
            callback = Const[callback];
        }

        switch (callback) {
            case Const.scaleDown:
                callback = DefaulttransitCallbacks.scaleDown;
                break;
            case Const.fadeOut:
                callback = DefaulttransitCallbacks.fadeOut;
                break;
        }

        this.transitOutCallback = callback;
        // callback = function(gameObject, duration) {}
        return this;
    }

    show(callback) {
        if (callback === undefined) {
            // Try pop up a pendding message
            if (this.messages.length === 0) {
                return this;
            }
            callback = this.messages.shift();
        }

        if (this.player.isPlaying) {
            // Pend message
            this.messages.push(callback);
            return this;
        }

        // Recover to initial state
        this
            .setScale(1)
            .setVisible(true);
        if (typeof (callback) === 'string') {
            this.setText(callback);
        } else {
            callback(this);
        }
        this.layout();

        var commands = [
            [ // Transit-in
                0, // time
                [this.transitInCallback, this, this.transitInTime] // [callback, param, ...]
            ],
            [ // Hold
                this.transitInTime,
                [NOOP]
            ],
            [ // Transit-out
                this.displayTime,
                [this.transitOutCallback, this, this.transitOutTime]
            ],
            [ // End
                this.transitOutTime,
                [this.setVisible, false]
            ],
            [ // Complete - show next message
                30, // Add a small delay before complete
                [NOOP]
            ]
        ]
        this.player
            .load(commands, this)
            .once('complete', function () {
                this.show();
            }, this)
            .start();

        return this;
    }
}

export default Toast;import Toast from './Toast.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('toast', function (config) {
    var gameObject = new Toast(this.scene, config);
    this.scene.add.existing(gameObject); // It won't be added to display list, neither update list
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Toast', Toast);

export default Toast;const ALIGN = Phaser.Display.Align;
export default {
    center: ALIGN.CENTER,
    left: ALIGN.LEFT_CENTER,
    right: ALIGN.RIGHT_CENTER,
    top: ALIGN.TOP_CENTER,
    bottom: ALIGN.BOTTOM_CENTER,

    'left-top': ALIGN.TOP_LEFT,
    'left-center': ALIGN.LEFT_CENTER,
    'left-bottom': ALIGN.LEFT_BOTTOM,
    'center-top': ALIGN.TOP_CENTER,
    'center-center': ALIGN.CENTER,
    'center-bottom': ALIGN.BOTTOM_CENTER,
    'right-top': ALIGN.TOP_RIGHT,
    'right-center': ALIGN.RIGHT_CENTER,
    'right-bottom': ALIGN.RIGHT_BOTTOM
};const GetValue = Phaser.Utils.Objects.GetValue;
var GetBoundsConfig = function (config, out) {
    if (out === undefined) {
        out = {};
    }
    if (typeof (config) === 'number') {
        out.left = config;
        out.right = config;
        out.top = config;
        out.bottom = config;
    } else {
        out.left = GetValue(config, 'left', 0);
        out.right = GetValue(config, 'right', 0);
        out.top = GetValue(config, 'top', 0);
        out.bottom = GetValue(config, 'bottom', 0);
    }
    return out;
}
export default GetBoundsConfig;import SCROLLMODE from './ScrollModeConst.js';

const GetValue = Phaser.Utils.Objects.GetValue;

var GetScrollMode = function (config, key) {
    if (key === undefined) {
        key = 'scrollMode';
    }
    var scrollMode = GetValue(config, 'scrollMode', 0); // Vertical
    if (typeof (scrollMode) === 'string') {
        scrollMode = SCROLLMODE[scrollMode];
    }
    return scrollMode;
}
export default GetScrollMode;var GetSizerConfig = function (gameObject) {
    if (!gameObject.hasOwnProperty('rexSizer')) {
        gameObject.rexSizer = {};
    }
    return gameObject.rexSizer;
}
export default GetSizerConfig;import GetSizerConfig from './GetSizerConfig.js';

var Show = function (gameObject) {
    _hide(gameObject, false);
};

var Hide = function (gameObject) {
    _hide(gameObject, true);
};

var IsShown = function(gameObject) {
    if (!gameObject) {
        return false;
    }
    var config = GetSizerConfig(gameObject);
    return !config.hidden;
}

var _hide = function (gameObject, hidden) {
    if (!gameObject) {
        return;
    }
    var config = GetSizerConfig(gameObject);
    config.hidden = hidden;
    gameObject.setVisible(!hidden);
};

export {
    Show,
    Hide,
    IsShown,
};export default {
    x: 0,
    h: 0,
    horizontal: 0,
    'left-to-right': 0,
    y: 1,
    v: 1,
    vertical: 1,
    'top-to-bottom': 1
};export default {
    v: 0,
    vertical: 0,
    h: 1,
    horizontal: 1
};var Space = function (scene, width, height) {
    if (width === undefined) {
        width = 0;
    }
    if (height === undefined) {
        height = 0;
    }
    return scene.add.zone(0, 0, width, height);
}
export default Space;import Sizer from '../../sizer/Sizer.js';
import GetScrollMode from '../GetScrollMode.js';
import Slider from '../../slider/Slider.js';
import Scroller from '../../../../plugins/scroller.js';

const GetValue = Phaser.Utils.Objects.GetValue;

var CreateScrollableSizer = function (config) {
    var scene = this.scene;
    var scrollMode = GetScrollMode(config);
    var scrollableSizer = new Sizer(scene, { orientation: scrollMode });

    var child = GetValue(config, 'child.gameObject', undefined);
    var sliderConfig = GetValue(config, 'slider', undefined), slider;
    var scrollerConfig = GetValue(config, 'scroller', true), scroller;

    // Child, slider, scroller
    if (child) {
        var childSpace = GetValue(config, 'space.child', 0);
        this.childPadding = {};
        if (typeof (childSpace) !== 'number') {
            var childPadding = childSpace;
            if (scrollMode === 0) {
                childSpace = GetValue(childPadding, 'right', 0);
                this.childPadding.top = GetValue(childPadding, 'top', 0);
                this.childPadding.bottom = GetValue(childPadding, 'bottom', 0);
            } else {
                childSpace = GetValue(childPadding, 'bottom', 0);
                this.childPadding.top = GetValue(childPadding, 'left', 0);
                this.childPadding.bottom = GetValue(childPadding, 'right', 0);
            }
        } else {
            this.childPadding.top = 0;
            this.childPadding.bottom = 0;
        }

        var proportion = GetValue(config, 'child.proportion', 1);
        var expand = GetValue(config, 'child.expand', true);
        var padding;
        if (scrollMode === 0) {
            padding = {
                right: (sliderConfig) ? childSpace : 0,
            };
        } else {
            padding = {
                bottom: (sliderConfig) ? childSpace : 0
            };
        }
        scrollableSizer.add(child, proportion, 'center', padding, expand);

        if (sliderConfig) {
            if (sliderConfig === true) {
                sliderConfig = {};
            }
            sliderConfig.orientation = scrollableSizer.orientation;
            slider = new Slider(scene, sliderConfig);
            scrollableSizer.add(slider, 0, 'center', 0, true);
        }


        if (scrollerConfig) {
            if (scrollerConfig === true) {
                scrollerConfig = {};
            }
            scrollerConfig.orientation = scrollMode;
            scroller = new Scroller(child, scrollerConfig);
        }
    }

    // Control
    if (slider) {
        slider.on('valuechange', function (newValue) {
            this.t = newValue;
        }, this);
    }
    if (scroller) {
        scroller.on('valuechange', function (newValue) {
            this.childOY = newValue;
        }, this);
    }

    this.addChildrenMap('child', child);
    this.addChildrenMap('slider', slider);
    this.addChildrenMap('scroller', scroller);

    return scrollableSizer;
}

export default CreateScrollableSizer;import Sizer from '../../sizer/Sizer.js';
import GetScrollMode from '../GetScrollMode.js';
import CreateScrollableSizer from './CreateScrollableSizer.js';

const GetValue = Phaser.Utils.Objects.GetValue;

class Scrollable extends Sizer {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        var scrollMode = GetScrollMode(config); // Left-to-right, or top-to-bottom
        // Create sizer
        config.orientation = (scrollMode === 0) ? 1 : 0;
        super(scene, config);
        this.type = GetValue(config, 'type', 'rexScrollable');

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var scrollableSizer = CreateScrollableSizer.call(this, config);
        var header = GetValue(config, 'header', undefined);
        var footer = GetValue(config, 'footer', undefined);

        // Space
        var paddingLeft = GetValue(config, 'space.left', 0);
        var paddingRight = GetValue(config, 'space.right', 0);
        var paddingTop = GetValue(config, 'space.top', 0);
        var paddingBottom = GetValue(config, 'space.bottom', 0);

        // Background
        if (background) {
            this.addBackground(background);
        }

        if (header) {
            var align = GetValue(config, 'align.header', 'center');
            var headerSpace = GetValue(config, 'space.header', 0);
            var padding;
            if (scrollMode === 0) {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: headerSpace,
                };
            } else {
                padding = {
                    left: paddingLeft,
                    right: headerSpace,
                    top: paddingTop,
                    bottom: paddingBottom,
                };
            }
            var expand = GetValue(config, 'expand.header', true);
            this.add(header, 0, align, padding, expand);
        }

        if (scrollableSizer) {
            var padding;
            if (scrollMode === 0) {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: (header) ? 0 : paddingTop,
                    bottom: (footer) ? 0 : paddingBottom,
                };
            } else {
                padding = {
                    left: (header) ? 0 : paddingLeft,
                    right: (footer) ? 0 : paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom,
                };
            }
            this.add(scrollableSizer, 1, 'center', padding, true);
        }

        if (footer) {
            var align = GetValue(config, 'align.footer', 'center');
            var footerSpace = GetValue(config, 'space.footer', 0);
            var padding;
            if (scrollMode === 0) {
                padding = {
                    left: paddingLeft,
                    right: paddingRight,
                    top: footerSpace,
                    bottom: paddingBottom,
                };
            } else {
                padding = {
                    left: footerSpace,
                    right: paddingRight,
                    top: paddingTop,
                    bottom: paddingBottom,
                };
            }
            var expand = GetValue(config, 'expand.footer', true);
            this.add(footer, 0, align, padding, expand);
        }

        this.addChildrenMap('background', background);
        this.addChildrenMap('header', header);
        this.addChildrenMap('footer', footer);

        // Necessary properties of child object
        // child.t (RW), child.childOY (RW), child.topChildOY (R), child.bottomChildOY (R)
    }

    layout(parent, newWidth, newHeight) {
        super.layout(parent, newWidth, newHeight);
        this.resizeController();
        return this;
    }

    resizeController() {
        var topChildOY = this.topChildOY;
        var bottomChildOY = this.bottomChildOY;
        var scroller = this.childrenMap.scroller;
        var slider = this.childrenMap.slider;
        if (scroller) {
            scroller.setBounds(bottomChildOY, topChildOY);
        }
        if (slider) {
            slider.setEnable(bottomChildOY !== topChildOY);
        }
        this.updateController();
        return this;
    }

    updateController() {
        var scroller = this.childrenMap.scroller;
        var slider = this.childrenMap.slider;
        if (scroller) {
            scroller.setValue(this.childOY);
        }
        if (slider) {
            slider.setValue(this.t);
        }
    }

    set t(t) {
        // Get inner childT
        var childPadding = this.childPadding;
        if ((childPadding.top !== 0) || (childPadding.bottom !== 0)) {
            var child = this.childrenMap.child
            var innerHeight = (child.topChildOY - child.bottomChildOY);
            var outterHeight = innerHeight + childPadding.top + childPadding.bottom;
            var innerChildOY = (outterHeight * t) - childPadding.top;
            t = innerChildOY / innerHeight;
        }

        this.childrenMap.child.t = t;
        this.updateController();
    }

    get t() {
        var t = this.childrenMap.child.t;

        // Get outter childT
        var childPadding = this.childPadding;
        if ((childPadding.top !== 0) || (childPadding.bottom !== 0)) {
            var child = this.childrenMap.child
            var innerHeight = (child.topChildOY - child.bottomChildOY);
            var outterHeight = innerHeight + childPadding.top + childPadding.bottom;
            var outterChildOY = (innerHeight * t) + childPadding.top;
            t = outterChildOY / outterHeight;
        }
        return t;
    }

    set childOY(value) {
        this.childrenMap.child.childOY = value;
        this.updateController();
    }

    get childOY() {
        return this.childrenMap.child.childOY;
    }

    get topChildOY() {
        return this.childrenMap.child.topChildOY + this.childPadding.top;
    }

    get bottomChildOY() {
        return this.childrenMap.child.bottomChildOY - this.childPadding.bottom;
    }

    setChildOY(value) {
        this.childOY = value;
        return this;
    }

    setT(value) {
        this.t = value;
        return this;
    }

    scrollToTop() {
        this.t = 0;
        return this;
    }

    scrollToBottom() {
        this.t = 1;
        return this;
    }

    get sliderEnable() {
        var slider = this.childrenMap.slider;
        if (!slider) {
            return undefined;
        }

        return slider.enable;
    }

    set sliderEnable(value) {
        var slider = this.childrenMap.slider;
        if (!slider) {
            return;
        }
        slider.setEnable(value);
    }

    setSliderEnable(enabled) {
        if (enabled === undefined) {
            enabled = true;
        }
        this.sliderEnable = enabled;
        return this;
    }

    get scrollerEnable() {
        var scroller = this.childrenMap.scroller;
        if (!scroller) {
            return undefined;
        }

        return scroller.enable;
    }

    set scrollerEnable(value) {
        var scroller = this.childrenMap.scroller;
        if (!scroller) {
            return;
        }
        scroller.setEnable(value);
    }

    setScrollerEnable(enabled) {
        if (enabled === undefined) {
            enabled = true;
        }
        this.scrollerEnable = enabled;
        return this;
    }
}
export default Scrollable;import Video from '../../../plugins/gameobjects/video/videodom/VideoDOM.js';
export default Video;import VideoCanvas from '../../../plugins/gameobjects/video/videocanvas/VideoCanvas.js';
export default VideoCanvas;import VideoCanvas from './VideoCanvas.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('videoCanvas', function (x, y, width, height, config) {
    var gameObject = new VideoCanvas(this.scene, x, y, width, height, config);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.VideoCanvas', VideoCanvas);

export default VideoCanvas;import Video from './Video.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('video', function (x, y, width, height, config) {
    var gameObject = new Video(this.scene, x, y, width, height, config);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.Video', Video);

export default Video;import YoutubePlayer from '../../../plugins/gameobjects/youtubeplayer/YoutubePlayer.js';
export default YoutubePlayer;import YoutubePlayer from './YoutubePlayer.js';
import ObjectFactory from '../ObjectFactory.js';
import SetValue from '../../../plugins/utils/object/SetValue.js';

ObjectFactory.register('youtubePlayer', function (x, y, width, height, config) {
    var gameObject = new YoutubePlayer(this.scene, x, y, width, height, config);
    this.scene.add.existing(gameObject);
    return gameObject;
});

SetValue(window, 'RexPlugins.UI.YoutubePlayer', YoutubePlayer);

export default YoutubePlayer;
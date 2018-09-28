var shell = require('shelljs');

var baseWidth = 800;
var baseHeight = 500;

shell.ls('webpack.*.config.js').forEach(function (file) {
    shell.sed('-i', /\/\*\[\[DEFAULT_GAME_WIDTH\*\/\S*\/\*DEFAULT_GAME_WIDTH\]\]\*\//, '/*[[DEFAULT_GAME_WIDTH*/' + baseWidth + '/*DEFAULT_GAME_WIDTH]]*/', file);
    shell.sed('-i', /\/\*\[\[DEFAULT_GAME_HEIGHT\*\/\S*\/\*DEFAULT_GAME_HEIGHT\]\]\*\//, '/*[[DEFAULT_GAME_HEIGHT*/' + baseHeight + '/*DEFAULT_GAME_HEIGHT]]*/', file);
    shell.sed('-i', /\/\*\[\[MAX_GAME_WIDTH\*\/\S*\/\*MAX_GAME_WIDTH\]\]\*\//, '/*[[MAX_GAME_WIDTH*/' + maxWidth + '/*MAX_GAME_WIDTH]]*/', file);
    shell.sed('-i', /\/\*\[\[MAX_GAME_HEIGHT\*\/\S*\/\*MAX_GAME_HEIGHT\]\]\*\//, '/*[[MAX_GAME_HEIGHT*/' + maxHeight + '/*MAX_GAME_HEIGHT]]*/', file);
    shell.sed('-i', /\/\*\[\[SCALE_MODE\*\/\S*\/\*SCALE_MODE\]\]\*\//, '/*[[SCALE_MODE*/\'' + scaleMode + '\'/*SCALE_MODE]]*/', file);
});

shell.ls('electron-main.js').forEach(function (file) {
    shell.sed('-i', /\/\*\[\[DEFAULT_GAME_WIDTH\*\/\S*\/\*DEFAULT_GAME_WIDTH\]\]\*\//, '/*[[DEFAULT_GAME_WIDTH*/' + baseWidth + '/*DEFAULT_GAME_WIDTH]]*/', file);
    shell.sed('-i', /\/\*\[\[DEFAULT_GAME_HEIGHT\*\/\S*\/\*DEFAULT_GAME_HEIGHT\]\]\*\//, '/*[[DEFAULT_GAME_HEIGHT*/' + baseHeight + '/*DEFAULT_GAME_HEIGHT]]*/', file);
});


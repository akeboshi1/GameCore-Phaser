import boxen from "boxen";
import cp from "child_process";
import dirTree from "directory-tree";
import esbuild from "esbuild";
import fs from "fs-extra";
import sloc from "sloc";

const filterConfig = {
    extensions: /\.ts/,
    exclude: [
        /src\\stats/,
        /src\/stats/
    ]
};

const ESMInputBundle = [];

let info = "";
const times = [];

const startTimer = () => {
    times.push(Date.now());
};

const logTime = (message, skipTime = false) => {
    if (skipTime) {
        info = info.concat(`${message}\n`);

        startTimer();

        return;
    }

    const startTime = times[times.length - 1];
    let duration = Date.now() - startTime;

    if (duration > 1000) {
        duration /= 1000;
        duration = duration.toFixed(2);

        info = info.concat(`${message} (${duration} secs)\n`);
    } else {
        info = info.concat(`${message} (${duration} ms)\n`);
    }

    startTimer();
};

const endLog = (message) => {
    times.push(Date.now());

    let total = 0;

    for (let i = 1; i < times.length; i++) {
        const prev = times[i - 1];
        const now = times[i];

        total += (now - prev);
    }

    total /= 1000;

    info = info.concat(`${message} in ${total} secs`);

    // tslint:disable-next-line:no-console
    console.log(boxen(info, { padding: 1, margin: 1, borderColor: "cyanBright", borderStyle: "bold" }));

    //  Reset for next pass
    info = "";
    times.length = 0;
};

dirTree("src", filterConfig, (item) => {
    /*
    item.path: "src\\utils\\base64\\Base64ToArrayBuffer.ts"
    item.name: "Base64ToArrayBuffer.ts"
    item.size: 2019
    item.extension: ".ts"
    */

    //  First we need to see if this is an interface and bail out
    //  The quickest test is if the filename starts with a capital I:

    if (item.name.substring(0, 1) === "I") {
        //  Now we need to actually check inside the file *sigh*
        const fileContents = fs.readFileSync(item.path, "utf8");

        if (fileContents.includes("export interface") || fileContents.includes("export type")) {
            // console.log("Ignoring interface " + item.name);
            return;
        }
    }

    ESMInputBundle.push(item.path);
});

//  Clear folder contents

startTimer();

fs.emptyDirSync("./release");

logTime("Cleared target folder");

//  Copy package.json version number to dist/package.json

// const devPackage = fs.readJsonSync("./package.json");
// const distPackage = fs.readJsonSync("./dist.package.json");

// distPackage.version = devPackage.version;

// fs.writeJsonSync("./dist/package.json", distPackage, { spaces: 4 });

// //  Copy other files we need
// fs.copySync("./LICENSE", "./dist/LICENSE");
// fs.copySync("./logo.png", "./dist/logo.png");
// fs.copySync("./README.dist.md", "./dist/README.md");

// logTime("Copied dist files");

//  Run esbuild - this converts from TS into ES6 JS modules in the dist folder

const buildResults = esbuild.buildSync({
    entryPoints: ESMInputBundle,
    outdir: "./release/",
    target: "es6",
    minify: false,
    bundle: false,
});

if (buildResults.errors.length > 0) {
    // tslint:disable-next-line:no-console
    console.log("❌ esbuild error");
    // tslint:disable-next-line:no-console
    console.log(buildResults.errors);
    process.exit(1);
}

// logTime(`Built Phaser 4 v${distPackage.version} - ${ESMInputBundle.length} modules`);

//  ES6 Bundle

esbuild.buildSync({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    format: "esm",
    outfile: "./release/Phaser.js",
});

logTime("Built Phaser.js ES6 Bundle");

/*
const { umdCode, umdMap } = swc.transformFileSync("./dist/Phaser.js", {
    "jsc": {
        "parser": {
            "syntax": "ecmascript",
            "jsx": false,
            "dynamicImport": false,
            "privateMethod": false,
            "functionBind": false,
            "exportDefaultFrom": false,
            "exportNamespaceFrom": false,
            "decorators": false,
            "decoratorsBeforeExport": false,
            "topLevelAwait": false,
            "importMeta": false
        },
        "transform": null,
        "target": "es5",
        "loose": true,
        "externalHelpers": true,
        "keepClassNames": false
    },
    "module": {
        "type": "umd",
        "globals": {},
        "strict": false,
        "strictMode": true,
        "lazy": false,
        "noInterop": false
    },
    "minify": true,
    "sourceMaps": true
});

fs.writeFileSync("./dist/umd/Phaser.js", umdCode, { encoding: "utf8" });
fs.writeFileSync("./dist/umd/Phaser.js.map", umdMap, { encoding: "utf8" });

logTime("Built Phaser.js UMD Bundle");
*/

const slocSrc = fs.readFileSync("./release/Phaser.js", "utf8");

const stats = sloc(slocSrc, "js");

logTime(`${stats.source} lines of source code`);

endLog("Build complete");

// tslint:disable-next-line:no-console
console.log("Building TypeScript Defs ...");

startTimer();

//  Run tsc to generate TS defs

cp.exec("tsc --build ./tsconfig.json", (error, stdout, stderr) => {
    // tslint:disable-next-line:no-console
    console.log("start tsc ====>");
    if (error) {
        // tslint:disable-next-line:no-console
        console.log(`❌ error: ${error.message}`);
        // tslint:disable-next-line:no-console
        console.log(stdout);
        process.exit(1);
    }

    if (stderr) {
        // tslint:disable-next-line:no-console
        console.log(`❌ stderr: ${stderr}`);
        process.exit(1);
    }

    endLog("TypeScript Defs complete");
});

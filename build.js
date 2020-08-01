const fs = require('fs');
const path = require('path');
const package = fs.readFileSync('./package.json');
const { exec } = require('child_process');

const packageJson = JSON.parse(package);

const projectDirs = packageJson.workspaces;

const argsSet = new Set(process.argv);


projectDirs.forEach(dir => {
    if (argsSet.has('inc')) {
        const conf = getProjectPackageJson(dir);
        const [major, minor, patch] = conf.version.split('.');
        conf.version = `${major}.${minor}.${(+patch) + 1}`;
        savePackageJson(dir, conf);
    }
});


const projects = {
    
}

function getProjectPackageJson(dir) {
    const config = path.join(__dirname, dir, 'package.json');
    console.log(config);
    const configFile = fs.readFileSync(config);
    return JSON.parse(configFile);
}

function savePackageJson(dir, config) {
    const packageJson = path.join(__dirname, dir, 'package.json');
    fs.writeFileSync(packageJson, JSON.stringify(config, null, '\t'));
}

function build(dir) {
    const projectPath = path.join(__dirname, dir);
    exec(`cd ${projectPath} && npm run build`, (err, stdout) => {
        console.log(stdout);
    });

}
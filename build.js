const fs = require('fs');
const path = require('path');
const package = fs.readFileSync('./package.json');
const { exec } = require('child_process');
const readline = require('readline');

const argsSet = new Set(process.argv);

const packageJson = JSON.parse(package);
const projectDirs = packageJson.workspaces;
const projectNames = ['core', 'react', 'store'];
const scopeName = '@re-active';

console.log(projectDirs.filter(p => projectNames.some(name => p.indexOf(`/${name}`) > -1)))

const projects = projectDirs.filter(p => projectNames.some(name => p.indexOf(`/${name}`) > -1)).reduce((acc, dir) => {
    const name = dir.split('/')[1];
    const folderPath = path.join(__dirname, dir);
    const packageJsonPath = path.join(folderPath, 'package.json');

    acc[name] = {
        folderPath,
        packageName: `${scopeName}/${name}`,
        packageJsonPath,
        package: JSON.parse(fs.readFileSync(packageJsonPath)),
        changed: false,
    };

    return acc;
}, {});

console.log(projects);

async function runCommand(commmand) {
    return new Promise((res, rej) => {
        const child_process = exec(commmand);
        child_process.on('exit', () => {
            child_process.removeAllListeners();
            res();
        });

        child_process.on('error', (err) => {
            console.log(err);
            child_process.removeAllListeners();
            child_process.kill('SIGKILL');
            res();
        })

        child_process.stdout.on('data', (msg) => {
            console.log(msg)
        });
    })
}

async function build(name) {
    const { folderPath } = projects[name];
    await runCommand(`cd ${folderPath} && yarn build`);
}

function increment(name) {
    const [major, minor, patch] = projects[name].package.version.split('.');
    const newVersion = `${major}.${minor}.${(+patch) + 1}`;

    projects[name].package.version = newVersion;
    projects[name].changed = true;
    const { packageName } = projects[name];

    projectNames.forEach(p => {
        const project = projects[p];
        const { package } = project;

        if (packageName in (package.dependencies || {})) {
            package.dependencies[packageName] = newVersion;
            project.changed = true;
        }

        if (packageName in (package.devDependencies || {})) {
            package.devDependencies[packageName] = newVersion;
            project.changed = true;
        }
    })
}

async function publish(name) {
    increment(name);

    projectNames.forEach(p => {
        if (p !== name && projects[p].changed) {
            increment(p);
        }
    });

    commit();

    await Promise.all(projectNames
        .map(p => projects[p])
        .filter(p => p.changed)
        .map(p => runCommand(`cd ${p.folderPath} && npm publish --access=public`)));
}

function saveProject(name) {
    const project = projects[name];

    if (project.changed) {
        fs.writeFileSync(project.packageJsonPath, JSON.stringify(project.package, null, '\t'));
    }
}

function commit() {
    projectNames.forEach(saveProject);
}

async function buildAll() {
    await Promise.all(projectNames.map(name => build(name)));
    process.exit(0);
}

async function publishProject(name) {
    await publish(name);
    process.exit(0);
}

const reader = readline.createInterface({
    input: process.stdin,
})

if (process.argv[2] === 'build') {
    buildAll();
}

if (process.argv[2] === 'publish') {
    const name = process.argv[3];

    console.log(`publishing ${name}...`);

    if (projectNames.includes(name)) {
        publishProject(name);
    } else {
        console.log('project name should be one of ' + projectNames.join(' | '));
    }
}

if (process.argv.length === 2) {
    console.log('Listening commands...');
    reader.on('line', (text) => {

    })
}
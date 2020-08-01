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

function build(name) {
    const { folderPath } = projects[name];
    exec(`cd ${folderPath} && npm run build`, (err, stdout) => {
        console.log(stdout);
    });
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

function publish(name) {
    increment(name);

    projectNames.forEach(p => {
        if (p !== name && projects[p].changed) {
            increment(p);
        }
    });

    commit();

    projectNames.forEach(p => {
        const command = `cd ${projects[p].folderPath} && npm publish --access=public`;
        console.log(`executing ${command}`)
        exec(command, (err, stdout, stderr) => {
            console.log(err);
            console.log(stdout);
            console.error(stderr);
        });
    })
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


const reader = readline.createInterface({
    input: process.stdin,
})

if (process.argv[2] === 'build') {
    projectNames.forEach(build);
    process.exit(0);
}

if (process.argv[2] === 'publish') {
    const name = process.argv[3];

    console.log(`publishing ${name}...`);

    if (projectNames.includes(name)) {
        publish(name);
    } else {
        console.log('project name should be one of ' + projectNames.join(' | '));
    }
    // process.exit(0);
}

if (process.argv.length === 2) {
    console.log('Listening commands...');
    reader.on('line', (text) => {

    })
}
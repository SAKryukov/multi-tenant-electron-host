const { exec } = require("child_process");
const fs = require("fs");
const { argv } = require("node:process");
const path = require("node:path");

const application = String(); // as multi-tenant host
//const application = "Editor";
const medatadaFile = path.join(path.dirname(module.path), "metadata.json");
const metadata = (() => {
    let metadata = null;
    if (fs.existsSync(medatadaFile))
        metadata = JSON.parse(fs.readFileSync(medatadaFile));
    return metadata;
})(); //metadata

const windowsPlatform = "win32";
const platforms = new Set([windowsPlatform, "linux", "mas", "darwin"]);
const architectures = new Set(["ia32", "x64", "arm64", "armv7l"]);

const parseCommandLine = () => {
    let platform = null;
    let architecture = null;
    argv.forEach(value => {
        if (platforms.has(value) && platform == null)
            platform = value;
        if (architectures.has(value) && architecture == null)
            architecture = value;
    });
    if (!(platform && architecture)) {
        console.warn("Speficy both platform and CPU architecture. The supported combinations are:");
        for (const combination of metadata.build.supported)
            console.warn(`      ${combination}`);
        return;
    } //if
    return { platform, architecture, };
}; //parseCommandLine

const parsedArguments = parseCommandLine();
if (!parsedArguments) return;

let exe = String();
if (metadata && metadata.build && metadata.build.executableFileName)
    exe = metadata.build.executableFileName;
if (exe)
    exe = `--executable-name="${exe}"`;
let copyright = String();
if (metadata && metadata.copyright)
    copyright = metadata.copyright;
if (copyright)
    copyright = `--appCopyright="${copyright}"`.replace("&copy;", String.fromCharCode(0xA9));

const command = `npx @electron/packager ../${application} --overwrite --platform=${parsedArguments.platform} --arch=${parsedArguments.architecture} ${exe} ${copyright} --asar`;

const extractOutput = stdout => 
    stdout.substring(stdout.indexOf(module.path)).trim();
const copyExtraFiles = (targetPath, platform) => {
    let sourceDirectory = path.join(module.path, metadata.build.startFileSource);
    if (platform == windowsPlatform)
        sourceDirectory = path.join(sourceDirectory, windowsPlatform);
    const entries = fs.readdirSync(sourceDirectory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        if (entry.isDirectory()) continue;
        const source = path.join(sourceDirectory, entry.name);
        const target = path.join(targetPath, entry.name);
        fs.copyFile(
            source, target,
            error => {
                if (error)
                    console.error(`Copy error: ${error}`);
            });
        files.push(entry.name);
    } //loop
    return files;
} //copyExtraFiles

const purgeDirectories = targetPath => {
    const purgeDirectory = directory => {
        const entries = fs.readdirSync(path.join(targetPath, directory.directory));
        for (const entry of entries) {
            if (directory.except.includes(entry)) continue;
            const filename = path.join(targetPath, directory.directory, entry);
            fs.unlink(
                filename,
                error => {
                    if (error)
                        console.error(`File remove error: ${error}`);
            });
        } //loop
    }; //purgeDirectory
    for (const directory of metadata.build.directoriesToPurge)
        purgeDirectory(directory);
}; //purgeDirectories

const copyDirectories = targetPath => {
    for (const directory of metadata.build.directoriesToCopy)
        fs.cp(
            directory.from,
            path.join(targetPath, directory.to),
            {recursive: true},
            error => {
                if (error)
                    console.error(`Copy directory error: ${error}`);
            });
}; //copyDirectories

const showError = error => {
    if (!error) return false;
    console.error(`Electron/packager error: ${error}`);
    return true;
}; //showError

exec(command, (error, stdout, stderr) => {
    if (showError(error?.message)) return;
    if (showError(stderr)) return;
    console.log(stdout);
    const outputDirectory = extractOutput(stdout);
    purgeDirectories(outputDirectory);
    copyDirectories(outputDirectory);
    console.log(`Added application start scripts:
        ${copyExtraFiles(outputDirectory, parsedArguments.platform).join(", ")}`);
});

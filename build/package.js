const { exec } = require("child_process");
const fs = require("fs");
const { argv } = require("node:process");
const path = require("node:path");

const application = "Editor"; // can be changed to "" to build multi-tenant-host
//const application = "";

const medatadaFile = `../${application}/metadata.json`;
const supportedCombinations =[
    "darwin arm64",
    "darwin x64",
    "linux arm64",
    "linux armv7l",
    "linux x64",
    "mas arm64",
    "mas x64",
    "win32 arm64",
    "win32 ia32",
    "win32 x64",];
const platforms = new Set(["win32", "linux", "mas", "darwin"]);
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
        console.log("Speficy both platform and CPU architecture. The supported combinations are:");
        for (const combination of supportedCombinations)
            console.log(`      ${combination}`);
        return;
    } //if
    return { platform, architecture, };
}; //parseCommandLine

const parsedArguments = parseCommandLine();
if (!parsedArguments) return;

const metadata = (() => {
    const script = argv[1];
    const filename = path.join(path.dirname(script), medatadaFile);
    let metadata = null;
    if (fs.existsSync(filename))
        metadata = JSON.parse(fs.readFileSync(filename));
    return metadata;
})(); //metadata

let exe = "";
if (metadata && metadata["executable-file-name"])
    exe = metadata["executable-file-name"];
if (exe)
    exe = `--executable-name="${exe}"`;
let copyright = ""
if (metadata && metadata.copyright)
    copyright = metadata.copyright;
if (copyright)
    copyright = `--appCopyright="${copyright}"`.replace("&copy;", String.fromCharCode(0xA9));

const command = `npx @electron/packager ../${application} --overwrite --platform=${parsedArguments.platform} --arch=${parsedArguments.architecture} ${exe} ${copyright} --asar`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing electron-packager: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`electron-packager stderr: ${stderr}`);
        return;
    }
    console.log(`electron-packager stdout: ${stdout}`);
    console.log(`Electron application packaged successfully
        for ${parsedArguments.platform} ${parsedArguments.architecture}!`);
});

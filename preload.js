// Requirejs compatibility in Electron app
console.log('Preloading...');
if (window.require) {
    window.requireNode = window.require;
    window.moduleNode  = window.module;

    window.currentDir = __dirname;
    window.nodeDir    = __dirname + '/node_modules/';

    window.require = undefined;
    window.module  = undefined;
}

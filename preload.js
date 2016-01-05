// Requirejs compatibility in Electron app
console.log('Preloading...');
if (window.require) {
    window.requireNode = window.require;
    window.moduleNode  = window.module;

    window.require = undefined;
    window.module  = undefined;
}

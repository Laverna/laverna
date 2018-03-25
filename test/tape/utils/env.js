/**
 * Test environment utils: utils/Env.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Env from '../../../app/scripts/utils/Env';
import device from 'device-detect.js';

const Modernizr  = {};
global.Modernizr = Modernizr;

let sand;
test('Env: before()', t => {
    sand = sinon.sandbox.create();

    t.end();
});

test('Env: constructor()', t => {
    sand.spy(Env.prototype.channel, 'reply');

    const env = new Env();

    t.equal(env.channel.reply.calledWith('isMobile'), true,
        'replies to isMobile requests');
    t.equal(env.channel.reply.calledWith('isWebkit'), true,
        'replies to isWebkit requests');
    t.equal(env.channel.reply.calledWith('canUseWorkers'), true,
        'replies to canUseWorkers requests');
    t.equal(env.channel.reply.calledWith('platform'), true,
        'replies to platform requests');

    sand.restore();
    t.end();
});

test('Env: isMobile', t => {
    sand.stub(device, 'mobile').returns(true);
    sand.stub(device, 'tablet').returns(false);

    const env = new Env();

    t.equal(device.mobile.called, true,
        'uses device.mobile() to detect if it\'s a mobile device');
    t.equal(device.tablet.notCalled, true,
        'checks if it\'s a tablet only if it\'s not a mobile device');
    t.equal(env.isMobile, true, 'returns a correct value');

    sand.restore();
    t.end();
});

test('Env: isWebkit', t => {
    document.documentElement.style.WebkitAppearance = true;
    const env = new Env();

    t.equal(env.isWebkit, true, 'detects if it\'s a webkit device');

    delete document.documentElement.style.WebkitAppearance;
    t.end();
});

test('Env: canUseWorkers() - Modernizr', t => {
    const env = new Env();

    Modernizr.webworkers = false;
    t.equal(env.canUseWorkers(), false, 'returns false if workers are not available');

    Modernizr.webworkers = true;
    t.equal(env.canUseWorkers(), true, 'returns true if workers are available');

    t.end();
});

test('Env: canUseWorkers() - isWebkit', t => {
    const env = new Env();

    Object.defineProperty(env, 'isWebkit', {get: () => true, configurable: true});
    t.equal(env.canUseWorkers(), false,
        'returns false if it\'s a webkit-based browser');

    delete env.isWebkit;
    Object.defineProperty(env, 'isWebkit', {get: () => false});
    t.equal(env.canUseWorkers(), true,
        'returns true if it\'s not a webkit-based browser');

    t.end();
});

test('Env: canUseWorkers() - isPalemoonOrSailfish', t => {
    const env = new Env();
    Object.defineProperty(env, 'isPalemoonOrSailfish', {
        get: () => true,
        configurable: true,
    });

    t.equal(env.canUseWorkers(), false,
        'returns false if it\'s palemoon/sailfish');

    Object.defineProperty(env, 'isPalemoonOrSailfish', {get: () => false});
    t.equal(env.canUseWorkers(), true,
        'returns true if it\'s not palemoon/sailfish');

    t.end();
});

test('Env: getPlatform() - mobile', t => {
    const env = new Env();

    sand.stub(device, 'mobile').returns(true);
    t.equal(env.getPlatform(), 'mobile', 'returns "mobile"');

    sand.restore();
    t.end();
});

test('Env: getPlatform() - electron', t => {
    const env = new Env();
    window.requireNode = true;
    t.equal(env.getPlatform(), 'electron', 'returns "electron"');
    window.requireNode = false;
    t.end();
});

test('Env: getPlatform() - browser', t => {
    const env = new Env();
    t.equal(env.getPlatform(), 'browser', 'returns "browser"');
    t.end();
});

/**
 * Test: utils/theme.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import theme from '../../../app/scripts/utils/theme';

let sand;
test('utils/theme: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('utils/theme: applyTheme()', t => {
    const attr = sand.stub();
    global.$   = sand.stub().returns({attr});

    sand.stub(Radio, 'request')
    .withArgs('collections/Configs', 'findConfig', {name: 'theme'})
    .returns('default');

    theme.applyTheme();
    t.equal(attr.calledWithMatch('href', 'styles/theme-default.css'), true,
        'applies the default theme');

    theme.applyTheme({name: 'dark'});
    t.equal(attr.calledWith('href', 'styles/theme-dark.css'), true,
        'applies the dark theme');

    sand.restore();
    t.end();
});

test('utils/theme: initializer()', t => {
    const on = sand.stub(Radio, 'on');
    sand.stub(theme, 'applyTheme');

    theme.initializer();

    t.equal(theme.applyTheme.called, true, 'applies the theme');
    t.equal(on.calledWith('components/settings', 'changeTheme', theme.applyTheme),
        true, 'listens to "changeTheme" event');

    sand.restore();
    t.end();
});

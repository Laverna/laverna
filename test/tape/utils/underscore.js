/**
 * Test utils/underscore.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from '../../../app/scripts/utils/underscore';
import i18next from 'i18next';

let sand;
test('underscore: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('underscore: i18n()', t => {
    const spy = sand.spy(i18next, 't');
    _.i18n('hello');
    t.equal(spy.calledWith('hello'), true, 'uses i18next');

    _.i18n('hello', {myVar: 'test'});
    t.equal(spy.calledWith('hello', {myVar: 'test'}), true, 'uses options');

    sand.restore();
    t.end();
});

test('underscore: templateSettings', t => {
    t.equal(_.template('{{test}}')({test: 'Test'}), 'Test', 'compiles {{myVar}}');
    t.equal(_.template('{{test}}')({test: '<b>Test</b>'}), _.escape('<b>Test</b>'),
        'escapes special characters for {{myVar}}');

    t.equal(_.template('{=test}')({test: 'Test'}), 'Test', 'compiles {=myVar}');
    t.equal(_.template('{=test}')({test: '<b>Test</b>'}), '<b>Test</b>',
        'does not escape characters for {=myVar}');

    const tmpl = _.template('<% if (res) { %>Test<% } %>');
    t.equal(tmpl({res: true}), 'Test', 'executes JS code');

    t.end();
});

test('underscore: cleanXSS() - sanitize', t => {
    const safeTags   = '<b>Bold</b><a href="https://laverna.cc"></a>';
    const unsafeTags = '<b onclick="alert("yes")">Hello</b>';
    const text = `<script>alert("yes")</script>${safeTags}${unsafeTags}`;

    t.notEqual(_.cleanXSS(text), text, 'sanitizes XSS');
    t.notEqual(_.cleanXSS(text).search(safeTags), -1,
        'does not remove safe HTML tags');
    t.equal(_.cleanXSS(text).search(unsafeTags), -1,
        'removes unsafe HTML');

    t.end();
});

test('underscore: cleanXSS() - unescape', t => {
    const spy  = sand.spy(_, 'runTimes');
    const text = _.escape('<b>Bold</b>');

    t.equal(_.cleanXSS(text, true), '<b>Bold</b>', 'unescapes escaped characters');
    t.equal(spy.called, true, 'executes _.runTimes()');
    sand.restore();
    t.end();
});

test('underscore: cleanXSS() - stripTags', t => {
    const text = '<b>Bold</b>';
    t.equal(_.cleanXSS(text, false, true), 'Bold', 'removes HTML tags');
    t.end();
});

test('underscore: runTimes()', t => {
    const stub = sand.stub().returns('Test');
    t.equal(_.runTimes(stub, 2), 'Test');
    t.equal(stub.calledTwice, true,
        'executes a callback the specified amount of times');

    const stubWith = sand.stub();
    _.runTimes(stubWith, 2, 'hello', 'world');
    t.equal(stubWith.calledWith('hello', 'world'), true,
        'executes a callback with arguments');

    t.end();
});

test('underscore: stripTags()', t => {
    const text = '<b>Bold</b><script></script>';
    t.equal(_.stripTags(text), 'Bold', 'removes HTML tags');
    t.end();
});

test('Underscore: capitalize()', t => {
    t.equal(_.capitalize('hello world'), 'Hello world',
        'Convert the first letter of a string to uppercase');
    t.end();
});

test('Underscore: splitBy4()', t => {
    t.equal(_.splitBy4('fourfourfour').length, 14);
    t.equal(_.splitBy4('fourfourfour').search('four four four') !== -1, true,
        'puts spaces');
    t.end();
});

test('Underscore: countWords()', t => {
    t.equal(_.countWords('# Count **words**'), 2);
    t.equal(_.countWords(`English, العربية, Italiano, Bosnian, Čeština, Dansk,
		Deutsch, Schwiizerdütsch, Ελληνικά, Esperanto, Español, Français, Hindi,
		한국어, Marathi, Norsk bokmål, Nederlands, Norsk nynorsk, Occitan, Lietuvių,
		Latviešu, Polski, Portugisich, Русский, Svenska, Shqip, Türkçe`), 29);

	t.equal(_.countWords(''), 0, 'returns 0 if it found no words');

    t.end();
});

test('Underscore: selectOption()', t => {
    t.equal(_.selectOption('active', 'not'), '', 'returns empty string');
    t.equal(_.selectOption('active', 'active'), 'selected="selected" ');
    t.end();
});

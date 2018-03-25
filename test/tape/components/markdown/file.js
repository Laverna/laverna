/**
 * Test components/markdown/file
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import file from '../../../../app/scripts/components/markdown/file';

let sand;
test('markdown/file: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('markdown/file: pattern', t => {
    t.equal(file.pattern instanceof RegExp, true, 'is a regular expression');
    t.end();
});

test('markdown/file: urls', t => {
    t.equal(typeof file.urls, 'object');
    t.end();
});

test('markdown/file: init()', t => {
    const image = function() {};
    const md    = {renderer: {rules: {image}}};

    file.init(md);
    t.equal(file.md, md, 'creates md property');
    t.equal(file.imageRule, image, 'saves the original image rule');

    t.equal(typeof md.renderer.rules.link_open, 'function',
        'overrides the original link_open rule');
    t.notEqual(md.renderer.rules.image, image,
        'overrides the original image rule');

    t.end();
});

test('markdown/file: linkOpen()', t => {
    sand.stub(file, 'replaceLink');
    const self = {renderToken: sand.stub()};
    const opts = [
        'tokens', 'idx', 'opt', 'env', self,
    ];

    file.linkOpen(...opts);
    t.equal(file.replaceLink.calledWith(...opts), true,
        'calls replaceLink method');
    t.equal(self.renderToken.calledWith(...opts), true,
        'calls renderToken method');

    sand.restore();
    t.end();
});

test('markdown/file: image()', t => {
    const opts = [
        'tokens', 'idx', 'opt', 'env', 'self',
    ];
    sand.stub(file, 'replaceLink');
    sand.stub(file, 'imageRule');

    file.image(...opts);
    t.equal(file.replaceLink.calledWith(...opts), true, 'calls replaceLink method');
    t.equal(file.imageRule.calledWith(...opts), true,
        'calls the original image rule method');

    sand.restore();
    t.end();
});

test('markdown/file: replaceLink()', t => {
    sand.spy(file, 'getAttrName');
    sand.stub(file, 'create');
    const attr   = [0, '#file:a-1-2'];
    const tokens = [
        {
            type      : 'image',
            attrs     : {test: attr},
            attrIndex : sand.stub().returns('test'),
        },
    ];
    const env = {clonedFiles: [1]};

    file.replaceLink(tokens, 0, null, env);
    t.equal(file.getAttrName.calledWith(tokens[0]), true,
        'determines what attribute needs to be changed');
    t.equal(env.files.indexOf('a-1-2') !== -1, true, 'saves the file ID');
    t.equal(file.create.calledWith(attr, 'a-1-2', env), true,
        'creates an object URL');

    sand.restore();
    t.end();
});

test('markdown/file: getAttrName()', t => {
    t.equal(file.getAttrName({type: 'image'}), 'src',
        'returns "src" if token is equal to image');
    t.equal(file.getAttrName({type: 'link'}), 'href',
        'returns "href" if token is not equal to image');

    t.end();
});

test('markdown/file: create()', t => {
    const model = {id: '1', url: 'blob://url'};
    const env   = {
        clonedFiles: [model],
    };

    file.create({}, '2', env);
    t.equal(file.urls['2'], undefined,
        'does nothing if the model does not exist');

    file.create({}, '1', env);
    t.equal(file.urls[model.id], 'blob://url', 'saves the object URL');

    global.URL = null;
    file.urls  = {};
    t.end();
});

test('markdown/file: revoke()', t => {
    const model = {id: '1-2', src: 'src'};
    file.urls   = {'1-2': 'file-src', '2-2': 'file-src2'};

    global.URL = {revokeObjectURL: sand.stub()};
    file.revoke({clonedFiles: [model]});
    t.equal(URL.revokeObjectURL.calledWith('file-src'), false,
        'revokes the object URL');
    t.equal(URL.revokeObjectURL.calledWith('file-src2'), true,
        'does not revoke a URL that is still used');

    file.urls = {};
    t.end();
});

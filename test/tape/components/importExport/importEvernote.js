/**
 * Test components/importExport/ImportEvernote
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from 'underscore';
import Radio from 'backbone.radio';
import fs from 'fs';
import '../../../../app/scripts/utils/underscore';
import Import from '../../../../app/scripts/components/importExport/ImportEvernote';

const xml = fs.readFileSync(`${__dirname}/backup.enex`, {encoding: 'utf8'});

let sand;
test('importExport/ImportEvernote: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/ImportEvernote: init()', t => {
    const con = new Import({xml});
    const req = sand.stub(Radio, 'request').resolves(true);

    con.init()
    .then(res => {
        t.equal(res, true, 'returns "true"');
        t.equal(req.callCount, 8, 'saves both notes');

        t.equal(req.calledWithMatch('collections/Tags', 'addTags'),
            true, 'saves tags');
        t.equal(req.calledWithMatch('collections/Files', 'addFiles'),
            true, 'saves files');
        t.equal(req.calledWith('collections/Notes', 'saveModelObject'),
            true, 'saves notes');

        con.options.xml = null;
        return con.init();
    })
    .then(res => {
        t.equal(res, false, 'returns false');
        sand.restore();
        t.end();
    });
});

test('importExport/ImportEvernote: checkFiles()', t => {
    const con = new Import({xml});

    t.equal(con.checkFiles(), true, 'returns true if XML is present in options');

    con.options.xml = '';
    t.equal(con.checkFiles(), false, 'returns false if XML is empty');

    con.options = {xml: null, files: [{name: 'backup.enex', size: 1000}]};
    t.equal(con.checkFiles(), true, 'returns true if an ENEX file is present');

    con.options.files[0].name = 'backup.zip';
    t.equal(con.checkFiles(), false, 'returns false if it is not ENEX file');

    con.options.files[0] = {name: 'backup.enex', size: 0};
    t.equal(con.checkFiles(), false, 'returns false if it is an empty file');

    t.end();
});

test('importExport/ImportEvernote: xml2js()', t => {
    const con = new Import({xml});
    t.equal(_.isArray(con.xml2js(xml)), true, 'returns an array');
    t.end();
});

test('importExport/ImportEvernote: getXml()', t => {
    const con  = new Import({xml});
    const read = sand.stub(con, 'readText').withArgs({name: '1'})
    .resolves('xml');

    con.getXml()
    .then(res => {
        t.equal(res, xml, 'returns XML which was provided');
        t.equal(read.notCalled, true, 'does not call readText()');

        con.options = {xml: null, files: [{name: '1'}]};
        return con.getXml();
    })
    .then(res => {
        t.equal(read.called, true, 'calls readText()');
        t.equal(res, 'xml', 'resolves with XML file');

        sand.restore();
        t.end();
    });
});

test('importExport/ImportEvernote: parseData() - note', t => {
    const con = new Import({xml});
    const els = con.xml2js(xml);

    t.notEqual(_.findWhere(els[1].elements, {name: 'resource'}), undefined,
        'contains a resource');

    const data = con.parseData(els[1].elements);
    t.equal(data.note.title, 'Bitcoin', 'contains "Title"');

    // Tags
    t.deepEqual(data.note.tags, ['money', 'finance', 'cryptography'], 'contains tags');
    t.equal(data.note.content.search('#money #finance #cryptography') > -1, true,
        'the content of the note contains tags');

    // Tasks
    t.notEqual(data.note.content.search('\\[x\\] Upload the white paper'), true,
        'content contains task "Upload the white paper"');
    t.notEqual(data.note.content.search('\\[x\\] Upload the logo'), true,
        'content contains task "Upload the logo"');
    t.notEqual(data.note.content.search('\\[\\] Write something about it'), true,
        'content contains task "Write something about it"');

    // Attachment links
    const a = '\\[bitcoin.pdf\\]\\(#file:d56d71ecadf2137be09d8b1d35c6c042\\)';
    t.notEqual(data.note.content.search(a), -1, 'content contains a link to bitcoin.pdf');

    // eslint-disable-next-line
    const p = '!\\[2000px-Bitcoin_logo_svg.png\\]\\(#file:161db755b7b5bb7c5a69a74c0d7f116c\\)';
    t.notEqual(data.note.content.search(p), -1, 'content contains image');

    t.end();
});

test('importExport/ImportEvernote: parseData() - attachments', t => {
    const con = new Import({xml});
    const els = con.xml2js(xml);

    t.notEqual(_.findWhere(els[1].elements, {name: 'resource'}), undefined,
        'contains a resource');
    const data = con.parseData(els[1].elements);

    t.deepEqual(
        data.note.files,
        ['d56d71ecadf2137be09d8b1d35c6c042', '161db755b7b5bb7c5a69a74c0d7f116c'],
        'note contains an array of IDs of attachments'
    );

    const pdf = _.findWhere(data.files, {id: 'd56d71ecadf2137be09d8b1d35c6c042'});
    t.notEqual(pdf, undefined, 'contains the PDF file');
    t.equal(pdf.fileType, 'application/pdf', 'PDF file has a correct fileType');
    t.equal(pdf.src.length > 1, true, 'PDF file contains src property');

    const img = _.findWhere(data.files, {id: '161db755b7b5bb7c5a69a74c0d7f116c'});
    t.notEqual(img, undefined, 'contains the picture');
    t.equal(img.fileType, 'image/png', 'The picture has a correct fileType');
    t.equal(img.src.length > 1, true, 'Picture file contains src property');

    t.end();
});

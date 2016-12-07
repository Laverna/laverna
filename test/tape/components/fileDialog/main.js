/**
 * Test components/fileDialog/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import initialize from '../../../../app/scripts/components/fileDialog/main';

test('fileDialog/main', t => {
    const reply = sinon.stub();
    sinon.stub(Radio, 'channel').returns({reply});

    initialize();
    t.equal(reply.calledWith('show'), true, 'replies to "show" request');

    Radio.channel.restore();
    t.end();
});

/**
 * Test components/linkDialog/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import initialize from '../../../../app/scripts/components/linkDialog/main';

test('linkDialog/main', t => {
    const reply = sinon.stub();
    sinon.stub(Radio, 'channel').returns({reply});

    initialize();
    t.equal(reply.calledWith('show'), true, 'replies to "show" request');

    Radio.channel.restore();
    t.end();
});

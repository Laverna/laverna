/**
 * @file Test collections/modules/Edits
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../app/scripts/utils/underscore';
import Module from '../../../../app/scripts/collections/modules/Edits';
import Edits from '../../../../app/scripts/collections/Edits';

import Edit from '../../../../app/scripts/models/Edit';
import Shadow from '../../../../app/scripts/models/Shadow';

let sand;
test('collections/modules/Edits: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Edits: Collection', t => {
    const mod = new Module();
    t.equal(mod.Collection, Edits);
    t.end();
});

test('collections/modules/Edits: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({
        clearDiffs: mod.clearDiffs,
    }), true, 'replies to additional requests');

    sand.restore();
    t.end();
});

test('collections/modules/Edits: clearDiffs()', t => {
    const mod    = new Module();
    const data   = {p: 1, diffs: [{m: 1}, {m: 2}, {m: 3}, {m: 4}]};
    const shadow = new Shadow({p: 4, m: 3});
    sand.stub(mod, 'saveModel');

    const model  = new Edit(data);
    mod.clearDiffs({model, shadow, clearAll: true});
    t.equal(model.get('diffs').length, 0, 'clears all diffs if "clearAll" is true');
    t.equal(model.get('p'), shadow.get('p'), 'updates "p" version');
    t.equal(mod.saveModel.calledWith({model}), true, 'saves the changes');

    const model2 = new Edit(data);
    mod.clearDiffs({shadow, model: model2});
    t.equal(model2.get('diffs').length, 2, 'clears all confirmed diffs');
    t.equal(model2.get('p'), shadow.get('p'), 'updates "P" version');

    sand.restore();
    t.end();
});

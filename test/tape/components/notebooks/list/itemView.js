/**
 * Test components/notebooks/list/views/ItemView
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/notebooks/list/views/ItemView';
import ModelFocus from '../../../../../app/scripts/behaviors/ModelFocus';
import Model from '../../../../../app/scripts/models/Tag';
/* eslint-enable */

test('notebooks/list/views/ItemView: className', t => {
    t.equal(View.prototype.className, 'list--group list-group');
    t.end();
});

test('notebooks/list/views/ItemView: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click .remove-link'], 'removeModel');
    t.end();
});

test('notebooks/list/views/ItemView: behaviors()', t => {
    const behaviors = View.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(ModelFocus) !== -1, true, 'uses ModelFocus behavior');
    t.end();
});

test('notebooks/list/views/ItemView: serializeData()', t => {
    const view = new View({
        profileId : 'test',
        model     : new Model({id: '1', name: 'test'}),
    });
    const data = view.serializeData();

    t.equal(typeof data, 'object', 'returns an object');
    t.deepEqual(data, _.extend({}, view.options, view.model.attributes),
        'returns options and model attributes');

    t.end();
});

test('notebooks/list/views/ItemView: removeModel', t => {
    const model = new Model({id: '1'});
    const view  = new View({model});
    const req   = sinon.stub(Radio, 'request');

    t.equal(view.removeModel(), false, 'returns false');
    t.equal(req.calledWith('components/notebooks', 'remove', {model}), true,
        'removes the model');

    req.restore();
    t.end();
});

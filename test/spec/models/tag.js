/* global expect, define, describe, beforeEach, it */
define([
    'helpers/underscore-util',
    'models/tag'
], function(_, Model) {
    'use strict';

    describe('models/tag', function() {
        var tag;

        beforeEach(function() {
            tag = new Model();
        });

        describe('default values', function() {

            it('id is undefined', function() {
                expect(tag.get('id')).to.be.equal(undefined);
            });

            it('name is an empty string', function() {
                expect(tag.get('name')).to.be.equal('');
            });

            it('is equal to 0', function() {
                _.each(['trash', 'created', 'updated'], function(name) {
                    expect(tag.get(name)).to.be.equal(0);
                });
            });

        });

        describe('.validate()', function() {

            it('"name" shouldn\'t be empty', function() {
                expect(tag.validate({name: ''}).length > 0).to.be.equal(true);
                expect(tag.validate({name: ''})).to.contain('name');
            });

            it('doesn\'t validate if "trash" is equal to 2', function() {
                expect(tag.validate({name: '', trash: 2})).to.be.equal(undefined);
                expect(tag.validate({name: '', trash: 2})).not.to.be.an('object');
            });

        });

        describe('.setEscape()', function() {

            it('sanitizes data to prevent XSS', function() {
                var data = {name: '<b href="javascript:alert(1)" title="javascript:alert(2)">Hello</b>\n'};
                tag.setEscape(_.extend({}, data));

                expect(tag.get('name')).to.be.equal(_.cleanXSS(data.name));
                expect(tag.get('name')).not.to.contain(data.name);
            });

        });

    });

});

/*jshint expr: true*/
/* global expect, define, describe, beforeEach, it */
define([
    'sinon',
    'helpers/underscore-util',
    'models/config'
], function(sinon, _, Model) {
    'use strict';

    describe('models/config', function() {
        var config;

        beforeEach(function() {
            config = new Model();
        });

        it('.defaults', function() {
            expect(config.get('name')).to.be.equal('');
            expect(config.get('value')).to.be.equal('');
        });

        describe('.validate()', function() {

            it('name should not be empty', function() {
                expect(config.validate({name: ''}).length > 0).to.be.equal(true);
            });

            it('value can be empty', function() {
                expect(config.validate({name: 'hello', value: ''})).to.be.equal(undefined);
            });

        });

        it('.changeDB()', function() {
            expect(config.profileId).to.be.equal('notes-db');
            config.changeDB('profile');
            expect(config.profileId).to.be.equal('profile');
        });

        it('.getValueJSON()', function() {
            config.set('value', JSON.stringify({content: 'hello'}));
            expect(config.getValueJSON().content).to.be.equal('hello');
        });

        describe('.createProfile()', function() {

            beforeEach(function() {
                config.set('value', JSON.stringify(['p1', 'p2']));
                sinon.stub(config, 'save');
            });

            it('does not do anything if name was not provided', function() {
                expect(config.createProfile()).to.be.equal(undefined);
            });

            it('adds profile name to the array', function() {
                config.createProfile('p3');
                expect(config.save).to.have.been
                    .calledWith({value: JSON.stringify(['p1', 'p2', 'p3'])});
            });

            it('does not do anything if profile is in the array', function() {
                config.createProfile('p1');
                config.createProfile('p3');
                expect(config.save).to.have.been.calledOnce;
            });

        });

        describe('.removeProfile()', function() {

            beforeEach(function() {
                config.set('value', JSON.stringify(['p1', 'p2']));
                sinon.stub(config, 'save');
            });

            it('does not do anything if name was not provided', function() {
                expect(config.removeProfile()).to.be.equal(undefined);
            });

            it('removes the name from the array', function() {
                config.removeProfile('p1');
                expect(config.save).to.have.been.calledWith({value: JSON.stringify(['p2'])});
            });

        });

        describe('.isPassword()', function() {

            beforeEach(function() {
                config.set({name: 'encryptPass', value: 'hello'});
            });

            it('returns false if `name` is not `encryptPass`', function() {
                config.set('name', 'null');
                expect(config.isPassword({})).to.be.equal(false);
            });

            it('returns true if `data.name` is `encryptPass`', function() {
                config.set('name', 'null');
                expect(config.isPassword({name: 'encryptPass'})).to.be.equal(true);
            });

            it('returns false if `data.value` is an object', function() {
                expect(config.isPassword({value: []})).to.be.equal(false);
            });

            it('returns false if `value` is equal to `data.value`', function() {
                expect(config.isPassword({value: 'hello'})).to.be.equal(false);
            });

            it('returns true', function() {
                expect(config.isPassword({value: 'world'})).to.be.equal(true);
            });

        });

    });

});

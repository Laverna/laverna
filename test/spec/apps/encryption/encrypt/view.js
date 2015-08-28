/* global define, chai, describe, it, before, beforeEach */
define([
    'jquery',
    'underscore',
    'backbone.radio',
    'apps/encryption/encrypt/view'
], function($, _, Radio, View) {
    'use strict';

    var expect = chai.expect;

    describe('Encryption view', function() {
        var view,
            configs;

        before(function() {
            configs = {
                encrypt           : 1,
                encryptPass       : '1',
                encryptSalt       : '',
                encryptIter       : '1000',
                encryptTag        : '64',
                encryptKeySize    : '128'
            };
            configs.encryptBackup = _.clone(configs);

            view = new View({
                el      : $('<div>'),
                configs : _.clone(configs)
            });

            view.render();
        });

        it('is ok', function() {
            expect(typeof view).to.be.equal('object');
            expect(view instanceof View).to.be.equal(true);
            expect(typeof view.options.configs).to.be.equal('object');
        });

        describe('Old password', function() {

            beforeEach(function() {
                view.options.configs = _.clone(configs);
            });

            it('shows it', function() {
                expect(view.$el).to.have('input[name=oldpass]');
            });

            it('shows it if encryption was disabled', function(done) {
                view.options.configs.encrypt = 0;
                view.options.configs.encryptBackup.encrypt = 1;

                view.once('render', function() {
                    expect(view.$el).to.have('input[name=oldpass]');
                    done();
                });
                view.render();
            });

            it('hides it if password wasn\'t changed', function(done) {
                delete view.options.configs.encryptBackup.encryptPass;

                view.once('render', function() {
                    expect(view.$el).not.to.have('input[name=oldpass]');
                    done();
                });
                view.render();
            });

            it('hides it if backup password is empty', function(done) {
                view.options.configs.encryptBackup.encryptPass = '';

                view.once('render', function() {
                    expect(view.$el).not.to.have('input[name=oldpass]');
                    done();
                });
                view.render();
            });

            it('hides it if encryption wasn\'t used before', function(done) {
                view.options.configs.encryptBackup.encrypt = 0;

                view.once('render', function() {
                    expect(view.$el).not.to.have('input[name=oldpass]');
                    done();
                });
                view.render();
            });

            it('shows it if encryption password was changed', function(done) {
                view.options.configs.encryptBackup.encrypt = 1;
                view.options.configs.encryptBackup.encryptPass = '2';

                view.once('render', function() {
                    expect(view.$el).to.have('input[name=oldpass]');
                    done();
                });
                view.render();
            });

        });
    });
});

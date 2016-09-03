/* global expect, define, describe, beforeEach, it */
define([
    'helpers/underscore-util',
    'models/file'
], function(_, Model) {
    'use strict';

    describe('models/file', function() {
        var file;

        beforeEach(function() {
            file = new Model();
        });

        describe('.defaults', function() {

            it('id is undefined', function() {
                expect(file.get('id')).to.be.an('undefined');
            });

            it('empty string', function() {
                _.each(['name', 'src', 'fileType'], function(n) {
                    expect(file.get(n)).to.be.equal('');
                });
            });

            it('equals to 0', function() {
                _.each(['trash', 'created', 'updated'], function(n) {
                    expect(file.get(n)).to.be.equal(0);
                });
            });

        });

        describe('.validate()', function() {

            it('src should not be empty', function() {
                expect(file.validate({src: '', fileType: 'img'}).length).to.be.equal(1);
            });

            it('fileType should not be empty', function() {
                expect(file.validate({src: 'http://', fileType: ''}).length).to.be.equal(1);
            });

        });

        describe('.setEscape()', function() {

            it('filters `name`', function() {
                var str = '<b href="javascript:alert(1)" title="javascript:alert(2)">Hello</b>\n';
                file.setEscape({'name': str});

                expect(file.get('name')).not.to.be.equal(str);
                expect(file.get('name')).to.be.equal(_.cleanXSS(str));
            });

        });

    });

});

/*jshint expr: true*/
/* global define, describe, it, expect */
define([
    'sinon',
    'helpers/underscore-util'
], function(sinon, _) {
    'use strict';

    describe('helpers/underscore-util', function() {

        describe('Extends Underscore', function() {

            it('adds functions', function() {
                expect(_).to.have.property('cleanXSS');
                expect(_).to.have.property('runTimes');
                expect(_).to.have.property('stripTags');
            });

        });

        describe('.cleanXSS()', function() {

            it('calls _.runTimes if `unescape` argument is true', function() {
                var spy = sinon.spy(_, 'runTimes');
                _.cleanXSS('string', true);

                expect(spy).to.have.been.calledWith(_.unescape, 2);
            });

            it('removes all HTML if `stripTags` argument is true', function() {
                expect(_.cleanXSS('<script></script><b>Hello</b>', false, true))
                    .to.be.equal('Hello');
            });

        });

        describe('.runTimes()', function() {

            it('executes the provided function N times', function() {
                var spy = sinon.spy();
                _.runTimes(spy, 5);

                expect(spy).to.have.been.callCount(5);
            });

            it('passes arguments with indexes greater 2', function() {
                var spy = sinon.spy();
                _.runTimes(spy, 2, 'hello', 'world');

                expect(spy).to.have.been.calledWith('hello', 'world');
            });

            it('returns the last result', function() {
                var i = 0;
                expect(_.runTimes(function() { i++; return i; }, 4)).to.be.equal(4);
            });

        });

    });

});

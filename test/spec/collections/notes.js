/*jshint expr: true*/
/* global expect, define, describe, beforeEach, before, it */
define([
    'sinon',
    'underscore',
    'collections/notes'
], function(sinon, _, Collection) {
    'use strict';

    /*jshint multistr: true */
    var lorem = 'Lorem Ipsum is simply dummy text of the printing and \
        typesetting industry. Lorem Ipsum has been the industry\'s standard \
        dummy text ever since the 1500s, when an unknown printer took a galley\
        of type and scrambled it to make a type specimen book.';

    describe('collections/notes', function() {
        var collection;

        beforeEach(function() {
            collection = new Collection();
        });

        describe('.conditions', function() {

            it('.notebook returns {notebookId: `query`, trash: 0}', function() {
                var res = collection.conditions.notebook({query: 'tasks'});

                expect(res.notebookId).to.be.equal('tasks');
                expect(res.trash).to.be.equal(0);
            });

        });

        describe('.filterList()', function() {

            it('does nothing if filter argument was not provided', function() {
                expect(collection.filterList()).to.be.an('undefined');
            });

            it('does nothing if a filter method does not exist', function() {
                expect(collection.filterList('all404')).to.be.an('undefined');
            });

            it('executes filter method', function() {
                var spy = sinon.spy(collection, 'taskFilter');
                collection.filterList('task', {query: 'testing'});
                expect(spy).to.have.been.calledWith('testing');
            });

            it('resets the collection', function(done) {
                collection.add([{isOk: false}, {isOk: true}]);
                sinon.stub(collection, 'taskFilter').returns([collection.at(0)]);

                collection.once('reset', function() {
                    expect(collection.length).to.be.equal(1);
                    done();
                });
                collection.filterList('task', {});
            });

        });

        it('.taskFilter()', function() {
            collection.add([
                {taskCompleted: 1, taskAll: 10},
                {taskCompleted: 9, taskAll: 10},
                {taskCompleted: 20, taskAll: 20},
            ]);

            expect(collection.taskFilter().length).to.be.equal(2);
        });

        describe('.tagFilter()', function() {

            it('requires notes to have tags', function() {
                collection.add([{id: '1'}, {id: '2'}]);
                expect(collection.tagFilter('tag').length).to.be.equal(0);
            });

            it('returns notes which are tagged with the tag', function() {
                collection.add([
                    {trash: 0, tags: ['test', 'test2']},
                    {trash: 1, tags: ['test']},
                    {trash: 0, tags: ['test2', 'test3']},
                    {trash: 0, tags: ['test2', 'test3', 'test']},
                ]);

                expect(collection.tagFilter('test').length).to.be.equal(2);
            });

        });

        describe('.searchFilter()', function() {
            var models;

            before(function() {
                models = [];
                for (var i = 0; i < 20; i++) {
                    models.push({
                        'id': i,
                        'title': 'Test note number title ' + i,
                        'content': lorem + ' ' + i + ' content test content' + i
                    });
                }
            });

            beforeEach(function() {
                collection.add(models);
            });

            it('does nothing if letters argument is empty', function() {
                expect(collection.searchFilter().length).to.be.equal(models.length);
                expect(collection.searchFilter('').length).to.be.equal(models.length);
            });

            it('can find a string in the title', function() {
                expect(collection.searchFilter('title 10').length).to.be.equal(1);
            });

            it('can find a string in the content', function() {
                expect(collection.searchFilter('content19').length).to.be.equal(1);
            });

            it('can perform case-insensetive search', function() {
                expect(collection.searchFilter('test').length).to.be.equal(models.length);
                expect(collection.searchFilter('NotE').length).to.be.equal(models.length);
                expect(collection.searchFilter('NUMBER tITle 11').length).to.be.equal(1);
            });

        });

        it('.fuzzySearch()', function() {
            collection.add([
                {id: 1, title: 'The Great Gatsby. Test'},
                {id: 2, title: 'The DaVinci Code. Test'},
                {id: 3, title: 'Angels & Demons'},
            ]);
            collection.fullCollection = collection.clone();

            expect(collection.fuzzySearch('gaby').length).to.be.equal(1);
            expect(collection.fuzzySearch('gaby')[0].id).to.be.equal(1);
            expect(collection.fuzzySearch('tst').length).to.be.equal(2);
        });

    });

});

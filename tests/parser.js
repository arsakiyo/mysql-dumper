var chai = require('chai');
var expect = chai.expect;
var Parser = require('./../parser.js');

describe('parse function', function() {
    it('should exists and return a promise', function(done) {
        Parser.parse('anything').then(function(result) {
            done();
        });
    });

    it('should exists and return a promise with the same string if a simple string is passed', function(done) {
        Parser.parse('okok').then(function(result) {
            expect(result).to.equal('okok');
            done();
        });
    });

    it('should return a promise with the evaluation of the ref', function(done) {
        Parser.setRefs({
            foo: 'bar'
        });

        Parser.parse('$foo').then(function(result) {
            expect(result).to.equal('bar');
            done();
        });
    });

    it('should evaluation the ref of the ref recursively', function(done) {
        Parser.setRefs({
            foo: '$bar $baz ok',
            bar: '$qux',
            baz: 'yeahh',
            qux: 'okoko'
        });

        Parser.parse('$foo').then(function(result) {
            expect(result).to.equal('okoko yeahh ok');
            done();
        });
    });


    it('should return a promise with the evaluation of the table', function(done) {
        Parser.setTables({
            MyTable: {
                where: '$foo'
            }
        });

        Parser.setRefs({
            foo: 'bar'
        });

        Parser.parse('$$MyTable.field').then(function(result) {
            expect(result).to.equal('select field from MyTable where bar');
            done();
        });
    });

    it('should evaluate complex combination', function(done) {
        Parser.setTables({
            MyTable: {
                where: 'id_key1 = "$foo"'
            }
        });

        Parser.setRefs({
            foo: '$bar $baz ok',
            bar: '$qux',
            baz: 'yeahh',
            qux: 'okoko'
        });

        Parser.parse('$$MyTable.field').then(function(result) {
            expect(result).to.equal('select field from MyTable where id_key1 = "okoko yeahh ok"');
            done();
        });
    });

    it('should evaluate complex combination', function(done) {
        Parser.setTables({
            MyTable1: {
                where: 'id_key1 = "$foo"'
            },
            MyTable2: {
                where: 'id_key in ($$MyTable1.field2) or id_key2 in ($$MyTable1.field4)'
            }
        });

        Parser.setRefs({
            foo: '$bar $baz ok',
            bar: '$qux',
            baz: 'yeahh',
            qux: 'okoko'
        });

        Parser.parse('$$MyTable2.field').then(function(result) {
            expect(result).to.equal('select field from MyTable2 where id_key in (select field2 from MyTable1 where id_key1 = "okoko yeahh ok") or id_key2 in (select field4 from MyTable1 where id_key1 = "okoko yeahh ok")');
            done();
        });
    });
});

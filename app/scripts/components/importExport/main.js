/**
 * @module components/importExport/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Import from './Import';
import Export from './Export';

function initialize() {
    Radio.channel('components/importExport')
    .reply({
        import: (...args) => new Import(...args).init(),
        export: (...args) => new Export(...args).init(),
    });
}

Radio.once('App', 'init', initialize);
export default initialize;

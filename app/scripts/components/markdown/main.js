/**
 * @module components/markdown/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Markdown from './Markdown';

Radio.once('App', 'init', () => new Markdown());

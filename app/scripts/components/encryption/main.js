/**
 * @module components/encryption/main
 */
import Encryption from '../../models/Encryption';
import Radio from 'backbone.radio';
import Auth from './auth/Controller';

export default function initialize() {
    // Instantiate encryption model
    new Encryption();

    // Don't start the app until auth is successful
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:auth',
        callback: () => new Auth().init(),
    });
}

Radio.once('App', 'init', initialize);

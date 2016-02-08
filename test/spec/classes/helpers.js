/* global define */
define(function(require) {
    'use strict';

    var sjcl = require('sjcl'),
        _    = require('underscore');

    return {

        encrypt062: function(str, pass, configs) {
            var p = {
                iter : configs.encryptIter,
                ts   : Number(configs.encryptTag),
                ks   : Number(configs.encryptKeySize),

                // Random initialization vector every time
                iv   : sjcl.random.randomWords(4, 0)
            };

            return sjcl.encrypt(pass.toString(), str, p);
        },

        encrypt070: function(str, salt, pass, configs) {
            var p = {
                mode   : 'ccm',
                iter   : Number(configs.encryptIter),
                ts     : Number(configs.encryptTag),
                ks     : Number(configs.encryptKeySize),
                salt   : salt,
                v      : 1,
                adata  : '',
                cipher : 'aes',

                // Random initialization vector every time
                iv     : sjcl.random.randomWords(4, 0)
            };

            str = sjcl.encrypt(pass.toString(), str, p);

            str = _.pick(JSON.parse(str), 'ct', 'iv');
            return JSON.stringify(str);
        },

    };

});

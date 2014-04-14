/*global define*/
define([
    'mathjax'
], function (MathJax) {
    'use strict';

    MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [['$', '$'], ['\\(','\\)']]
        }
    });

    return {
        init : function (el) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, el]);
        }
    };
});

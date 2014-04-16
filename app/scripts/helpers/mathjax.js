/*global define*/
define([
    'mathjax'
], function (MathJax) {
    'use strict';

    MathJax.Hub.Config({
        jax: ['input/TeX', 'output/HTML-CSS'],
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

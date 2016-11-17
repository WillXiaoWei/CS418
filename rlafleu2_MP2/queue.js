/**
 * @fileoverview All credit for this code goes to: code.stephenmorley.org. 
 * This code implements an efficient queue data structure.
 * This is needed as using an array is inefficient as each pop requires for all element to be shifted.
 */
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
// ======== browser_compatibility ========
// Multi-browser compatabilty functions, classes, and global constants
//
// Implements missing functions for ECMA-262 standard, or detects what is available.
// 
// Copyright (c) 2012 Hobson Lane dba TotalGood, Inc
// Author: Hobson Lane hobson@totalgood.com
// References: 
//  [1] http://www.tutorialspoint.com/javascript/array_map.htm
//  [2] http://simonwillison.net/2004/may/26/addloadevent/ 
//  [3] http://www.alistapart.com/articles/behavioralseparation
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
// these are ALL untested

/* http://www.tutorialspoint.com/javascript/array_map.htm */
if (!Array.prototype.map) {
  Array.prototype.map = function(fun) {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
      }
    return res;
    };
  }


/* http://simonwillison.net/2004/may/26/addloadevent/ */
function addLoadEvent(func) {
    var existing_onload = window.onload;
    /* if we're the first to take over onload, then go for it */
    if (typeof window.onload != 'function') { window.onload = func;}
    /* otherwise, be polite and set up onload to run the other one first */
    else {
        window.onload = function() {
            if (existing_onload) { existing_onload(); }
            func();
            }
        }
    }

/* http://www.alistapart.com/articles/behavioralseparation */
function getElement(tagname,classname, idname) {
    if (typeof(tagname) === "undefined") { tagname = ""; } 
    if (typeof(classname) === "undefined") { classname = ""; } 
    if (typeof(idname) === "undefined") { idname = ""; } 
    
    /* getElementById is required to be W3 DOM compliant */
    if( idname.length>0 && document.getElementById ) { 
        return document.getElementById( id );
        }
    /* getElementByClassName works in >=IE9 and >=Opera9.5 */
    if( classname.length>0 && document.getElementsByClass ) {
        return document.getElementsByClass( tagname );
        }
    /* getElementByTagName works in >=IE6 and >=FF3.5 */
    if( tagname.length>0 && document.getElementsByTagName ) {
        return document.getElementsByTagName( tagname );
        }
    return false;
    }

/* http://www.sitepoint.com/javascript-json-serialization/ */
// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

/* need something like this that works on all browsers, or better yet something like getComputedStyle */
function getStyle(selector) {
    for (var i=0; i<document.styleSheets.length; i++) {
        for (var j=0; j<document.styleSheets[i].cssRules.length; j++) {
            if (document.styleSheets[i].cssRules[j].selectorText === selector) {
                return document.styleSheets[i].cssRules[j].styleText;
                }
            }
        }
    }

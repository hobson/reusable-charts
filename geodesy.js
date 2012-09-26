// ======== geodesy ========
// Earth geographic calculations and constants for mapping
// Copyright (c) 2012 Hobson Lane dba TotalGood, Inc
// Author: Hobson Lane hobson@totalgood.com
// References:
//   [1] Vallado, Fundamentals of Astrodynamics and Applications, Second Edition
//   [2] http://www.movable-type.co.uk/scripts/latlong.html
//   [3] http://en.wikipedia.org/wiki/Earth_radius
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

// Earth geodetic information
var Rearth_equatorial = 6378137.0; // Earth equatorial radius in meters
var Rearth_polar = 6356752.3; // Earth polar radius in meters
var Rearth = Rearth_equatorial; // (Rearth_equatorial+Rearth_polar)*0.5; 

function deg2rad(deg) { 
    return deg*Math.PI/180.0;
    }
    
function rad2deg(rad) { 
    return rad*180.0/Math.PI; 
    }

function earth_radius(radlat) { // radlat = geodetic latitude in radians
    var a = Rearth_equatorial;
    var b = Rearth_polar;
    // :<math>R=R(\phi)=\sqrt{\frac{(a^2\cos(\phi))^2+(b^2\sin(\phi))^2}{(a\cos(\phi))^2+(b\sin(\phi))^2}}\,\!</math>
    return Math.sqrt(
        ( Math.pow(a*a*Math.cos(radlat),2) + Math.pow(b*b*Math.sin(radlat),2) ) /
        ( Math.pow(  a*Math.cos(radlat),2) + Math.pow(  b*Math.sin(radlat),2) ) 
        );
    }

// 2nd order approximation (accurate to <0.01%)
function radlon2m(radLat,radLon) {
    if (typeof(radLat)==='undefined') radLat = 0.0; // assume you're on the equator
    return earth_radius(radLat)*Math.cos(radLat); } // distance from the axis of the earth or distance scale-factor (radians to meters)

// 1st order approximation (accurate to <0.1%?)
function radlat2m(radLat,radLon) { return Rearth; } // distance from the axis of the earth or distance scalefactor (radians to meters)

function great_circle_distance(lat1,lon1,lat2,lon2) {
    lat1 = deg2rad(lat1);
    lon1 = deg2rad(lon1);
    lat2 = deg2rad(lat2);
    lon2 = deg2rad(lon2);
    var dLat = lat2-lat1;
    var dLon = lon2-lon1;
    // Haversine formula (most accurate, if math library supports atan2, etc)
    var tmp = Math.sin(dLat*0.5) * Math.sin(dLat*0.5) +
              Math.sin(dLon*0.5) * Math.sin(dLon*0.5) * Math.cos(lat1) * Math.cos(lat2); 
    var dist = 2.0 * Rearth * Math.atan2(Math.sqrt(tmp), Math.sqrt(1-tmp)); 
}

function great_circle_bearing(lat1,lon1,lat2,lon2) {
    var dLon = lon2-lon1;
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return Math.atan2(y, x); // like Math library, all geodesy functions return SI units (radians and meters)
}

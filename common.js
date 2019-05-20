function isNotEmpty(o) {
	return typeof (o) != "undefined" && o != null;
}
function isEmpty(o) {
	return !isNotEmpty(o);
}
function isString(o) {
	if (o == null)
		return false;
	return typeof (o) == "string";
}
function isFunction(o) {
	if (o == null)
		return false;
	return typeof (o) == "function";
}

function isArray(o) {
	if (o == null)
		return false;
	return isObject(o) && o.constructor == Array;
}

function isObject(o) {
	if (o == null)
		return false;
	return typeof (o) == "object";
}
function inArray(arr, v) {
	for (var i = 0; i < arr.length; i++) {
		if (v == arr[i])
			return true;
	}
	return false;
}

function tryCall(func) {
	try {
		return eval(func);
	} catch (e) {
		return null;
	}
}

function getHashKey(key, def) {
	var r = new RegExp(/(\w+)=([^&]*)&?/g);
	var p;
	while ((p = r.exec(window.location.hash)) != null) {
		if (p[1] == key)
			return decodeURIComponent(p[2]) || def;
	}
	return def || "";
}

function setHashKey(key, val) {
	var r = new RegExp(/(\w+)=([^&]*)&?/g);
	var p;
	var m = {};
	while ((p = r.exec(window.location.hash)) != null) {
		m[p[1]] = decodeURIComponent(p[2]);
	}
	m[key] = val;
	var p = [];
	for ( var k in m) {
		p.push(k + "=" + encodeURIComponent(m[k]));
	}
	window.location.hash = "#" + p.join("&");
}

function toFixedValue(fval) {
	return parseFloat(fval.toFixed(4));
}

function get_dict_value(dict, key, def) {
	if (dict == null)
		return null;

	if (dict.hasOwnProperty(key)) {
		return dict[key];
	}
	if (typeof def == "undefined")
		return null;
	return def;
}

function filesize_fmt(fsize) {
	// debugger;
	if (/\D/.test(fsize)) {
		return 'N/A';
	}

	if (fsize < 1024) {
		return fsize + " Bytes";
	}
	fsize = fsize / 1024.0;
	if (fsize < 1024) {
		return parseFloat(fsize.toFixed(2)) + " KB";
	}
	fsize = fsize / 1024.0;
	if (fsize < 1024) {
		return parseFloat(fsize.toFixed(2)) + " MB";
	}
	// debugger;
	fsize = fsize / 1024.0;
	if (fsize < 1024) {
		return parseFloat(fsize.toFixed(2)) + " GB";
	}
	fsize = fsize / 1024.0;
	return parseFloat(fsize.toFixed(2)) + " TB";
};

function filename_ext(filename) {
	fext = filename.split(".");
	if (fext.length > 1) {
		return fext[fext.length - 1]
	}
	return "";
}

function getViewportInfo() {
	var mmV = function(c) {
		var v = [ window["inner" + c], document.documentElement["client" + c] ];

		// if ($.browser.msie) {
		// if (parseInt($.browser.version)) {
		// v.push(document.documentElement["offset" + c]);
		// }
		// }

		var r = 0;
		for (var i = 0; i < v.length; i++) {
			if (v[i] > r) {
				r = v[i];
			}
		}
		return r;
	}

	var w = mmV("Width");
	var h = mmV("Height");
	return {
		w : w,
		h : h
	};
};

function base64encode(str) {

	var bec = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	var out, i, len;
	var c1, c2, c3;
	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += bec.charAt(c1 >> 2);
			out += bec.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += bec.charAt(c1 >> 2);
			out += bec.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
			out += bec.charAt((c2 & 0xf) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += bec.charAt(c1 >> 2);
		out += bec.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
		out += bec.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
		out += bec.charAt(c3 & 0x3f);
	}
	return out;
}
function base64decode(str) {

	var bdc = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
			52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
			19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29,
			30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
			47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

	var c1, c2, c3, c4;
	var i, len, out;

	len = str.length;

	i = 0;
	out = "";
	while (i < len) {

		do {
			c1 = bdc[str.charCodeAt(i++) & 0xff];
		} while (i < len && c1 == -1);
		if (c1 == -1)
			break;

		do {
			c2 = bdc[str.charCodeAt(i++) & 0xff];
		} while (i < len && c2 == -1);
		if (c2 == -1)
			break;

		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

		do {
			c3 = str.charCodeAt(i++) & 0xff;
			if (c3 == 61)
				return out;
			c3 = bdc[c3];
		} while (i < len && c3 == -1);
		if (c3 == -1)
			break;

		out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

		do {
			c4 = str.charCodeAt(i++) & 0xff;
			if (c4 == 61)
				return out;
			c4 = bdc[c4];
		} while (i < len && c4 == -1);
		if (c4 == -1)
			break;
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
}

function utf16to8(str) {

	var out, i, len, c;
	out = "";
	len = str.length;
	for (i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if ((c >= 0x0001) && (c <= 0x007f)) {
			out += str.charAt(i);
		} else if (c > 0x07ff) {
			out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
			out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
		} else {
			out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
		}
	}
	return out;
}

function utf8to16(str) {

	var out, i, len, c;
	var char2, char3;

	out = "";
	len = str.length;
	i = 0;
	while (i < len) {
		c = str.charCodeAt(i++);
		switch (c >> 4) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
			// 0xxxxxxx
			out += str.charAt(i - 1);
			break;
		case 12:
		case 13:
			// 110x xxxx 10xx xxxx
			char2 = str.charCodeAt(i++);
			out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
			break;
		case 14:
			// 1110 xxxx 10xx xxxx 10xx xxxx
			char2 = str.charCodeAt(i++);
			char3 = str.charCodeAt(i++);
			out += String.fromCharCode(((c & 0x0f) << 12)
					| ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
			break;
		}
	}
	return out;
}

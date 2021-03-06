/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Gir = imports.gi.GIRepository;
const GObject = imports.gi.GObject;

// Returns a list of potential completions for text. Completions either
// follow a dot (e.g. foo.ba -> bar) or they are picked from globalCompletionList (e.g. fo -> foo)
// commandHeader is prefixed on any expression before it is eval'ed.  It will most likely
// consist of global constants that might not carry over from the calling environment.
//
// This function is likely the one you want to call from external modules
function getCompletions(text, commandHeader, globalCompletionList) {
    let methods = [];
    let expr, base;
    let attrHead = '';
    if (globalCompletionList == null) {
        const keywords = ['true', 'false', 'null', 'new', 'imports'];
        const windowProperties = Object.getOwnPropertyNames(window).filter(function(a){ return a.charAt(0) != '_' });
        const headerProperties = getDeclaredConstants(commandHeader);
        globalCompletionList = keywords.concat(windowProperties).concat(headerProperties);
    }

    let offset = getExpressionOffset(text, text.length - 1);
    if (offset >= 0) {
        text = text.slice(offset);

        // Look for expressions like "Main.panel.foo" and match Main.panel and foo
        let matches = text.match(/(.*)\.(.*)/);
        if (matches) {
            [expr, base, attrHead] = matches;

            methods = getPropertyNamesFromExpression(base, commandHeader).filter(function(attr) {
                return attr.slice(0, attrHead.length) == attrHead;
            });
        }

        // Look for the empty expression or partially entered words
        // not proceeded by a dot and match them against global constants
        matches = text.match(/^(\w*)$/);
        if (text == '' || matches) {
            [expr, attrHead] = matches;
            methods = globalCompletionList.filter(function(attr) {
                return attr.slice(0, attrHead.length) == attrHead;
            });
        }
    }

    return [methods, attrHead];
}


//
// A few functions for parsing strings of javascript code.
//

// Identify characters that delimit an expression.  That is,
// if we encounter anything that isn't a letter, '.', ')', or ']',
// we should stop parsing.
function isStopChar(c) {
    return !c.match(/[\w\.\)\]]/);
}

// Given the ending position of a quoted string, find where it starts
function findMatchingQuote(expr, offset) {
    let quoteChar = expr.charAt(offset);
    for (let i = offset - 1; i >= 0; --i) {
        if (expr.charAt(i) == quoteChar && expr.charAt(i-1) != '\\'){
            return i;
        }
    }
    return -1;
}

// Given the ending position of a regex, find where it starts
function findMatchingSlash(expr, offset) {
    for (let i = offset - 1; i >= 0; --i) {
        if (expr.charAt(i) == '/' && expr.charAt(i-1) != '\\'){
            return i;
        }
    }
    return -1;
}

// If expr.charAt(offset) is ')' or ']',
// return the position of the corresponding '(' or '[' bracket.
// This function does not check for syntactic correctness.  e.g.,
// findMatchingBrace("[(])", 3) returns 1.
function findMatchingBrace(expr, offset) {
    let closeBrace = expr.charAt(offset);
    let openBrace = ({')': '(', ']': '['})[closeBrace];

    function findTheBrace(expr, offset) {
        if (offset < 0) {
            return -1;
        }

        if (expr.charAt(offset) == openBrace) {
            return offset;
        }
        if (expr.charAt(offset).match(/['"]/)) {
            return findTheBrace(expr, findMatchingQuote(expr, offset) - 1);
        }
        if (expr.charAt(offset) == '/') {
            return findTheBrace(expr, findMatchingSlash(expr, offset) - 1);
        }
        if (expr.charAt(offset) == closeBrace) {
            return findTheBrace(expr, findTheBrace(expr, offset - 1) - 1);
        }

        return findTheBrace(expr, offset - 1);

    }

    return findTheBrace(expr, offset - 1);
}

// Walk expr backwards from offset looking for the beginning of an
// expression suitable for passing to eval.
// There is no guarantee of correct javascript syntax between the return
// value and offset.  This function is meant to take a string like
// "foo(Obj.We.Are.Completing" and allow you to extract "Obj.We.Are.Completing"
function getExpressionOffset(expr, offset) {
    while (offset >= 0) {
        let currChar = expr.charAt(offset);

        if (isStopChar(currChar)){
            return offset + 1;
        }

        if (currChar.match(/[\)\]]/)) {
            offset = findMatchingBrace(expr, offset);
        }

        --offset;
    }

    return offset + 1;
}

function enumerateInfo (info, for_object, allProps) {
    if (info.get_type() == 7) {
        let n = 0;
        if (for_object) {
            n = Gir.object_info_get_n_properties(info);
            for (let i = 0; i < n; i++) {
                let prop = Gir.object_info_get_property(info, i);
                allProps.push (prop.get_name().replace(/-/g, '_'));
            }
        }

        n = Gir.object_info_get_n_methods(info);
        for (let i = 0; i < n; i++) {
            let method = Gir.object_info_get_method(info, i);
            let flags = Gir.function_info_get_flags (method);
            if ((for_object && (flags & 1) != 0) ||
                (!for_object && (flags & 1) != 1))
                allProps.push (method.get_name());
        }
    }

    if (for_object) {
        let parent = Gir.object_info_get_parent(info);
        if (parent) {
            enumerateInfo(parent, for_object, allProps);
        }
    }
}

function enumerateGObject (obj, allProps) {
    if (!obj) {
        return;
    }
    let gtype = null;
    let for_object = false;
    if (obj.hasOwnProperty ("$gtype"))
        gtype = obj.$gtype;
    else if (obj.constructor.hasOwnProperty ("$gtype")) {
        gtype = obj.constructor.$gtype;
        for_object = true;
    }

    if (for_object) {
        let params = GObject.Object.list_properties.call(obj);
        for (let i = 0; i < params.length; i++) {
            // Canonicalize '-' to '_' in property names
            allProps.push(params[i].name.replace(/-/g, "_"));
        }
    }

    let repo = Gir.Repository.get_default();

    while (gtype != null) {
        let info = repo.find_by_gtype(gtype);
        if (info) {
            enumerateInfo (info, for_object, allProps);
            return;
        }
        if (!for_object || gtype == GObject.Object.$gtype) {
            gtype = null;
        } else {
            gtype = GObject.type_parent(gtype);
        }
    }

    return;
}

function enumerateGIRNamespace (obj, allProps) {
    if (!obj || typeof obj !== 'object' ||
        !obj instanceof GIRepositoryNamespace) {
        return;
    }
    let names = Object.getOwnPropertyNames(obj);
    let repo = Gir.Repository.get_default();
    for (let i = 0; i < names.length; i++) {
        // There seem to be no way to go from GIRepositoryNamespace itself to the
        // name of the namespace, so we use the namespace of some child that
        // has information.
        // unfortunately such a type may not currently exist, but what can you do...
        let some_type = obj[names[i]];
        let some_info = null;
        if (some_type && some_type.hasOwnProperty ("$gtype"))
            some_info = repo.find_by_gtype(some_type);
        if (some_info) {
            let ns = some_info.get_namespace();
            let repo = Gir.Repository.get_default();
            let n_infos =  repo.get_n_infos(ns);
            for (let i = 0; i < n_infos; i++) {
                let info = repo.get_info (ns, i);
                allProps.push(info.get_name());
            }
            break;
        }
    }
}

function enumerateGIR (obj, allProps) {
    enumerateGObject (obj, allProps);
    enumerateGIRNamespace (obj, allProps);
}

// Things with non-word characters or that start with a number
// are not accessible via .foo notation and so aren't returned
function isValidPropertyName(w) {
    return !(w.match(/\W/) || w.match(/^\d/));
}

// To get all properties (enumerable and not), we need to walk
// the prototype chain ourselves
function getJsProps(obj, allProps) {
    if (obj === null || obj === undefined) {
        return;
    }
    allProps.push.apply(allProps, Object.getOwnPropertyNames(obj));
    getJsProps(Object.getPrototypeOf(obj), allProps);
}

// Given a string _expr_, returns all methods
// that can be accessed via '.' notation.
// e.g., expr="({ foo: null, bar: null, 4: null })" will
// return ["foo", "bar", ...] but the list will not include "4",
// since methods accessed with '.' notation must star with a letter or _.
function getPropertyNamesFromExpression(expr, commandHeader) {
    if (commandHeader == null) {
        commandHeader = '';
    }

    let obj = {};
    if (!isUnsafeExpression(expr)) {
        try {
                obj = eval(commandHeader + expr);
        } catch (e) {
            return [];
        }
    } else {
        return [];
    }

    let propsUnique = {};

    if (typeof obj === 'object' || typeof obj === 'function') {
        let allProps = [];

        getJsProps(obj, allProps);
        enumerateGIR(obj, allProps);

        // Get only things we are allowed to complete following a '.'
        allProps = allProps.filter( isValidPropertyName );

        // Make sure propsUnique contains one key for every
        // property so we end up with a unique list of properties
        allProps.map(function(p){ propsUnique[p] = null; });
    }

    return Object.keys(propsUnique).sort();
}

// Given a list of words, returns the longest prefix they all have in common
function getCommonPrefix(words) {
    let word = words[0];
    for (let i = 0; i < word.length; i++) {
        for (let w = 1; w < words.length; w++) {
            if (words[w].charAt(i) != word.charAt(i))
                return word.slice(0, i);
        }
    }
    return word;
}

// Returns true if there is reason to think that eval(str)
// will modify the global scope
function isUnsafeExpression(str) {
    // Remove any blocks that are quoted or are in a regex
    function removeLiterals(str) {
        if (str.length == 0) {
            return '';
        }

        let currChar = str.charAt(str.length - 1);
        if (currChar == '"' || currChar == '\'') {
            return removeLiterals(str.slice(0, findMatchingQuote(str, str.length - 1)));
        } else if (currChar == '/') {
            return removeLiterals(str.slice(0, findMatchingSlash(str, str.length - 1)));
        }

        return removeLiterals(str.slice(0, str.length - 1)) + currChar;
    }

    // Check for any sort of assignment
    // The strategy used is dumb: remove any quotes
    // or regexs and comparison operators and see if there is an '=' character.
    // If there is, it might be an unsafe assignment.

    let prunedStr = removeLiterals(str);
    prunedStr = prunedStr.replace(/[=!]==/g, '');    //replace === and !== with nothing
    prunedStr = prunedStr.replace(/[=<>!]=/g, '');    //replace ==, <=, >=, != with nothing

    if (prunedStr.match(/=/)) {
        return true;
    } else if (prunedStr.match(/;/)) {
        // If we contain a semicolon not inside of a quote/regex, assume we're unsafe as well
        return true;
    }

    return false;
}

// Returns a list of global keywords derived from str
function getDeclaredConstants(str) {
    let ret = [];
    str.split(';').forEach(function(s) {
        let base, keyword;
        let match = s.match(/const\s+(\w+)\s*=/);
        if (match) {
            [base, keyword] = match;
            ret.push(keyword);
        }
    });

    return ret;
}

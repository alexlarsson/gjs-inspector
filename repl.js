/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

var evalResults = [];
var offset = 0;
var lastComplete = null;
var printedFull = false;

function getResult (n)
{
    return evalResults[n];
}

var commandHeader =
  "const GLib = imports.gi.GLib;" +
  "const GObject = imports.gi.GObject;" +
  "const Gio = imports.gi.Gio;" +
  "const Pango = imports.gi.Pango;" +
  "const Cairo = imports.cairo;" +
  "const System = imports.system;" +
  "const Gtk = imports.gi.Gtk;" +
  "const r = imports.inspector.repl.getResult;";

const JsParse = imports.inspector.jsParse;

function complete (text)
{
    let [completions, attrHead] = JsParse.getCompletions(text, commandHeader, null);
    completions.sort();
    if (completions.length == 0) {
        __inspector.completion_label.hide ();
        __inspector.completion_label.error_bell ();
    } else if (completions.length == 1) {
        __inspector.entry.emit("insert_at_cursor", completions[0].slice(attrHead.length));
        __inspector.completion_label.hide ();
    } else {
        let commonPrefix = JsParse.getCommonPrefix(completions);
        __inspector.entry.emit("insert_at_cursor", commonPrefix.slice(attrHead.length));
        if (text == lastComplete) {
            __inspector.completion_label.hide ();
            if (!printedFull)
                print ("Completions: \n" + completions.join(", "));
            printedFull = true;
        } else {
            __inspector.completion_label.set_text(completions.join(", "));
            __inspector.completion_label.show ();
        }
    }
    if (text != lastComplete) {
        lastComplete = text;
        printedFull = false;
    }
}

function evalLine (text)
{
    __inspector.completion_label.hide ();
    print ("» " + text);
    try {
        let __r = eval (commandHeader + text);
        print ("r(" + offset + ") = " + String(__r));
        evalResults[offset++] = __r;
    }
    catch (e) {
        print ("r(" + offset + ") = <exception " + String(e) + ">");
        evalResults[offset++] = e;
    }
}

function objectChanged (text)
{
    __inspector.completion_label.hide ();
    print ("» new object selected");
    print ("r(" + offset + ") = " + String(__inspector.object));
    evalResults[offset++] = __inspector.object;
}

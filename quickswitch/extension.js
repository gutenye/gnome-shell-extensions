const Main = imports.ui.main
const Meta = imports.gi.Meta
const Shell = imports.gi.Shell
const Util = imports.misc.util
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const Me = imports.misc.extensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience
const JSON5 = Me.imports.json5.JSON5

let file = Gio.file_new_for_path(GLib.get_home_dir() + '/.quickswitch.json5')
let rc
if (file.query_exists(null)) {
  rc = JSON5.parse(file.load_contents(null)[1].toString())
} else {
  rc = { hideClass: null, rules: [] }
}

// monkey patch: don't show terminal windows
const Workspace = imports.ui.workspace
let _isOverviewWindow = Workspace.Workspace.prototype._isOverviewWindow
Workspace.Workspace.prototype._isOverviewWindow = function (win) {
  if (win.get_meta_window().get_wm_class() == rc.hideClass)
    return false
  return _isOverviewWindow(win)
}

let settings

function init() {
  settings = Convenience.getSettings()
}

function enable() {
  let helper = function(rule) {
    return function() {
      runOrRaise(rule)
    }
  }

  for each (let rule in rc.rules) {
    //Main.wm.addKeybinding(rule["key"], settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, helper(rule))
    Main.wm.addKeybinding(rule["key"], settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL | Shell.ActionMode.MESSAGE_TRAY, helper(rule))
  }
}

function disable() {
  for each (let rule in rc.rules) {
    Main.wm.removeKeybinding(rule["key"])
  }
}

function runOrRaise(rule) {
  let windows = global.get_window_actors().map(function(a){ return a.get_meta_window() })
  windows.sort(function(a, b){ return (a.get_stable_sequence() > b.get_stable_sequence()) ? 1 : -1 })

  var v
  for each (let win in windows) {
    if (rule["class"]) {
      v = win.get_wm_class()
      if (! (v && v.match("^" + rule["class"] + "$")))
        continue
    }

    if (rule["instance"]) {
      v = win.get_wm_class_instance()
      if (! (v && v.match("^" + rule["instance"] + "$")))
        continue
    }

    if (rule["title"]) {
      v = win.get_title()
      if (! (v && v.match("^" + rule["title"] + "$")))
        continue
    }

    if (rule["role"]) {
      v = win.get_role()
      if (! (v && v.match("^" + rule["role"] + "$")))
        continue
    }

    Main.activateWindow(win)
    return
  }

  // not found
  if (rule["cmd"])
    Util.spawnApp(rule["cmd"].split(" "))
}

const St = imports.gi.St
const Main = imports.ui.main
const PopupMenu = imports.ui.popupMenu
const Util = imports.misc.util

let aggregateMenu,item
let cmds = {
  "Fix Speaker": { icon_name: "gnome-tweak-tool", cmd: "/home/guten/bin/fixspeaker" }
}

function init() {
}

function enable() {
  aggregateMenu = Main.panel.statusArea.aggregateMenu
  item = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false })

  let helper = function(cmd) {
    return function() {
      aggregateMenu.menu.itemActivated();
      Main.overview.hide()
      Util.spawnApp(cmd["cmd"].split(" "))
    }
  }
  for (let name in cmds) {
    let cmd = cmds[name]

    let icon = new St.Button({ reactive: true, can_focus: true, track_hover: true })
    icon.child = new St.Icon({ icon_name: cmd["icon_name"], icon_size: 24 })
    icon.connect("clicked", helper(cmd))
    item.actor.add(icon, { expand: true, x_fill: false })
  }

  aggregateMenu.menu.addMenuItem(item)
}

function disable() {
  item.destroy()
}

import .screen
import .modes

current_mode := null

init_modes:
  set_mode DEMO_MODES[random DEMO_MODES.size]

set_mode mode/string:
  mode-changed = true
  wipe_screen
  if mode == "bit":
    current-mode = Bit
  else if mode == "ants":
    current-mode = Ants (ScreenLayout "portrait")
  else if mode == "blink":
    current-mode = Blink (ScreenLayout "portrait")
  else if mode == "cells":
    current-mode = Cells (ScreenLayout "portrait")
  else if mode == "holey":
    current-mode = Hole (ScreenLayout "portrait")
  else if mode == "chase":
    current-mode = Chase (ScreenLayout "landscape")
  else if mode == "debug":
    current-mode = Debug (ScreenLayout "portrait")
  else if mode == "ogpulse":
    current-mode = OGPulse (ScreenLayout "portrait")
  else if mode == "ogstripe":
    current-mode = OGStripe (ScreenLayout "landscape")
  else if mode == "picture":
    current-mode = Picture (ScreenLayout "portrait")
  else if mode == "monalisa":
    current-mode = MonaLisa (ScreenLayout "portrait")
  else if mode == "pulse":
    current-mode = Pulse (ScreenLayout "landscape")
  // else if mode == "sockey":
  //   current-mode = Sockey (ScreenLayout "portrait_flipped")
  else if mode == "wave":
    current-mode = Wave (ScreenLayout "portrait")
  else if mode == "dvd":
    current-mode = DVD (ScreenLayout "portrait")
  else:
    current-mode = Blank

class Blank:
  run:

VALID_MODES ::= [
  "off",
  "bit",
  "ants",
  "blink",
  "cells",
  "chase",
  "debug",
  "holey",
  "ogpulse",
  "ogstripe",
  "picture",
  "monalisa",
  "pulse",
  "sockey",
  "wave",
  "dvd",
]

DEMO_MODES ::= [
  VALID-MODES[1],
  VALID-MODES[2],
  VALID-MODES[4],
  VALID-MODES[5],
  VALID-MODES[7],
  VALID-MODES[8],
  VALID-MODES[11],
  VALID-MODES[12],
  VALID-MODES[15],
]

mode_changed := false
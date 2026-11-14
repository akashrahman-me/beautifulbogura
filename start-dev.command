#!/usr/bin/env bash
# ---------------------------------------------------------------
#  Beautiful Bogura (বিউটিফুল বগুড়া) - start dev services on macOS
#  Shows a checklist (db / cloud / client / console), then opens one Terminal.app
#  window with a tab per selected service.
#  Double-click in Finder, or run: ./start-dev.command
#  Skip the checklist: ./start-dev.command cloud client   |   ./start-dev.command all
#
#  Ports (match the URLs in the services' env files):
#    db     -> 27017  (cloud/.env MONGODB_URI) - local MongoDB replica set (rs0),
#                     data kept in cloud/.data/db
#    cloud  -> 4000   (cloud/.env PORT, NEXT_PUBLIC_API_URL in client/console) - the API
#                     health at /health, Swagger UI at /api/docs
#    client -> 3000   (cloud/.env CLIENT_URL) - the public site
#    console-> 3001   (cloud/.env CONSOLE_URL) - the staff console
#
#  First-time setup on a new Mac:
#    Node   : nvm install 22 (Node >= 22), then `npm ci` in cloud/, client/ and console/
#    Cloud  : cp cloud/.env.example cloud/.env and fill in the secrets
#             sample data (with db running): (cd cloud && npm run seed -- --reset)
#    Client : cp client/.env.example client/.env.local
#    Console: cp console/.env.example console/.env.local
# ---------------------------------------------------------------
set -uo pipefail

# Repo root = folder containing this script (works from any cwd)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load nvm so `node`/`npm` resolve even when launched from Finder
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1

# ---- services -------------------------------------------------
# name | port | folder | env file it needs | command run inside the service's tab
SERVICES=(db cloud client console)
PORTS=(27017 4000 3000 3001)
DIRS=(cloud cloud client console)
ENVS=("" .env .env.local .env.local)
CMDS=(
  "cd '$ROOT/cloud'  && npm run db"
  # The API connects to MongoDB on startup, so wait for it when starting together.
  "cd '$ROOT/cloud'  && echo 'Waiting for MongoDB on :27017 ...' && for i in \$(seq 60); do nc -z 127.0.0.1 27017 >/dev/null 2>&1 && break; sleep 1; done; npm run dev"
  "cd '$ROOT/client' && npm run dev -- -p 3000"
  "cd '$ROOT/console' && npm run dev"
)
N=${#SERVICES[@]}
SEL_FILE="$HOME/.beautifulbogura-start-dev"   # remembers the last selection

port_busy() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

# ---- select services ------------------------------------------
#   ./start-dev.command                 -> interactive checklist
#   ./start-dev.command cloud client    -> start just these (no menu)
#   ./start-dev.command all             -> start everything (no menu)
SEL=()
for ((i = 0; i < N; i++)); do SEL[i]=0; done

if [ $# -gt 0 ]; then
  for arg in "$@"; do
    found=0
    for ((i = 0; i < N; i++)); do
      if [ "$arg" = "all" ] || [ "$arg" = "${SERVICES[i]}" ]; then SEL[i]=1; found=1; fi
    done
    [ $found -eq 1 ] || { echo "[ERROR] unknown service '$arg'. Choose from: all ${SERVICES[*]}"; exit 1; }
  done
elif [ -t 0 ] && [ -t 1 ]; then
  # Default = last selection, else everything
  saved=" $(cat "$SEL_FILE" 2>/dev/null) "
  for ((i = 0; i < N; i++)); do
    if [ "$saved" = "  " ] || [[ "$saved" == *" ${SERVICES[i]} "* ]]; then SEL[i]=1; fi
  done

  cur=0
  msg=""
  restore_cursor() { tput cnorm 2>/dev/null; }
  trap restore_cursor EXIT
  tput civis 2>/dev/null
  draw() {
    printf '\033[1mBeautiful Bogura - select dev servers to start\033[0m\n'
    printf '\033[2m↑/↓ move · space toggle · a all/none · enter start · q quit\033[0m\n\n'
    for ((i = 0; i < N; i++)); do
      local ptr="  " box="[ ]" note=""
      [ $i -eq $cur ] && ptr="\033[36m›\033[0m "
      [ "${SEL[i]}" = 1 ] && box="\033[32m[✓]\033[0m"
      port_busy "${PORTS[i]}" && note="  \033[33m(port in use)\033[0m"
      printf "%b%b %-18s :%s%b\033[K\n" "$ptr" "$box" "${SERVICES[i]}" "${PORTS[i]}" "$note"
    done
    printf '\n%b\033[K\n' "$msg"
  }
  LINES_DRAWN=$((N + 5))
  draw
  while true; do
    IFS= read -rsn1 key
    if [ "$key" = $'\x1b' ]; then
      read -rsn2 -t 1 rest
      key="ESC$rest"
    fi
    msg=""
    case "$key" in
      "ESC[A"|k) cur=$(( (cur - 1 + N) % N )) ;;
      "ESC[B"|j) cur=$(( (cur + 1) % N )) ;;
      " ") SEL[cur]=$(( 1 - SEL[cur] )) ;;
      [1-9]) idx=$((key - 1)); [ $idx -lt $N ] && SEL[idx]=$(( 1 - SEL[idx] )) ;;
      a|A)
        any=0; for ((i = 0; i < N; i++)); do [ "${SEL[i]}" = 1 ] && any=1; done
        for ((i = 0; i < N; i++)); do SEL[i]=$(( 1 - any )); done ;;
      q|Q) restore_cursor; echo "Cancelled."; exit 0 ;;
      "")  # Enter
        count=0; for ((i = 0; i < N; i++)); do [ "${SEL[i]}" = 1 ] && count=$((count + 1)); done
        [ $count -gt 0 ] && break
        msg="\033[31mSelect at least one service (space).\033[0m" ;;
    esac
    printf '\033[%dA' "$LINES_DRAWN"
    draw
  done
  restore_cursor
else
  # Non-interactive (no terminal): start everything
  for ((i = 0; i < N; i++)); do SEL[i]=1; done
fi

PICKED=()
for ((i = 0; i < N; i++)); do [ "${SEL[i]}" = 1 ] && PICKED+=("$i"); done
names=""; for i in "${PICKED[@]}"; do names="$names ${SERVICES[i]}"; done
echo "${names# }" > "$SEL_FILE" 2>/dev/null || true

# ---- preflight (selected services only) -----------------------
fail=0
for i in "${PICKED[@]}"; do
  s="${SERVICES[i]}"
  d="${DIRS[i]}"
  e="${ENVS[i]}"
  [ -d "$ROOT/$d/node_modules" ] || { echo "[ERROR] $d/node_modules missing. Run: (cd $d && npm ci)"; fail=1; }
  if [ -n "$e" ] && [ ! -f "$ROOT/$d/$e" ]; then
    echo "[ERROR] $d/$e missing. Run: cp $d/.env.example $d/$e (then fill it in)"; fail=1
  fi
  port_busy "${PORTS[i]}" && echo "[WARN] port ${PORTS[i]} already in use - $s may fail to start."
done
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm not found. Install Node 22+ (nvm install 22)."; fail=1; }
if [ $fail -ne 0 ]; then
  read -r -p "Press Enter to close..." _ || true
  exit 1
fi

# ---- permission check -----------------------------------------
# Terminal.app's AppleScript has no "new tab" command, so tabs are opened
# by sending Cmd+T through System Events. macOS requires two one-time
# permissions for the app running this script (Terminal when double-clicked):
#   1. Automation    : "Terminal wants to control System Events" -> Allow
#   2. Accessibility : System Settings > Privacy & Security > Accessibility > Terminal ON
# Without them the script can only open separate windows.
check_tab_permission() {
  # Long timeout so the first-run Automation prompt can be answered.
  osascript -e 'with timeout of 120 seconds
    tell application "System Events" to return UI elements enabled
  end timeout' 2>&1
}

USE_TABS=1
if [ ${#PICKED[@]} -gt 1 ]; then
  perm="$(check_tab_permission)"
  while [ "$perm" != "true" ]; do
    echo
    if [ "$perm" = "false" ]; then
      echo "[!] Accessibility permission is needed to open tabs."
      echo "    Opening System Settings > Privacy & Security > Accessibility..."
      echo "    Turn ON the app running this script (Terminal), then come back here."
      open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
    else
      echo "[!] Automation permission is needed to open tabs ($perm)."
      echo "    Opening System Settings > Privacy & Security > Automation..."
      echo "    Under Terminal, turn ON \"System Events\", then come back here."
      open "x-apple.systempreferences:com.apple.preference.security?Privacy_Automation"
    fi
    read -r -p "Press Enter to retry, or type w + Enter to use separate windows: " ans || ans=w
    if [ "$ans" = "w" ]; then USE_TABS=0; break; fi
    perm="$(check_tab_permission)"
  done
fi

# ---- launch ---------------------------------------------------
# One Terminal window, one tab per service. Each tab keeps its shell alive
# after the process stops, so you can restart it with the up-arrow.
ARGS=()
for i in "${PICKED[@]}"; do ARGS+=("${SERVICES[i]}" "${CMDS[i]}"); done
osascript - "$USE_TABS" "${ARGS[@]}" \
  >/dev/null <<'APPLESCRIPT'
on run argv
  set useTabs to (item 1 of argv) is "1"
  tell application "Terminal"
    activate
    set t to do script (item 3 of argv)
    set custom title of t to (item 2 of argv)
    set lastWin to front window
  end tell
  repeat with i from 4 to (count argv) by 2
    set theTitle to item i of argv
    set theCmd to item (i + 1) of argv
    set opened to false
    if useTabs then
      -- Terminal scripting treats each tab as its own window, so after
      -- Cmd+T the new tab is the front window (in the same tab group).
      -- Cmd+T goes to whichever app is frontmost, so make sure that is
      -- Terminal (with our tab group in front) before sending it, and
      -- verify a tab was really added before typing into it.
      repeat 3 times
        tell application "Terminal"
          activate
          set index of lastWin to 1
          set countBefore to count windows
        end tell
        tell application "System Events" to set frontmost of process "Terminal" to true
        set isFront to false
        repeat 20 times
          tell application "System Events" to set isFront to frontmost of process "Terminal"
          if isFront then exit repeat
          delay 0.1
        end repeat
        if isFront then
          tell application "System Events" to tell process "Terminal" to keystroke "t" using command down
          repeat 20 times
            delay 0.1
            tell application "Terminal" to set nowCount to count windows
            if nowCount > countBefore then exit repeat
          end repeat
          if nowCount > countBefore then
            tell application "Terminal"
              set lastWin to front window
              set t to selected tab of lastWin
              do script theCmd in t
              set custom title of t to theTitle
            end tell
            set opened to true
            exit repeat
          end if
        end if
        delay 0.5
      end repeat
    end if
    if not opened then
      -- No tab could be opened (Terminal not frontmost / no permission):
      -- use a separate window rather than typing into the wrong tab.
      tell application "Terminal"
        set t to do script theCmd
        set custom title of t to theTitle
      end tell
    end if
  end repeat
end run
APPLESCRIPT
launch_status=$?
if [ $launch_status -ne 0 ]; then
  echo "[ERROR] Opening the service tabs failed (osascript exit $launch_status)."
  read -r -p "Press Enter to close..." _ || true
  exit 1
fi

started=""
for i in "${PICKED[@]}"; do started="$started | ${SERVICES[i]} :${PORTS[i]}"; done
echo "Started: ${started# | }"

# ---- close the launcher window ----------------------------------
# A double-clicked .command opens its own Terminal window, titled after this
# file. Close it once this script has exited (so Terminal doesn't ask to
# terminate it). Running from an existing shell is left untouched, since
# that tab has no such title.
MY_TTY="$(tty 2>/dev/null || true)"
if [ "${TERM_PROGRAM:-}" = "Apple_Terminal" ] && [ -n "$MY_TTY" ] && [ "$MY_TTY" != "not a tty" ]; then
  nohup osascript - "$MY_TTY" "$(basename "$0")" >/dev/null 2>&1 <<'APPLESCRIPT' &
on run argv
  set myTty to item 1 of argv
  set myName to item 2 of argv
  tell application "Terminal"
    set winId to missing value
    repeat with w in windows
      set t to selected tab of w
      if (tty of t) is myTty and (custom title of t) is myName then
        set winId to id of w
        exit repeat
      end if
    end repeat
    if winId is missing value then return
    -- wait (max ~10s) for the launcher shell to finish exiting
    repeat 20 times
      if not (busy of selected tab of window id winId) then exit repeat
      delay 0.5
    end repeat
    if not (busy of selected tab of window id winId) then close window id winId
  end tell
end run
APPLESCRIPT
  disown
fi

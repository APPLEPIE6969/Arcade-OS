#!/usr/bin/env python3
"""
Injects a forced-read "Custom Player Skin Required" modal popup into the
Eaglercraft 1.21.11 WASM HTML file.

The script is injected right before </head> and uses a retry loop with
setTimeout to re-append the modal to <html> (documentElement) — surviving
the Eaglercraft loader's body-clearing during game initialization.

The modal:
- Appears on the new tab when the game page loads
- Close button is disabled for 10 seconds (with live countdown)
- After 10s, the close button activates and user can dismiss
- Once dismissed, doesn't reappear during that browser session
"""

import sys
from pathlib import Path

FILE_PATH = Path("/home/z/my-project/public/games/eaglercraft-1-21-11-wasm/index.html")
SKIN_URL = "/games/eaglercraft-1-21-11-wasm/example-skin.png"
COUNTDOWN_SECONDS = 10

MODAL_SCRIPT_TAG = '''<script>
(function() {
  var SKIN_URL = "''' + SKIN_URL + '''";
  var COUNTDOWN = ''' + str(COUNTDOWN_SECONDS) + ''';
  var modalEl = null;
  var btnEl = null;
  var btnTextEl = null;
  var secondsLeft = COUNTDOWN;
  var intervalId = null;
  var observer = null;

  try {
    if (sessionStorage.getItem("eaglercraft-skin-modal-dismissed") === "1") return;
  } catch (e) {}

  function buildModal() {
    modalEl = document.createElement("div");
    modalEl.id = "skin-required-modal";
    modalEl.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(5,6,13,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:'Courier New',ui-monospace,monospace;color:#e8f4ff;";
    modalEl.innerHTML = '<div style="position:relative;max-width:560px;width:calc(100% - 48px);background:linear-gradient(145deg,#0d0a1a,#1a0a2e);border:2px solid #f472b6;border-radius:14px;box-shadow:0 0 40px rgba(244,114,182,0.4),0 20px 60px rgba(0,0,0,0.6);padding:36px 32px 28px;">'
      + '<div style="display:flex;justify-content:center;margin-bottom:18px;"><div style="width:64px;height:64px;border-radius:50%;border:2px solid #f472b6;background:rgba(244,114,182,0.15);display:flex;align-items:center;justify-content:center;animation:skin-modal-pulse 2s ease-in-out infinite;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div></div>'
      + '<h2 style="text-align:center;font-size:22px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#f472b6;text-shadow:0 0 16px rgba(244,114,182,0.7);margin:0 0 6px 0;">Custom Player Skin Required</h2>'
      + '<div style="text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(232,244,255,0.5);margin-bottom:20px;">Eaglercraft 1.21.11 WASM</div>'
      + '<p style="font-size:14px;line-height:1.65;color:rgba(232,244,255,0.85);margin:0 0 20px 0;">This game <strong style="color:#f472b6;">will not work</strong> without a custom player skin. Download a 64x64 PNG Minecraft skin and import it through the in-game skin picker on the title screen before the player model will render.</p>'
      + '<div style="display:flex;justify-content:center;margin-bottom:24px;"><a href="' + SKIN_URL + '" download="example-skin.png" style="display:inline-flex;align-items:center;gap:10px;padding:12px 24px;border:1.5px solid #facc15;background:rgba(250,204,21,0.1);color:#facc15;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;border-radius:8px;transition:all 0.18s ease;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download example-skin.png</a></div>'
      + '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;"><button id="skin-modal-close-btn" disabled style="display:inline-flex;align-items:center;gap:8px;padding:10px 28px;border:1.5px solid rgba(232,244,255,0.2);background:rgba(255,255,255,0.04);color:rgba(232,244,255,0.35);font-family:inherit;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;border-radius:8px;cursor:not-allowed;transition:all 0.18s ease;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span id="skin-modal-close-text">Please read - ' + COUNTDOWN + 's</span></button><div style="font-size:10px;color:rgba(232,244,255,0.35);letter-spacing:0.1em;">You must wait to read this before continuing</div></div>'
      + '</div>';

    var styleEl = document.createElement("style");
    styleEl.textContent = '@keyframes skin-modal-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(244,114,182,0.5); } 50% { box-shadow: 0 0 0 14px rgba(244,114,182,0); } } #skin-required-modal.hidden { display: none !important; } #skin-modal-close-btn.enabled { border-color:#4ade80 !important; background:rgba(74,222,128,0.1) !important; color:#4ade80 !important; cursor:pointer !important; } #skin-modal-close-btn.enabled:hover { background:rgba(74,222,128,0.2) !important; transform:translateY(-1px); }';
    document.documentElement.appendChild(styleEl);

    btnEl = modalEl.querySelector("#skin-modal-close-btn");
    btnTextEl = modalEl.querySelector("#skin-modal-close-text");

    btnEl.addEventListener("click", function() {
      if (btnEl.disabled) return;
      modalEl.classList.add("hidden");
      try { sessionStorage.setItem("eaglercraft-skin-modal-dismissed", "1"); } catch (e) {}
      if (observer) observer.disconnect();
    });
  }

  function startCountdown() {
    if (intervalId) return;
    function update() {
      if (secondsLeft > 0) { btnTextEl.textContent = "Please read - " + secondsLeft + "s"; }
      else { btnTextEl.textContent = "I understand - close"; }
    }
    update();
    intervalId = setInterval(function() {
      secondsLeft--;
      if (secondsLeft <= 0) {
        secondsLeft = 0;
        clearInterval(intervalId);
        btnEl.disabled = false;
        btnEl.classList.add("enabled");
        update();
      } else { update(); }
    }, 1000);
  }

  function ensureModal() {
    if (!modalEl) buildModal();
    if (!modalEl.parentNode && !modalEl.classList.contains("hidden")) {
      document.documentElement.appendChild(modalEl);
      startCountdown();
    }
  }

  // Run immediately
  ensureModal();

  // Retry loop — Eaglercraft's loader clears <body> during init, which may
  // also strip our modal if it was accidentally placed there. These retries
  // re-append to <html> (documentElement) which Eaglercraft never clears.
  var retryDelays = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  retryDelays.forEach(function(d) { setTimeout(ensureModal, d); });

  // Safety net: if anything removes the modal, re-append it
  observer = new MutationObserver(function() {
    if (modalEl && !modalEl.parentNode && !modalEl.classList.contains("hidden")) {
      document.documentElement.appendChild(modalEl);
    }
  });
  observer.observe(document.documentElement, { childList: true });
})();
</script>'''

def remove_old_injections(content):
    """Remove any previously-injected modal scripts (both body and head versions)."""
    # Remove body-injected version
    while True:
        idx = content.find('<script>\n(function() {\n  var SKIN_URL =')
        if idx == -1:
            break
        end = content.find('</script>', idx)
        if end == -1:
            break
        end += len('</script>')
        # Remove the preceding newline too
        if idx > 0 and content[idx-1] == '\n':
            idx -= 1
        content = content[:idx] + content[end:]
        print("  Removed old script injection at char", idx)
    return content

def main():
    if not FILE_PATH.exists():
        print("ERROR: file not found:", FILE_PATH, file=sys.stderr)
        sys.exit(1)

    content = FILE_PATH.read_text(encoding="utf-8", errors="replace")

    # Strip any old injections first
    content = remove_old_injections(content)

    # Check if already has our marker
    if "skin-required-modal" in content:
        print("Already has modal marker - re-injecting fresh version.")

    # Inject right before </head>
    head_close = content.find("</head>")
    if head_close == -1:
        print("ERROR: </head> not found", file=sys.stderr)
        sys.exit(1)

    new_content = content[:head_close] + MODAL_SCRIPT_TAG + "\n" + content[head_close:]

    FILE_PATH.write_text(new_content, encoding="utf-8")
    print("Injected modal script before </head> at char", head_close)
    print("New file size:", len(new_content), "bytes")

if __name__ == "__main__":
    main()

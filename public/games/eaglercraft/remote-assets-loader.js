/* =====================================================================
 * ARCADE.OS — Eaglercraft 26.1.2 assets.epk remote loader
 * =====================================================================
 *
 * This script replaces the local `assets.epk` file (369 MB, too large
 * for GitHub / Vercel) with a runtime fetch from Google Drive.
 *
 * Flow:
 *   1. On page load, before Eaglercraft's `main()` runs, fetch the
 *      original `eagle_crap_26.1.2.zip` from Google Drive as an
 *      ArrayBuffer (CORS works — Drive sends `Access-Control-Allow-Origin: *`).
 *   2. Decompress the zip in-browser using fflate (tiny, ~8 KB) and
 *      extract the `assets.epk` entry.
 *   3. Create a Blob URL from the extracted EPK bytes.
 *   4. Set `window.eaglercraftXOpts.assetsURI` to the Blob URL.
 *   5. Call Eaglercraft's `main()` — it fetches the blob URL as if it
 *      were a regular file URL, no modifications to the game needed.
 *
 * The zip is cached in the browser's Cache Storage so repeat visits
 * don't re-download the 375 MB file.
 * ===================================================================== */

(function () {
  "use strict";

  // Original Google Drive upload of eagle_crap_26.1.2.zip (375 MB).
  // Drive's direct-download endpoint serves this with CORS headers
  // (Access-Control-Allow-Origin: *) so cross-origin fetch works.
  var GDRIVE_FILE_ID = "1hyrgKsDh-fkL1P39JN-gh4ZW8z1NC-A4";
  var GDRIVE_URL =
    "https://drive.usercontent.google.com/download?id=" +
    GDRIVE_FILE_ID +
    "&export=download&confirm=t";

  // Expected extracted EPK size — used to verify the extraction worked.
  var EXPECTED_EPK_SIZE = 369328189;

  // Cache Storage key — repeat visits skip the 375 MB download.
  var CACHE_NAME = "arcade-os-eaglercraft-assets-v1";
  var CACHE_KEY = GDRIVE_URL;

  // fflate is loaded from CDN (jsDelivr) — only ~8 KB gzipped.
  var FFLOAD_CDN = "https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js";

  // ===================================================================
  // Tiny UI: show download progress while the 375 MB file is fetched.
  // ===================================================================
  function createProgressUI() {
    var overlay = document.createElement("div");
    overlay.id = "epk-loader-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#05060d;color:#e8f4ff;font-family:'Courier New',ui-monospace,monospace;";
    overlay.innerHTML =
      '<div style="max-width:520px;width:calc(100% - 48px);text-align:center;padding:36px;">' +
      '<div style="margin-bottom:24px;font-size:22px;font-weight:bold;letter-spacing:0.1em;color:#22d3ee;text-shadow:0 0 16px rgba(34,211,238,0.7);">LOADING ASSETS</div>' +
      '<div style="font-size:13px;color:rgba(232,244,255,0.7);margin-bottom:24px;">Fetching Eaglercraft 26.1.2 assets.epk from cloud storage (one-time, ~375 MB)</div>' +
      '<div style="position:relative;width:100%;height:8px;background:rgba(255,255,255,0.08);border-radius:9999px;overflow:hidden;margin-bottom:12px;">' +
      '<div id="epk-loader-bar" style="position:absolute;left:0;top:0;height:100%;width:0%;background:linear-gradient(90deg,#22d3ee,#f472b6);border-radius:9999px;transition:width 0.2s ease;"></div>' +
      "</div>" +
      '<div id="epk-loader-status" style="font-size:11px;color:rgba(232,244,255,0.5);letter-spacing:0.08em;">Starting...</div>' +
      '<div id="epk-loader-percent" style="margin-top:8px;font-size:28px;font-weight:bold;color:#22d3ee;">0%</div>' +
      "</div>";
    document.documentElement.appendChild(overlay);
    return {
      overlay: overlay,
      bar: overlay.querySelector("#epk-loader-bar"),
      status: overlay.querySelector("#epk-loader-status"),
      percent: overlay.querySelector("#epk-loader-percent"),
    };
  }

  function setStatus(ui, status, percent) {
    if (status) ui.status.textContent = status;
    if (typeof percent === "number") {
      ui.bar.style.width = percent + "%";
      ui.percent.textContent = Math.round(percent) + "%";
    }
  }

  function removeUI(ui) {
    if (ui.overlay && ui.overlay.parentNode) {
      ui.overlay.parentNode.removeChild(ui.overlay);
    }
  }

  function showError(message) {
    var overlay = document.getElementById("epk-loader-overlay");
    if (overlay) {
      overlay.innerHTML =
        '<div style="max-width:520px;width:calc(100% - 48px);text-align:center;padding:36px;">' +
        '<div style="margin-bottom:18px;font-size:22px;font-weight:bold;color:#f472b6;letter-spacing:0.1em;text-shadow:0 0 16px rgba(244,114,182,0.7);">ASSET DOWNLOAD FAILED</div>' +
        '<div style="font-size:13px;color:rgba(232,244,255,0.8);line-height:1.6;margin-bottom:20px;">' +
        message +
        "</div>" +
        '<button onclick="location.reload()" style="padding:10px 24px;border:1.5px solid #facc15;background:rgba(250,204,21,0.1);color:#facc15;font-family:inherit;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;border-radius:8px;cursor:pointer;">Retry</button>' +
        "</div>";
    }
  }

  // ===================================================================
  // Load fflate from CDN.
  // ===================================================================
  function loadFflate() {
    return new Promise(function (resolve, reject) {
      if (window.fflate) {
        resolve(window.fflate);
        return;
      }
      var script = document.createElement("script");
      script.src = FFLOAD_CDN;
      script.onload = function () {
        if (window.fflate) resolve(window.fflate);
        else reject(new Error("fflate loaded but window.fflate is undefined"));
      };
      script.onerror = function () {
        reject(new Error("Failed to load fflate from CDN"));
      };
      document.head.appendChild(script);
    });
  }

  // ===================================================================
  // Fetch the Google Drive zip as an ArrayBuffer with progress.
  // Uses Cache Storage for repeat-visit speed.
  // ===================================================================
  function fetchZipWithProgress(ui) {
    return caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.match(CACHE_KEY);
      })
      .then(function (cached) {
        if (cached) {
          setStatus(ui, "Loading from cache...", 100);
          return cached.arrayBuffer();
        }
        // No cache — fetch fresh with progress
        setStatus(ui, "Connecting to Google Drive...", 0);
        return fetch(GDRIVE_URL).then(function (response) {
          if (!response.ok) {
            throw new Error(
              "HTTP " + response.status + " — Google Drive refused the request"
            );
          }
          var total = parseInt(response.headers.get("content-length") || "0", 10);
          if (!total) total = 375430304; // fallback to known size

          var reader = response.body.getReader();
          var received = 0;
          var chunks = [];

          function pump() {
            return reader.read().then(function (result) {
              if (result.done) {
                setStatus(ui, "Download complete", 100);
                var blob = new Blob(chunks);
                // Cache for next time
                caches
                  .open(CACHE_NAME)
                  .then(function (cache) {
                    cache.put(CACHE_KEY, new Response(blob));
                  })
                  .catch(function () {
                    /* cache failure is non-fatal */
                  });
                return blob.arrayBuffer();
              }
              chunks.push(result.value);
              received += result.value.length;
              var pct = (received / total) * 100;
              var mbReceived = (received / 1024 / 1024).toFixed(1);
              var mbTotal = (total / 1024 / 1024).toFixed(1);
              setStatus(
                ui,
                "Downloading... " + mbReceived + " / " + mbTotal + " MB",
                pct
              );
              return pump();
            });
          }
          return pump();
        });
      });
  }

  // ===================================================================
  // Extract assets.epk from the zip ArrayBuffer using fflate.unzipSync.
  // ===================================================================
  function extractEpk(zipBuffer, fflate, ui) {
    setStatus(ui, "Extracting assets.epk from archive...", 100);
    return new Promise(function (resolve, reject) {
      // Slight delay so the "Extracting..." status actually paints
      setTimeout(function () {
        try {
          var files = fflate.unzipSync(new Uint8Array(zipBuffer));
          if (!files["assets.epk"]) {
            reject(new Error("assets.epk not found in the downloaded zip"));
            return;
          }
          var epkBytes = files["assets.epk"];
          if (epkBytes.length !== EXPECTED_EPK_SIZE) {
            console.warn(
              "EPK size mismatch: got " +
                epkBytes.length +
                " bytes, expected " +
                EXPECTED_EPK_SIZE +
                " — continuing anyway"
            );
          }
          resolve(epkBytes);
        } catch (e) {
          reject(new Error("Zip extraction failed: " + e.message));
        }
      }, 50);
    });
  }

  // ===================================================================
  // Main entry point — called by Eaglercraft's load handler instead of
  // the original main() call.
  // ===================================================================
  window.loadEaglercraftAssetsRemotely = function () {
    var ui = createProgressUI();

    loadFflate()
      .then(function (fflate) {
        return fetchZipWithProgress(ui).then(function (zipBuffer) {
          return extractEpk(zipBuffer, fflate, ui);
        });
      })
      .then(function (epkBytes) {
        setStatus(ui, "Preparing game...", 100);
        var blob = new Blob([epkBytes], {
          type: "application/octet-stream",
        });
        var blobUrl = URL.createObjectURL(blob);
        // Hand the blob URL to Eaglercraft as its assetsURI.
        // The loader will fetch it just like a regular URL.
        if (typeof window.eaglercraftXOpts !== "object" || window.eaglercraftXOpts === null) {
          window.eaglercraftXOpts = {};
        }
        window.eaglercraftXOpts.assetsURI = blobUrl;
        // Stash the blob URL so it doesn't get garbage-collected.
        window.__eaglercraftAssetsBlobUrl = blobUrl;

        // Brief delay so the user sees "Preparing game..." before the
        // overlay vanishes and Eaglercraft's own loading screen appears.
        setTimeout(function () {
          removeUI(ui);
          if (typeof window.main === "function") {
            window.main();
          } else {
            console.error("Eaglercraft main() not found — classes.js may have failed to load");
          }
        }, 400);
      })
      .catch(function (err) {
        console.error("Asset loader failed:", err);
        showError(
          "Could not load the Eaglercraft 26.1.2 asset file. " +
            "This usually means your internet connection dropped during the 375 MB download, or Google Drive is rate-limiting this URL. " +
            "Check your connection and click Retry to try again. " +
            "<br><br><strong style='color:#facc15;'>Error:</strong> " +
            (err.message || String(err))
        );
      });
  };
})();

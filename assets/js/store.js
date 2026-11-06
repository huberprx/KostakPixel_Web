/* App store links, badges and QR code.
   ---------------------------------------------------------------
   THE ONLY PLACE TO EDIT LINKS:
   - appStore   – App Store product page.
   - googlePlay – leave "" until the app is live on Google Play.
     Paste the Play Store link here and the Google Play badge, its
     legal line and the Android redirect (/app/) switch on by themselves.
   --------------------------------------------------------------- */
window.APP_LINKS = {
  appStore: "https://apps.apple.com/app/id6777076502",
  googlePlay: ""
};

(function () {
  "use strict";
  var L = window.APP_LINKS;

  // Official localized badges available in assets/badges (others fall back to English).
  var APPLE = ["en", "pl", "es", "fr", "de", "it", "pt", "ru", "nl", "sv", "zh", "id", "ja", "ko", "vi", "tr"];
  var GPLAY = ["en", "pl", "es", "fr", "de", "it", "pt", "ru", "nl", "sv", "zh", "hi", "id", "ja", "ko", "vi", "tr", "bn", "ar", "ur", "fa"];

  function base() {
    var root = document.currentScript && document.currentScript.src;
    return root ? root.replace(/assets\/js\/store\.js.*$/, "") : "";
  }
  var ROOT = base();

  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0];
    return l;
  }

  function updateBadges() {
    var l = lang();
    var a = APPLE.indexOf(l) !== -1 ? l : "en";
    var g = GPLAY.indexOf(l) !== -1 ? l : "en";
    document.querySelectorAll(".store-badge--apple img").forEach(function (img) {
      var src = ROOT + "assets/badges/appstore/" + a + ".svg";
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    document.querySelectorAll(".store-badge--gplay img").forEach(function (img) {
      var src = ROOT + "assets/badges/googleplay/" + g + ".png";
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
  }

  function init() {
    document.querySelectorAll(".store-badge--apple").forEach(function (a) {
      a.setAttribute("href", L.appStore);
    });
    if (L.googlePlay) {
      document.querySelectorAll(".store-badge--gplay").forEach(function (a) {
        a.setAttribute("href", L.googlePlay);
      });
      document.querySelectorAll("[data-store-gplay]").forEach(function (el) {
        el.hidden = false;
      });
    }
    updateBadges();
    new MutationObserver(updateBadges).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

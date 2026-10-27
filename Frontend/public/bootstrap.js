(function () {
  var match = window.location.pathname.match(/^\/(ar|en)(\/|$)/);
  var language = match ? match[1] : "ar";
  document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", language);

  var consentKey = "starbucks_cookie_consent";
  var tagId = "GTM-NDTPL72C";

  function hasAdvertisingConsent() {
    try {
      var consent = localStorage.getItem(consentKey);
      if (consent === "accepted") return true;
      if (!consent || consent === "declined") return false;
      return JSON.parse(consent).advertising === true;
    } catch (_) {
      return false;
    }
  }

  function loadAnalytics() {
    if (!hasAdvertisingConsent() || window.__starbucksAnalyticsLoaded) return;
    window.__starbucksAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + tagId;
    document.head.appendChild(script);
  }

  window.addEventListener("starbucks-cookie-consent", loadAnalytics);
  window.addEventListener("load", loadAnalytics, { once: true });
})();
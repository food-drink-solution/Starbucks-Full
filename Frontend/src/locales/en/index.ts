import general from "./common/general.json";
import auth from "./common/auth.json";
import chat from "./common/chat.json";
import notfound from "./common/notfound.json";
import navbar from "./navigation/navbar.json";
import footer from "./navigation/footer.json";
import legal from "./navigation/legal.json";
import errors from "./common/errors.json";
import loading from "./common/loading.json";
import accessibility from "./common/accessibility.json";
import cookieConsent from "./common/cookieConsent.json";
import cart from "./common/cart.json";
import home from "./pages/home.json";

// Page-specific translations are loaded lazily per route via
// src/lib/i18n/pageTranslations.ts — they are NOT part of the main bundle,
// except home which is needed on initial render.

const common = {
  ...general,
  auth,
  chat,
  cart,
  notfound,
  errors,
  loading,
  accessibility,
  cookieConsent,
};

const navigation = {
  navbar,
  footer,
  legal,
};

export default {
  common,
  navigation,
  pages: {
    home,
  },
};

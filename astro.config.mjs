import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://whitewoodtrading.com",
  session: false,
  output: "server",
  trailingSlash: "always",
  adapter: cloudflare({ imageService: "compile" }),
  redirects: {
    "/ro/acasa.html": "/ro/",
    "/ro/despre-noi.html": "/ro/despre/",
    "/ro/cherestea-fag.html": "/ro/produse/fag/",
    "/ro/cherestea-frasin.html": "/ro/produse/frasin/",
    "/ro/cherestea-rasinoase.html": "/ro/produse/rasinoase/",
    "/ro/lemn-pentru-ambalat.html": "/ro/produse/ambalaje/",
    "/ro/articole-lemn.html": "/ro/articole/",
    "/ro/contact.html": "/ro/contact/",
    "/ro/protectie-date-caracter-personal.html": "/ro/confidentialitate/",
    "/ro/politica-cookie.html": "/ro/cookies/",
    "/ro/articole/cherestea-rasinoase-cherestea-fag-frasin-consum-exploatare-rationala-lemn-pandemie.html": "/ro/articole/",
    "/ro/articole/lemn-aliatul-unu-constructiile-prietenoase-mediului-omului.html": "/ro/articole/",
    "/ro/articole/lemnul-material-prietenos-omului-multiple-utilizari.html": "/ro/articole/",
    "/about-us.html": "/en/about/",
    "/beech-sawn-timber.html": "/en/products/beech/",
    "/ash-sawn-timber.html": "/en/products/ash/",
    "/softwood-sawn-timber.html": "/en/products/softwood/",
    "/wood-for-packages.html": "/en/products/packaging/",
    "/timber-blog.html": "/en/articles/",
    "/contact-us.html": "/en/contact/",
    "/privacy-policy.html": "/en/privacy/",
    "/cookie-policy.html": "/en/cookies/",
    "/blog/softwood-swan-timber-hardwood-sawn-timber-consumption-rational-exploitation-covid.html": "/en/articles/",
    "/blog/wood-human-friendly-material-with-multiple-uses.html": "/en/articles/",
    "/blog/wood-number-one-ally-eco-friendly-human-friendly-building-constructions.html": "/en/articles/"
  }
});

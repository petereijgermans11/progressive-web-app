module.exports = {
  "globDirectory": "fe-guild-2019-pwa/",
  "globPatterns": [
      "**/*.{html,ico,json,css,js}",
      "src/images/*.{jpg,png}"
  ],
  "swDest": "fe-guild-2019-pwa/sw.js",
  "swSrc": "fe-guild-2019-pwa/sw-template.js",
    "globIgnores": [
        "../workbox-config.js",
        "sw-template.js",
        "help/**"
    ]
};

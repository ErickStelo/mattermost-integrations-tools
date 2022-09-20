
require("isomorphic-fetch");
var { GiphyFetch } = require("@giphy/js-fetch-api");
const fs = require('fs');
var gf = new GiphyFetch(process.env.GIPHY_TOKEN);

module.exports = {

    find: async function (search = null, type = `gifs`) {
        
        if (search && type) {
            const result = await gf.search(search, { limit: 1, lang: 'en', sort: `relevant`, type: type });
            if (result.data.length > 0) {
                switch (type) {
                    case 'gifs':
                        return Promise.resolve(result.data[0].images.original.url)
                    case 'stickers':
                        return Promise.resolve(result.data[0].images.fixed_width_downsampled.url)

                    default:
                        return Promise.resolve(result.data[0].images.original.url)
                }
            } else {
                return Promise.resolve(false)
            }
        } else {
            return Promise.resolve(false)
        }
    },

    generateText: async function (text, modelo) {
        if (text) {
            const result = await gf.animate(text);

            var modelTypes = [
                "gum",
                "blingy",
                "partytime",
                "floatie",
                "toytales",
                "super",
                "pinky",
                "bless",
                "friendz",
                "meme",
                "creep",
                "beaming",
                "sweetie",
                "magicspell",
                "monkeyisland",
                "callofdoodie",
                "rage",
                "battleroyale",
                "pumpaction",
                "greenbanana",
                "guava",
                "chromedome",
                "goldbanana",
                "pressstart",
                "sealife",
                "poofy",
                "gosports",
                "yeehaw",
                "themepark",
                "clickhere",
                "h1title",
                "coolzone",
                "webring",
                "midifiles",
                "emailme",
                "calypso",
                "teetertotter",
                "meanwhile",
                "magicdance",
                "wowie",
                "coyote",
                "newborn"
            ]

            const modeloToFind = modelo ? modelTypes[modelo] : 'greenbanana';

            if (result.data.length > 0) {
                var modelFounded = null;
                result.data.forEach(gif => {
                    if (gif.animated_text_style == modeloToFind) {
                        modelFounded = gif;
                    }
                })
                if (modelFounded) {
                    return Promise.resolve(modelFounded.images.fixed_width_small.url)
                } else {
                    return Promise.resolve(result.data[0].images.fixed_width_small.url)
                }
            }
        }
    }
}

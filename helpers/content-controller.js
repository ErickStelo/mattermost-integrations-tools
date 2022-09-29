
require("isomorphic-fetch");
var { GiphyFetch } = require("@giphy/js-fetch-api");
const fs = require('fs');
var gf = new GiphyFetch(process.env.GIPHY_TOKEN);
const axios = require('axios');
module.exports = {

    find: async function (search = null, type = `gifs`) {
        return new Promise(async (resolve, reject) => {
            var content_url = null;
            if (search && type) {
                if (process.env.GIF_SOURCE == 'tenor') { // Obtem conteúdo pelo Tenor

                    var params = {};

                    if (type == 'stickers') {
                        params.searchfilter = 'sticker';
                    }

                    params.key = process.env.TENOR_TOKEN;
                    params.client_key = 'meTools';
                    params.q = search;
                    params.random = true;
                    params.limit = 1;
                    params.country = 'BR';
                    params.locale = 'pt_BR';

                    return axios({
                        url: 'https://tenor.googleapis.com/v2/search',
                        method: 'GET',
                        params: params
                    }).then(reqSucces => {
                        if (reqSucces.data) {
                            const tenor = reqSucces.data;
                            if (tenor.results.length > 0) {
                                tenor.results.forEach(gifData => {
                                    if (type == 'stickers') {
                                        content_url = gifData.media_formats.tinygif_transparent.url
                                    } else {
                                        content_url = gifData.media_formats.mediumgif.url
                                    }
                                })
                                resolve(content_url)
                            } else {
                                resolve(content_url)
                            }
                        } else {
                            resolve(content_url)
                        }
                    }).catch(error => {
                        console.error('#299043 - Falha na consulta de gif com Tenor |File: app.js: ', error);
                        reject(new Error('Falha de comunicação. Comunique o administrador!'))
                    })
                } else if (process.env.GIF_SOURCE == 'giphy') { //Obtem conteúdo pelo Giphy
                    const result = await gf.search(search, { limit: 1, lang: 'pt', sort: `relevant`, type: type });
                    if (result.data.length > 0) {
                        switch (type) {
                            case 'gifs':
                                content_url = result.data[0].images.original.url;
                            case 'stickers':
                                content_url = result.data[0].images.fixed_width_downsampled.url;
                            default:
                                content_url = result.data[0].images.original.url;
                        }
                        resolve(content_url)
                    } else {
                        resolve(content_url)
                    }
                } else {
                    reject(new Error('Fonte de conteúdo não configurado! - Comunique o administrador'))
                }
            } else {
                reject(new Error('Valor para pesquisa ou tipo de conteudo não informado'))
            }
        })
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

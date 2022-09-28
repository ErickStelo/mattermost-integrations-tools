const axios = require('axios');
const fs = require('fs');

module.exports = {
    sendMessageForIdChannel: function (message, channelId, props = {attachments: []}) {
        if ((message || props.attachments.length > 0) && channelId) {
            return axios({
                method: 'post',
                url: process.env.MATTERMOST_API_URL + '/posts',
                headers: {
                    'Authorization': 'Bearer ' + process.env.MATTERMOST_TOKEN_BOT,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "channel_id": channelId,
                    "message": message,
                    "props": props
                })
            }).then(success => {
                if (success.data) {
                    return Promise.resolve(true);
                }
            }).catch(error => {
                if (error.response) {
                    console.error(error.response.data);
                } else {
                    console.error('Erro no request');
                }
                return Promise.reject(error);
            })
        } else {

        }
    },

    updatePost: function(message, postId, props = {}){
        if ((message || props.attachments.length > 0) && postId) {
            return axios({
                url: process.env.MATTERMOST_API_URL + '/posts/' + postId,
                method: 'put',
                headers: {
                    'Authorization': 'Bearer ' + process.env.MATTERMOST_TOKEN_BOT,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "id": postId,
                    "message": message,
                    "props": props
                })
            }).then(success => {
                if (success.data) {
                    return Promise.resolve(true);
                }
            }).catch(error => {
                if (error.response) {
                    console.error(error.response.data);
                } else {
                    console.error('Erro no request');
                }
                return Promise.reject(error);
            })
        }
    },

    removePost: function(postId){
        if (postId) {
            return axios({
                url: process.env.MATTERMOST_API_URL + '/posts/' + postId,
                method: 'delete',
                headers: {
                    'Authorization': 'Bearer ' + process.env.MATTERMOST_TOKEN_BOT,
                    'Content-Type': 'application/json'
                },
            }).then(success => {
                if (success.data) {
                    return Promise.resolve(true);
                }
            }).catch(error => {
                if (error.response) {
                    console.error(error.response.data);
                } else {
                    console.error('Erro no request');
                }
                return Promise.reject(error.message);
            })
        }
    },

    getPostsFromChannel: function (channel_id, number_of_posts) {
        if (channel_id && number_of_posts) {
            return axios({
                url: process.env.MATTERMOST_API_URL + '/channels/' + channel_id + '/posts',
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + process.env.MATTERMOST_TOKEN_BOT,
                    'Content-Type': 'application/json'
                },
                params:{
                    per_page: number_of_posts
                }
            }).then(reqSucces => {
                return Promise.resolve(reqSucces.data)
            }).catch(reqError => {
                return Promise.reject(error.message)
            })
        } else {
            return Promise.reject('Um ou mais parametros em falta')
        }
    }
}
require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const contentSearch = require('./helpers/content-controller');
const mattermost = require('./helpers/mattermost-controller');
const nodeSchedule = require('node-schedule');
const axios = require('axios');
const appPort = 8876;

const maxLogsRestart = 5;


app.use(express.urlencoded({
    extended: true
}));
app.use(express.json({
    type: 'application/vnd.api+json'
}));

app.use(cors());

app.use(function (req, res, next) {
    console.log('> Running Middleware');
    console.log('> Path:', req.path);
    next();
})

app.post('/content/gif', async (req, res) => {
    var payload = req.body;
    const channel_id = payload.channel_id;
    const search = payload.text.trim();
    if (channel_id && search) {
        console.log('> Buscando gifs de: ' + search + ' | Usuario: ' + payload.user_name);

        try {
            let content_url = await contentSearch.find(payload.text, 'gifs')
            if (content_url) {
                let message = `![](${content_url} "")`

                res.status(200).json({
                    text: message,
                    response_type: 'in_channel',
                    username: payload.user_name
                })
            }else{
                res.send('Nenhum conteudo encontrado. Tente novamente com outras palavras para pesquisa.')
            }
        } catch (error) {
            console.log(error);
            res.send(error.message)
        }

        
    }
})

app.post('/content/sticker', async (req, res) => {
    var payload = req.body;
    const channel_id = payload.channel_id;
    const search = payload.text;
    if (channel_id && search) {
        console.log('> Buscando sticker de: ' + search + ' | Usuario: ' + payload.user_name);

        try {
            let content_url = await contentSearch.find(payload.text, 'stickers')
            if (content_url) {
                let message = `![](${content_url} "")`
                res.status(200).json({
                    text: message,
                    response_type: 'in_channel',
                    username: payload.user_name
                })
            }else{
                res.send('Nenhum conteudo encontrado. Tente novamente com outras palavras para pesquisa.')
            }
        } catch (error) {
            console.log(error);
            res.send(error.message)
        }
    }
})

app.post('/content/textAnimator', async (req, res) => {
    var payload = req.body;
    const channel_id = payload.channel_id;

    var param = payload.text;
    var modeloId = null;

    if (param) {
        console.log('> Gerando texto animado: ' + param + ' | Usuario: ' + payload.user_name);

        if (param.substring(param.length - 2).substring(0, 1) === ' ') {
            modeloId = param.substring(param.length - 1)
        } else {
            modeloId = param.substring(param.length - 2)
        }

        if (isNaN(modeloId)) {
            modeloId = null;
        }
        var texto = modeloId ? param.substring(param, param.length - 2) : param;

        let content_url = await contentSearch.generateText(texto, modeloId)
        if (content_url) {
            let message = `![](${content_url} "")`
            res.status(200).json({
                text: message,
                response_type: 'in_channel',
                username: payload.user_name
            })
        }
    }
    res.send();
})

var scheduleList = [];
var restartsLogs = [];

function updateMattemostRestartTables() {
    var markDown = `|  Próximos Restarts  |\n`
    markDown += '| :-----: | \n'
    scheduleList.forEach(shedule => {
        let time = shedule.date.getHours() + ':' + shedule.date.getMinutes()
        markDown += `| Servidor ${shedule.server} - ${time} |\n`
    })

    if (scheduleList.length === 0) {
        markDown += `| Nenhum restart programado |\n`
    }

    markDown += '\n \n '
    markDown += `**Últimos 5 restarts:**\n`

    restartsLogs.forEach(log => {
        markDown += `* ${log}\n`
    })

    if (restartsLogs.length === 0) {
        markDown += '* *Nenhum restart recente encontrado*'
    }

    let attachments = [{
        text: markDown
    }]

    mattermost.updatePost('', 'askuaouadfrujdaxqot9ncbg1w', { attachments: attachments })
}

async function buildJenkinsJob(job_name, params = null) {
    console.log('++++ CALLING JENKINS JOB ++++');
    try {
        const reqSuccess = await axios({
            url: 'https://jim.metasig.com.br/job/' + job_name + (params ? '/buildWithParameters' : '/build'),
            method: 'post',
            params: params,
            auth: {
                username: 'api',
                password: '11a8c11c54f2ecaecf9248412f711d4e8f'
            },
            timeout: 5000
        });
        return await Promise.resolve();
    } catch (reqError) {
        return await Promise.reject(reqError.message);
    }
}

function addLogRestart(log) {
    if (restartsLogs.length == maxLogsRestart) {
        restartsLogs.splice(0, 1)
    }
    restartsLogs.push(log)
}

app.post('/remover-restart', function(req, res, next){

    var payload = req.body;
    var param = payload.text;

    if(param){
        var param = param.trim();
        var job = nodeSchedule.scheduledJobs[param]
        if(job){
            job.cancel();
        }
        var idx = scheduleList.findIndex(schedule => {
            if (schedule.server == param) {
                return true
            }
        })
        if (idx >= 0) {
            scheduleList.splice(idx, 1);
        }
        updateMattemostRestartTables();
        res.send('Servidor removido da fila de restarts')
    }else{
        res.send('Servidor não informado!')
    }
   
})

app.post('/agendar-restart', function (req, res, next) {

    var payload = req.body;
    var serverToRestart = null;
    var extractedNumbers = payload.text.match(/[0-9]/g)
    var serverToRestart = null;
    if (extractedNumbers) {
        serverToRestart = '';
        extractedNumbers.forEach(p => {
            serverToRestart += p;
        });
        serverToRestart = parseInt(serverToRestart)
    }

    if (serverToRestart) {
        let hasSchedule = false;

        scheduleList.forEach(shedule => {
            if (shedule.server === serverToRestart) {
                hasSchedule = true;
            }
        })

        if (!hasSchedule) {
            var dateNow = new Date();
            if (dateNow.getHours() <= 12) {
                dateNow.setHours(12, 10);
            } else {
                dateNow.setHours(22, 0);
            }

            // dateNow = new Date();
            // dateNow.setSeconds(dateNow.getSeconds() + 20)
            var scheduleDate = new Date(dateNow);
            var obj = {
                server: serverToRestart,
                date: scheduleDate,
            };

            scheduleList.push(obj);
            const job = nodeSchedule.scheduleJob(`${serverToRestart}`,scheduleDate, () => {
                console.log('> Executing job for restart server ', serverToRestart);
                var idx = scheduleList.findIndex(schedule => {
                    if (schedule.server == serverToRestart) {
                        return true
                    }
                })
                if (idx >= 0) {
                    scheduleList.splice(idx, 1);
                }

                buildJenkinsJob('Fix_cliente_perigeus', { SERVER: serverToRestart }).then(success => {
                // buildJenkinsJob('TesteApi').then(success => {
                    addLogRestart(`Servidor: ${serverToRestart} - Reiniciado em ${scheduleDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)
                    updateMattemostRestartTables()
                }).catch(error => {
                    addLogRestart(`Servidor: ${serverToRestart} - Falha - ${error}`)
                    updateMattemostRestartTables()
                })
            })

            console.log('> Job created with success');
            updateMattemostRestartTables()
            mattermost.removePost(payload.post_id);
            res.send('');

        } else {
            res.send('')
        }
    } else {
        res.send('Servidor não informado!')
    }
})

app.post('/updateListsRestarts', function (req, res, next) {
    updateMattemostRestartTables();
    res.send()
})

app.post('/mattermost/clean-channel', function (req, res, next) {
    var payload = req.body;
    const channel_id = payload.channel_id;
    var number_of_posts = null;
    var extractedNumbers = payload.text.match(/[0-9]/g)
    var number_of_posts = null;
    if (extractedNumbers) {
        number_of_posts = '';
        extractedNumbers.forEach(p => {
            number_of_posts += p;
        });
        number_of_posts = parseInt(number_of_posts)
    }
    if (number_of_posts) {
        mattermost.getPostsFromChannel(channel_id, number_of_posts).then(result => {
            var promise = []
            result.order.forEach(postId => {
                promise.push(mattermost.removePost(postId))
            })
            return Promise.all(promise).then(removed => {
                var attachments = [{
                    text: `Canal limpo | última(s) ${number_of_posts} mensagens apagadas por ${payload.user_name}`
                }]
                mattermost.sendMessageForIdChannel('', channel_id, { attachments: attachments });
                res.send('');
            })
        }).catch(error => {
            res.send(error)
        })
    } else {
        res.send('Informe a quantidade de posts a serem excluidos');
    }
})

app.listen(appPort, () => {
    console.log('Running on port', appPort);
})
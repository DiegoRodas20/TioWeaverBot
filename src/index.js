const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

//APIS
const { Client, MessageMedia } = require('whatsapp-web.js');
const ffmpeg = require('fluent-ffmpeg')
const qrcode = require('qrcode-terminal')
const fs = require('fs');
const SESSION_FILE_PATH = './session.json';

// Comandos Bot
const { menu } = require('./app/menu')
const { comandos } = require('./app/comandos');
const { stream } = require('./app/stream');
const { grupos } = require('./app/grupos');
const { bot } = require('./app/bot');

const bienvenido = JSON.parse(fs.readFileSync('./database/json/bienvenido.json'))

// Variables
var prefijo = '*'
const countryCode = "51"
const number = "930360511"
const msg = "BOT ENCENDIDO"
let sessionData;

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
// require('./')

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(`.${SESSION_FILE_PATH}`);
}

const cliente = new Client({
    session: sessionData,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    },
});

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

function startBot() {

    cliente.initialize();

    cliente.on('qr', qr => {
        qrcode.generate(qr, { small: true })
    })

    cliente.on('ready', () => {
        console.log('El Cliente esta listo')

        // let chatId = countryCode + number + "@c.us";
        let chatgrupoId = '51930360511-1604634954@g.us';

        cliente.sendMessage(chatgrupoId, msg).then(Response => {
            if (Response.id.fromMe) {
                console.log('El mensaje fue enviado')
            }
        })
    })

    cliente.on('authenticated', session => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session),
            err => {
                if (err) {
                    console.error(err);
                }
            })
    })

    cliente.on('auth_failure', msg => {
        console.error('Hubo un fallo en la autenticacion', msg);
    })

    cliente.on('group_join', per => {

        // const chat = await msg.getChat();
        const user = per.getContact();

        const media = MessageMedia.fromFilePath('src/assets/audio/bienvenido.mp3');
        var mensaje = `HOLAAAA @${user.id.user}! ¿COMO ESTAS MI CONDORCANKING? 😃 \n\n Bienvenido(a) a la Weaver Armada, recuerda leer las reglas del grupo y apoyar en todos los Streams mi rey.\n\n VAMOOOS MIERDAAA QUE ACA SOMOS UNA FAMILIA CARAJO!!`

        cliente.sendMessage(per.chatId, mensaje, { mentions: [user] });
        cliente.sendMessage(per.chatId, media);
    })

    cliente.on('group_leave', per => {

        const media = MessageMedia.fromFilePath('src/assets/audio/adios.mp3');
        var mensaje = `Hasta luego conchatumare hijo de las mil perras, tu vieja kchera emolientera!! `

        cliente.sendMessage(per.chatId, mensaje);
        cliente.sendMessage(per.chatId, media);
    })

    cliente.on('message', async (msg) => {

        if (msg.from === '51930360511-1604634954@g.us') {

            if (msg.body === `${prefijo}menu`) {

                cliente.sendMessage(msg.from, menu(prefijo));
            }

            else if (msg.body === `${prefijo}comandos`) {

                cliente.sendMessage(msg.from, comandos(prefijo));
            }

            else if (msg.body === `${prefijo}stream`) {

                cliente.sendMessage(msg.from, stream(prefijo));
            }

            else if (msg.body === `${prefijo}grupos`) {

                cliente.sendMessage(msg.from, grupos(prefijo));
            }

            else if (msg.body === `${prefijo}mipremio`) {

                const i = Math.floor(Math.random() * (6 - 1)) + 1;
                const media = MessageMedia.fromFilePath(`src/assets/img/porno${i}.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}bot`) {

                cliente.sendMessage(msg.from, bot(prefijo));
            }

            else if (msg.body === `${prefijo}sticker`) {

                if (msg.hasMedia && msg.type === 'image') {

                    const media = await msg.downloadMedia();
                    cliente.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                }
                else if (msg.hasMedia && msg.type != 'image') {
                    var mensaje = '❌ Solo Imagenes ps perro';
                    cliente.sendMessage(msg.from, mensaje)
                }
                else {
                    var mensaje = '❌ Porque eres bruto tio?, PIENSA MIERDA DEBES ENVIAR UNA IMAGEN';
                    cliente.sendMessage(msg.from, mensaje)
                }

            }

            else if (msg.body === `${prefijo}buenosdias`) {

                const media = MessageMedia.fromFilePath(`src/assets/audio/buenosdias.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}all`) {

                const chat = await msg.getChat();

                let text = "";
                let mentions = [];

                for (let participant of chat.participants) {
                    const contact = await cliente.getContactById(participant.id._serialized);

                    mentions.push(contact);
                    text += `@${participant.id.user} `;
                }

                await chat.sendMessage(msg.from, text, { mentions });
            }

            else if (msg.body.toLowerCase().includes('bot')) {

                const i = Math.floor(Math.random() * (5 - 1)) + 1;

                const media = MessageMedia.fromFilePath(`src/assets/audio/anime${i}.mp3`);
                cliente.sendMessage(msg.from, media);
            }
        }
    })
}

startBot()


            // else if (msg.body.includes(`${prefijo}tomp3`)) {

            //     var link = msg.links.link;

            //     const media = MessageMedia.fromUrl(link);
            //     cliente.sendMessage(msg.from, media, { sendMediaAsSticker: true })
            // }
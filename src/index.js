//APIS
const { Client, MessageMedia } = require('whatsapp-web.js');
const ffmpeg = require('fluent-ffmpeg')
const qrcode = require('qrcode-terminal')
const fs = require('fs');
const SESSION_FILE_PATH = '../session.json';

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

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const cliente = new Client({
    session: sessionData
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

        let chatId = countryCode + number + "@c.us";
        cliente.sendMessage(chatId, msg).then(Response => {
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

        const media = MessageMedia.fromFilePath('src/assets/audio/bienvenido.mp3');
        var mensaje = `HOLAAAA @${per.author.replace('@c.us', '')}! ¿COMO ESTAS MI CONDORCANKING? 😃 \n\n Bienvenido(a) a la Weaver Armada \n\n Recuerda leer las reglas del grupo y \n\n apoyar en todos los Streams mi rey!!`

        cliente.sendMessage(per.chatId, mensaje);
        cliente.sendMessage(per.chatId, media);
    })

    cliente.on('group_leave', per => {

        const media = MessageMedia.fromFilePath('src/assets/audio/adios.mp3');
        var mensaje = `Hasta luego conchatumare hijo de las mil perras, tu vieja kchera emolientera!! `

        cliente.sendMessage(per.chatId, mensaje);
        cliente.sendMessage(per.chatId, media);
    })

    cliente.on('message', async (msg) => {

        console.log(msg)

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

                // const media = new MessageMedia('https://youtu.be/YzKM5g_FwYU?list=RDMM', base64Image);
                // const media = MessageMedia.fromUrl('https://youtu.be/YzKM5g_FwYU?list=RDMM');
                const media = MessageMedia.fromFilePath('src/assets/img/porno1.jpg');
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}bot`) {

                cliente.sendMessage(msg.from, bot(prefijo));
            }

            else if (msg.body === `${prefijo}sticker`) {

                if (msg.hasMedia && msg.type === '') {

                    const media = await msg.downloadMedia();
                    cliente.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                }

                else {
                    var mensaje = 'Debes enviar una imagen mi rey!!';
                    cliente.sendMessage(msg.from, mensaje)
                }

            }

            else if (msg.body === `${prefijo}toimg`) {
                if (msg.hasMedia && msg.type === 'sticker') {
                    const media = await msg.downloadMedia();
                    cliente.sendMessage(msg.from, media, { send: true });
                }
                else {
                    var mensaje = 'Tienes que enviar un sticker mi wraith king'
                    cliente.sendMessage(msg.from, mensaje)
                }
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

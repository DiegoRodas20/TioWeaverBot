const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');

// Server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// APIS
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const fs = require('fs');
const SESSION_FILE_PATH = './session.json';

// Comandos General
const { stream } = require('./app/comandosgeneral/stream');
const { grupos } = require('./app/comandosgeneral/grupos');
const { bot } = require('./app/comandosgeneral/bot');

// Comandos Grupo Principal
const { menuPrincipal } = require('./app/grupoprincipal/menuprincipal')
const { comandosPrincipal } = require('./app/grupoprincipal/comandosprincipal');

// Comandos Grupo Programacion
const { menuProgramacion } = require('./app/grupoprogramacion/menuprogramacion')
const { comandosProgramacion } = require('./app/grupoprogramacion/comandosprogramacion')
const { cuentaProgramacion } = require('./app/grupoprogramacion/cuentaprogramacion')
const { cursosProgramacion } = require('./app/grupoprogramacion/cursosprogramacion')
const { java } = require('./app/grupoprogramacion/java')

// Variables Globales
var prefijo = '*'
const msg = "BOT ACTIVO CONCHASUMARE, VAMOOOS MIERDAAA!! ʕ•́ᴥ•̀ʔっ"
let sessionData;

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));


if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(`.${SESSION_FILE_PATH}`);
}

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: __dirname
    });
});

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

function startBot() {

    cliente.initialize();

    cliente.on('qr', qr => {
        qrcode.generate(qr, { small: true })
    })

    cliente.on('ready', () => {
        console.log('El Cliente esta listo')

        let grupoGeneral = '51930360511-1604634954@g.us';
        let grupoProgra = '51930360511-1615519188@g.us';

        cliente.sendMessage(grupoGeneral, msg).then(Response => {
            if (Response.id.fromMe) {
                console.log('El mensaje fue enviado al grupo general')
            }
        })
        cliente.sendMessage(grupoGeneral, menuPrincipal(prefijo));

        cliente.sendMessage(grupoProgra, msg).then(Response => {
            if (Response.id.fromMe) {
                console.log('El mensaje fue enviado al grupo de programación')
            }
        })

        cliente.sendMessage(grupoProgra, menuProgramacion(prefijo));
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

    cliente.on('group_join', async (per) => {

        if (per.chatId === '51930360511-1604634954@g.us' || per.chatId === '51930360511-1615519188@g.us') {

            const user = await per.getContact();

            const media = MessageMedia.fromFilePath('src/assets/audio/bienvenido.mp3');
            var mensaje = `HOLAAAA @${user.id.user}! ¿COMO ESTAS MI CONDORCANKING? 😃 \n\n Bienvenido(a) a la Weaver Armada, recuerda leer las reglas del grupo y apoyar en todos los Streams mi rey.\n\n VAMOOOS MIERDAAA QUE ACA SOMOS UNA FAMILIA CARAJO!!`

            cliente.sendMessage(per.chatId, mensaje, { mentions: [user] });
            cliente.sendMessage(per.chatId, media);
        }
    })

    cliente.on('group_leave', per => {

        if (per.chatId === '51930360511-1604634954@g.us' || per.chatId === '51930360511-1615519188@g.us') {

            const media = MessageMedia.fromFilePath('src/assets/audio/adios.mp3');
            var mensaje = `Hasta luego conchatumare hijo de las mil perras, tu vieja kchera emolientera!! `

            cliente.sendMessage(per.chatId, mensaje);
            cliente.sendMessage(per.chatId, media);
        }
    })

    cliente.on('message', async (msg) => {

        if (msg.from === '51930360511-1604634954@g.us') {

            if (msg.body === `${prefijo}menu`) {

                cliente.sendMessage(msg.from, menuPrincipal(prefijo));
            }

            else if (msg.body === `${prefijo}comandos`) {

                cliente.sendMessage(msg.from, comandosPrincipal(prefijo));
            }

            else if (msg.body === `${prefijo}stream`) {

                cliente.sendMessage(msg.from, stream(prefijo));
            }

            else if (msg.body === `${prefijo}grupos`) {

                cliente.sendMessage(msg.from, grupos(prefijo));
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
                    var mensaje = '❌ Solo Imagenes ps perro ❌';
                    cliente.sendMessage(msg.from, mensaje)
                }
                else {
                    var mensaje = '❌ Porque eres bruto tio?, PIENSA MIERDA DEBES ENVIAR UNA IMAGEN ❌';
                    cliente.sendMessage(msg.from, mensaje)
                }

            }

            else if (msg.body === `${prefijo}buenosdias`) {

                const media = MessageMedia.fromFilePath(`src/assets/audio/buenosdias.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}motivacion`) {

                const media = MessageMedia.fromFilePath(`src/assets/audio/motivacion.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}all`) {

                const authorId = msg.author || message.from;
                const chat = await msg.getChat();
                let isAdmin = true

                let text = "";
                let mentions = [];

                if (chat.isGroup) {

                    for (let participant of chat.participants) {
                        if (participant.id._serialized === authorId && !participant.isAdmin) {
                            msg.reply(`❌ El comando solo puede ser usado por admins ❌`);
                            isAdmin = false
                            break;
                        }
                        else {
                            const contact = await cliente.getContactById(participant.id._serialized);

                            mentions.push(contact);
                            text += `@${participant.id.user} `;
                        }
                    }

                    if (isAdmin) {
                        await chat.sendMessage(text, { mentions });
                    }
                }
            }

            else if (msg.body === `${prefijo}admins`) {

                const chat = await msg.getChat();

                let text = "";
                let mentions = [];

                if (chat.isGroup) {

                    for (let participant of chat.participants) {

                        if (participant.isAdmin) {
                            const contact = await cliente.getContactById(participant.id._serialized);

                            mentions.push(contact);
                            text += `@${participant.id.user} `;
                        }
                    }

                    await chat.sendMessage(text, { mentions });
                }

            }

        }

        else if (msg.from === '51930360511-1615519188@g.us') {

            if (msg.body === `${prefijo}menu`) {

                cliente.sendMessage(msg.from, menuProgramacion(prefijo));
            }

            else if (msg.body === `${prefijo}comandos`) {

                cliente.sendMessage(msg.from, comandosProgramacion(prefijo));
            }

            else if (msg.body === `${prefijo}stream`) {

                cliente.sendMessage(msg.from, stream(prefijo));
            }

            else if (msg.body === `${prefijo}grupos`) {

                cliente.sendMessage(msg.from, grupos(prefijo));
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
                    var mensaje = '❌ Solo Imagenes ps perro ❌';
                    cliente.sendMessage(msg.from, mensaje)
                }
                else {
                    var mensaje = '❌ Porque eres bruto tio?, PIENSA MIERDA DEBES ENVIAR UNA IMAGEN ❌';
                    cliente.sendMessage(msg.from, mensaje)
                }

            }

            else if (msg.body === `${prefijo}buenosdias`) {

                const media = MessageMedia.fromFilePath(`src/assets/audio/buenosdias.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}motivacion`) {

                const media = MessageMedia.fromFilePath(`src/assets/audio/motivacion.mp3`);
                cliente.sendMessage(msg.from, media);
            }

            else if (msg.body === `${prefijo}cuenta`) {

                cliente.sendMessage(msg.from, cuentaProgramacion(prefijo));
            }

            else if (msg.body === `${prefijo}cursos`) {

                cliente.sendMessage(msg.from, cursosProgramacion(prefijo));
            }

            else if (msg.body === `${prefijo}java`) {

                cliente.sendMessage(msg.from, java(prefijo));
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


                // for (let participant of chat.participants) {
                //     const contact = await cliente.getContactById(participant.id._serialized);

                //     mentions.push(contact);
                //     text += `@${participant.id.user} `;
                // }

                // await chat.sendMessage(text, { mentions });
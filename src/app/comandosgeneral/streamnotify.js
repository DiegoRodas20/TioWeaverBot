const streamNotify = (descripcion) => {

var mensaje = `
β  *ππΌπ ππΈπ΄ππΈπ π΅ππ* β       

*El Tio Weaver* esta transmitiendo en vivo:

${descripcion}                  
`;

return mensaje;
}

exports.streamNotify = streamNotify
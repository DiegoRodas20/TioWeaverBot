const streamNotify = (descripcion) => {

var mensaje = `

⌜  *𝑇𝐼𝑂 𝑊𝐸𝐴𝑉𝐸𝑅 𝐵𝑂𝑇* ⌟       

*El Tio Weaver* esta transmitiendo en vivo:
${descripcion}                  
`;

return mensaje;
}

exports.streamNotify = streamNotify
require("dotenv").config();
const mysql = require("mysql2");
 
const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
 
conexao.connect((erro) => {
    if(erro){
        console.log("Erro ao conectar:", erro);
    }
    else{
        console.log("Conectado ao banco!");
    }
});
 
module.exports = conexao;
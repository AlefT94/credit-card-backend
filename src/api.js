const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {verifyToken} = require('./middleware/auth.js')

const { GoogleSpreadsheet } = require('google-spreadsheet');
const credenciais = require('./credentials.json');
const SheetID = require('./SheetID.json');

const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const getDoc = async () => {
    const doc = new GoogleSpreadsheet(SheetID.id);
    
    await doc.useServiceAccountAuth({
        client_email: credenciais.client_email,
        //private_key: credenciais.private_key.replace(/\aLEFt94\n/g, '\n')
        private_key: credenciais.private_key.replace(/\\n/g, '\n')
    })
    await doc.loadInfo();
    return doc;
}

app.post('/buscar-dados',verifyToken,async function(req,res){
    try{
        let doc = await getDoc();
        let sheet = doc.sheetsById[0];
        let rows = await sheet.getRows();
        let data = [];
        rows.map(row => {
            if(row.periodo == req.body.periodo && row.cartao == req.body.cartao){
                let valorTratado = parseFloat(row.valor.replace('.', ''));
                valorTratado = parseFloat(row.valor.replace(',', '.'));
                data.push({
                    id: row.rowNumber,
                    periodo: row.periodo,
                    cartao: row.cartao,
                    classificacao: row.classificacao,
                    valor: valorTratado,
                    descricao: row.descricao,
                    complemento: row.complemento
                })
            }
        });
        res.json(data);
    }catch{
        res.status(400).send('Something broke!');
    }
})

app.post('/criar',verifyToken,async(req,res)=>{
    try{
        let doc = await getDoc();
        let sheet = doc.sheetsById[0];
        await sheet.addRow({
            periodo: req.body.periodo,
            cartao: req.body.cartao,
            classificacao: req.body.classificacao,
            valor: req.body.valor,
            descricao: req.body.descricao,
            complemento: req.body.complemento
        });
        res.sendStatus(200);
    }catch{
        res.status(400).send('Something broke!');
    }
})

app.post('/modificar',verifyToken,async function(req,res){
    try{
        let doc = await getDoc();
        let sheet = doc.sheetsById[0];
        let rows = await sheet.getRows();
        let found = false;
        let data = [];
        rows.map(async (row) => {
            if (row.rowNumber === req.body.id){
                row.periodo = req.body.periodo;
                row.cartao = req.body.cartao;
                row.classificacao = req.body.classificacao;
                row.valor = req.body.valor;
                row.descricao = req.body.descricao;
                row.complemento = req.body.complemento;
                found = true
                await row.save();
            }

        })
        if(!found){
            res.status(400).send('Something broke!');
        }else{
            res.sendStatus(200);
        }
    }catch{
        res.status(400).send('Something broke!');
    }
})

app.post('/excluir',verifyToken,async function(req,res){
    try{
        let doc = await getDoc();
        let sheet = doc.sheetsById[0];
        let rows = await sheet.getRows();
        let found = false;
        let data = [];
        rows.map(async (row) => {
            if (row.rowNumber === req.body.id){
                found = true
                await row.delete();
            }
        })
        console.log(found)
        if(!found){
            res.status(400).send('Something broke!');
        }else{
            res.sendStatus(200);
        }
    }catch{
        res.status(400).send('Something broke!');
    }
})

app.post('/login',(req,res)=>{
    if (req.body.senha == 'B8p38&'){
        res.json({token: 'qZMeN^%Kkx4#L2V5I4QvFlCFA'});
    }else{
        res.sendStatus(401);
    }
})


//inicia o servidor WEB. Deve ser a ultima linha do código
app.listen(port, function(req,res){
	console.log(`Servidor rodando`);
})

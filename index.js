const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "primeiraapidegamesjwt"; //senha para o token

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function auth(req, res, next){   //middleware = algo que fique no meio de alguma requisição e resposta, porém é executado antes
    const authToken = req.headers['authorization'];

    if(authToken != undefined){

        const bearer = authToken.split(' '); // dividir minha resposta do token em array com duas strings
        var token = bearer[1];

        jwt.verify(token,JWTSecret,(err, data) => { //função para saber se o token é válido ou não
            if(err){
                res.status(401);
                res.json({err:"Token inválido!"});
            }else{

                req.token = token;
                req.loggedUser = {id: data.id,email: data.email};
                req.empresa = "Guia do programador";                
                next(); //passar a requisição do middleware para a rota que o usuário quer acessar
            }
        });
    }else{
        res.status(401);
        res.json({err:"Token inválido!"});
    } 
}


var DB = {                 //banco de dados falso
    games: [
        {
            id: 23,
            title: "Call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users: [
        {
            id: 1,
            name: "Victor Lima",
            email: "victordevtb@guiadoprogramador.com",
            password: "nodejs<3"
        },
        {
            id: 20,
            name: "Guilherme",
            email: "guigg@gmail.com",
            password: "java123"
        }
    ]
}

app.get("/games", auth, (req, res) => {  // uso de verbo e nomenclatura de endpoint corretamente 
    res.statusCode = 200;    //pilar da api rest - usar status code
    res.json(DB.games);    //Nessa rota eu listo todos os games 
});

app.get("/game/:id", auth, (req, res) => { //Nessa rota eu listo um jogo específico
    if(isNaN(req.params.id)){ //Essa função verifica se é um número ou não 
        res.sendStatus(400); //auth = erra rota é protegida por autenticação
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

app.post("/game",auth, (req, res) => {  // cadastrando dados na api
    var {title, price, year} = req.body; // falta validação de dados
    DB.games.push({   // push = adicionar dados em um array 
        id: 2323,
        title,
        price,
        year
    });
    res.sendStatus(200);
})

app.delete("/game/:id",auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id); //converter o id para inteiro
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.sendStatus(200);
        }
    }
});

app.put("/game/:id",(req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){

            var {title, price, year} = req.body;

            
            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }
            
            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }
    }

});

app.post("/auth",(req, res) => {

    var {email, password} = req.body;

    if(email != undefined){

        var user = DB.users.find(u => u.email == email); //checar se o email passado é igual ao cadastrado
        if(user != undefined){
            if(user.password == password){ //checar se a senha é igual a senha cadastrada
                jwt.sign({id: user.id, email: user.email},JWTSecret,{expiresIn:'48h'},(err, token) => { //gerando o token, informações essenciais, payload, expiração
                    if(err){   //função assíncrona, trabalha com callbacks
                        res.status(400);
                        res.json({err:"Falha interna"});
                    }else{
                        res.status(200);
                        res.json({token: token});
                    }
                })
            }else{
                res.status(401);
                res.json({err: "Credenciais inválidas!"});
            }
        }else{
            res.status(404);
            res.json({err: "O E-mail enviado não existe na base de dados!"});
        }

    }else{
        res.status(400);
        res.send({err: "O E-mail enviado é inválido"});
    }
});

app.listen(45678,() => {
    console.log("API RODANDO!");
});
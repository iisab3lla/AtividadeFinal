import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express()

app.use(cors())
app.use(express.json())


let users = [];
let nextUser = 1;

let messages = [];
let idMessage = 1;

app.post('/', (request, response)=>{
    response.status(200).json({Mensagem: 'Bem vindo à aplicação!'});
});

app.post('/signup',async (request, response)=>{
    const data = request.body;

    const name = data.name;
    const email = data.email;
    const password = data.password;

    if(!name){
        response.status(400).json({Mensagem: 'Por favor, verifique se passou o nome.'});
        return;
    }
    if(!email){
        response.status(400).json({Mensagem: 'Por favor, verifique se passou o email.'});
        return;
    }
    if(!password){
        response.status(400).json({Mensagem: 'Por favor, verifique se passou a senha.'});
        return;
    }

    const verificarEmail = users.find(usuario => usuario.email === email);

    if(verificarEmail){
        response.status(400).json({Mensagem: 'Email já cadastrado, insira outro.'});
        return;
    }

    const senhaCriptografada = await bcrypt.hash(password,10);

    let newUser = {
        id: nextUser,
        name: data.name,
        email: data.email,
        password: senhaCriptografada
    }

    users.push(newUser);
    nextUser++;

    response.status(201).json({Mensagem: `Seja bem vindo ${name} ! Pessoa usuária registrada com sucesso!`})
});


app.get('/login',async(request, response) =>{

    const dados = request.body;

    const email = dados.email;
    const password = dados.password;

    if(!email){
        response.status(404).json({Mensagem:"Insira um e-mail válido"});
        return;
    }
    if(!password){
        response.status(404).json({Mensagem:"Insira uma senha válida"});
        return;
    }

    const verificarEmailLogin = users.find((usuario) => usuario.email === email);

    if(!verificarEmailLogin){
        response.status(404).json({Mensagem:"Email não encontrado no sistema,verifique ou crie uma conta"});
        return;
    }

    const senhaCompativel = await bcrypt.compare(password, verificarEmailLogin.password);

    if(!senhaCompativel){
        response.status(404).json({Mensagem: "Senha não encontrada em nosso banco de dados. Credencial inválida"});
        return;
    }

    response.status(200).json({Mensagem: `Seja bem vindo ${verificarEmailLogin.name}! Pessoa usuária logada com sucesso!`})
});

app.post('/message',(request, response)=>{

    const dados = request.body;

    const email = request.query.email;
    const title = dados.title;
    const description = dados.description;

    const verificarEmailMessage = users.find(usuario => usuario.email === email);

    if(!verificarEmailMessage){
        response.status(400).json({Mensagem: `Email não encontrado, verifique ou crie uma conta.`});
        return;
    }
    if(!title){
        response.status(400).json({Mensagem: `Insira um título válido!`});
        return;
    }
    if(!description){
        response.status(400).json({Mensagem: `Insira uma descrição válida!`});
        return;
    }

    let newMessage = {
        id: idMessage,
        email: email,
        title: title,
        description: description
    }

    messages.push(newMessage)
    idMessage++;

    response.status(201).json({Mensagem:`Mensagem criada com sucesso! Título: ${title}`});
});

app.get('/message/:email', (request, response)=>{

    const email = request.params.email;

    const verificarEmailMessage = users.find(usuario => usuario.email === email);

    if(!verificarEmailMessage){
        response.status(400).json({Mensagem: `Email não encontrado, verifique ou crie uma conta.`});
        return;
    }

    const verificar = messages.find(mensagem => mensagem.email === email);

    if(!verificar){
        response.status(404).json({Mensagem:`Nenhum recado cadastrado neste email!`});
        return;
    }

    const verificar2 = messages.filter(mensagens => mensagens.email === email);

    const information = verificar2.map((mensagens) => `ID: ${mensagens.id} | Título: ${mensagens.title} | Descrição: ${mensagens.description}`);

    response.status(200).json({Mensagem:`Seja Bem-vindo!`, data: information});
    
});

app.put('/message/:id', (request, response)=>{

    const dados = request.body;

    const id = Number(request.params.id);
    const title = dados.title;
    const description = dados.description;

    if(!id){
        response.status(400).json({Mensagem:`Insira um ID válido!`});
        return;
    }

    const verificarId = messages.findIndex(mensagem => mensagem.id === id);

    if(verificarId === -1){
        response.status(400).json({Mensagem:`Por favor, informe um id válido da mensagem`});
        return;
    }
    if(!title){
        response.status(400).json({Mensagem:`Insira um título válido!`});
        return;
    }
    if(!description){
        response.status(400).json({Mensagem:`Insira uma descrição válida!`});
        return;
    }
    if(verificarId !== -1){
        const mensagens = messages[verificarId]
        mensagens.title = title;
        mensagens.description = description;
    }

    response.status(200).json({Mensagem:`Mensagem atualizada com sucesso! Título: ${title} | Descrição: ${description}`});
});

app.delete('/message/:id', (request, response)=>{

    const id = Number(request.params.id);

    if(!id){
        response.status(400).json({Mensagem:`Por favor, informe um id válido da mensagem.`});
        return;
    }

    const verificarId = messages.findIndex(mensagem => mensagem.id === id);

    if(verificarId === -1){
        response.status(400).json({Mensagem:`Mensagem não encontrada, verifique o identificador em nosso banco.`});
        return;
    }else{
        messages.splice(verificarId,1);
        response.status(200).json({Mensagem:`Mensagem apagada com sucesso.`});
    }
    
});

app.listen(3333,()=>console.log("Servidor iniciado na porta 3333"))
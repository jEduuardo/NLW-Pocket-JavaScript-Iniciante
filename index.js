// Constante de importação das funções select, input e checkbox da biblioteca @inquirer/prompts.
const  { select, input, checkbox } = require('@inquirer/prompts')

// Importar módulo de sistema de arquivos para permissão de operações assíncronas (async, await).
const fs = require("fs").promises

// Mensagem de início.
let mensagem = "Bem-vindo ao app de metas";

// Variável das metas
let metas


// Função para buscar metas ja existentes no arquivo .json .
const carregarMetas = async () => {
  try {
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }
  catch(erro) {
    metas = []
  }
}

// Função para salvar metas criadas no arquivo .json .
const salvarMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
} 

// Função para cadastrar metas.
const cadastrarMeta = async () => {
  const meta = await input({message: "Digite a meta:"})

  // Resposta caso não digite nada.
  if(meta.length == 0) {
      mensagem = "A meta não pode ser vazia."
      return // cadastrarMeta()
  } 

  metas.push({ value: meta, checked: false})

  // Resposta se a meta for registrada.  
  mensagem = "Meta cadastrada com sucesso!"
}

//Função apra listar metas, pode marcar e desmarcar a meta usando a tecla Space.
const listarMetas = async () => {

  // Resposta caso não tenha nenhuma meta criada.
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }
  // Instrução de navegação.
  const respostas = await checkbox({
    message: "Use as setas para mudar de meta, o Space para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...metas],
    instructions: false,
  })

  // Função para salvar quando não estiver marcada, na criação ou depois de alguma edição.
  metas.forEach((m) => {
    m.checked = false
  })

  // Mensagem resposta caso conclua a ação sem selecionar alguma meta.
  if(respostas.length == 0){
      mensagem = "Nenhuma meta selecionada!"
      return
  }

  // Função para marcar e função.
  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta
    })

    meta.checked = true
  })
  // Mensagem caso alguma meta seja marcada.
  mensagem = "Meta(s) marcada(s) como concluída(s)."
}

// Função para mostrar as metas concluídas, checked = true .
const metasRealizadas = async  () => {

  // Mensagem caso nenhuma meta tenha sido criada.
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }

  // Função para retornar apenas metas marcadas como concluídas.
  const realizadas = metas.filter((meta) => {
    return meta.checked
  })

  // Mensagem caso exista metas mas nenhuma delas foi marcado como concluída.
  if(realizadas.length == 0) {
    mensagem = "Não existem metas realizadas"
    return
  }

  // Mensagem que mostrar a "Metas realizadas" mais a quantidade de metas concluídas.
  await select ({
    message: "Metas realizadas: " + realizadas.length,
    choices: [...realizadas]
  })

}

// Função para mostrar as metas não concluídas, checked = false .
const metasAbertas = async () => {

  // Mensagem caso nenhuma meta tenha sido criada.
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }
  // Função para retornar apenas metas que ainda não foram concluídas.
  const abertas = metas.filter((meta) => {
    return meta.checked != true
  })

  // Mensagem caso exista metas mas todas elas foram marcadas como concluída. 
  if(abertas.length == 0) {
    mensagem = "Nâo existem metas abertas!"
    return
  }

  // Mensagem que mostrar a "Metas abertas" mais a quantidade de metas ainda não concluídas.  
  await select({
    message: "Metas abertas: " + abertas.length,
    choices: [...abertas]
  })

}

// Função para apagar metas.
const deletarMetas = async () => {

  // Mensagem caso nenhuma meta tenha sido criada.
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }

  // Função para trazer todas as metas desmarcadas.
  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false}
  })
  // Mensagem de intrução.
  const itensADeletar = await checkbox({
    message: "Selecione item para deletar",
    choices: [...metasDesmarcadas],
    instructions: false,
  })

  // Mensagem caso não tenha nenhuma meta.
  if(itensADeletar.length == 0) {
    mensagem = "Nenhum item para deletar!"
    return
  }

  // Função para deletar os itens.
  itensADeletar.forEach((item) => {
    metas = metas.filter((meta) => {
        return meta.value != item    })
  })

  // Mensagem quando alguma meta for deletada.
  mensagem = "Meta(s) deletada(s) com sucesso!"

}

// Limpa o registro de ações executadas.
const mostrarMensagem = () => {
  console.clear();

  if(mensagem != ""){
    console.log(mensagem)
    console.log("")
    mensagem = ""
  }
}

// Abas do programa
const start = async () => {
  
  await carregarMetas()

  while(true) {

    mostrarMensagem()
    await salvarMetas()
    
    const opcao = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar meta",
          value: "cadastrar"
        },
        {
          name: "Listar metas",
          value: "listar"
        },
        {
          name: "Metas realizadas",
          value: "realizadas"
        },
        {
          name: "Metas abertas",
          value: "abertas"
        },
        {
          name: "Deletar metas",
          value: "deletar"
        },
        {
          name: "Sair",
          value: "sair"
        }
      ]
    })

    // Switch para as funções criadas acima.
    switch(opcao) {
      case "cadastrar":
        await cadastrarMeta()
        break
      case "listar":
        await listarMetas()
        break
      case "realizadas":
        await metasRealizadas()
        break
      case "abertas":
        await metasAbertas()
        break
      case "deletar":
        await deletarMetas()
        break
      case "sair":
        console.log("Até a próxima")
        return
    }
  }
}

// Função do programa.
start()
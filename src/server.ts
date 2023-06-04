import { app } from "./app";
import { env } from "./env";

app.listen({
  port: env.PORT,
})
.then(() => {
  console.log('HTTP Server running');
  console.log(process.env.NODE_ENV)
})


app.get('/', (request, response) => {
  response.send({
    develop: "Bruno Matheus Pereira Silva",
    routes: [
      {
        path: "/",
        do: "Informa as rotas da aplicação",
        method: "GET"
      },
      {
        path: "/users",
        do: "Rotas de usuários",
        methods: [
          {
            method: "GET",
            do: "Lista todos os usuários (username, email)"
          },
          {
            method: "POST",
            do: "Cria um usuário e inicia sua sessão",
            body: {
              username: "exemplo",
              email: "exemplo@exemplo.com",
              password: "exemplo123"
            }
          }
        ]
      },
      {
        path: "users/:id",
        methods: [
          {
            method: "GET",
            do: "Visualizar dados do usuário com a sessão iniciada"
          },
          {
            method: "DELETE",
            do: "Deleta o usuário que está com a sessão iniciada"
          }
        ]
      },
      {
        path: "/users/login",
        do: "Iniciar sessão de um usuário",
        method: "patch",
        body: {
          username: "exemplo",
          password: "exemplo123"
        }
      },
      {
        path: "/:username/meals",
        do: "Rotas de refeições para um usuário específico",
        methods: [
          {
            method: "GET",
            do: "Lista as refeições do usuário logado"
          },
          {
            method: "POST",
            do: "Cria uma refeição para o usuário logado",
            body: {
              "name": "example",
              "describe": "example",
              "is_diet": "true | false"
            }
          }
        ]
      },
      {
        path: "/:username/meals/:id",
        do: "Rotas de refeições para um usuário específico",
        methods: [
          {
            method: "GET",
            do: "Visualizar uma refeição específica"
          },
          {
            method: "DELETE",
            do: "Deletar uma refeição específica"
          },
          {
            method: "PUT",
            do: "Modifica uma refeição",
            body: {
              "name": "example",
              "describe": "example",
              "is_diet": "true | false"
            }
          }
        ]
      },
      {
        path: "/:username:meals/summary",
        do: "resumo da dieta do usuário logado"
      }
    ]
  })
})

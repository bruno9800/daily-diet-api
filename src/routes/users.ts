import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "../database";
import { setPasswordHash, verifyPasswordHash } from "../utils/password-hash-functions";
import { checkSessionId } from "../middlewares/check-session-id";

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      username: z.string(),
      email: z.string(),
      password: z.string(),
    })
    const _body = createUserBodySchema.safeParse(request.body);

    if(!_body.success) {
      response.status(400).send({
        error: "Bad Resquest, send the data correctly",
        expected: {
          "username": "example",
          "email": "example@example.com",
          "password": "example123"
        },
        message: `${_body.error}`
      })
    }else {
      const body = _body.data;
      
      const {email, username, password} = body;

      let sessionId = randomUUID();
      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 dia
      })
      response.setCookie('_dailyDiet_username', username, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 dia
      })
      
      const [ user ] = await knex('users').insert({
        id: randomUUID(),
        email,
        username,
        password_hash: await setPasswordHash(password),
        session_id: sessionId,
      }).returning(['id', 'email', 'username']);

      return response.status(201).send({
        user
      })
    }
  })


  app.get('/', async () => {
    const users = await knex('users').select('id','email', 'username');

    return {
      users
    }
  })

  app.get('/:id',{
    preHandler: [checkSessionId]
  }, async (request, response) => {
    const getUserSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getUserSchema.parse(request.params);

    const user = await knex('users').where({ id }).first();

    if(!user) {
      return response.status(404).send({error: "User not exists"});
    }

    const {password_hash, ..._user} = user;

    return {
      user: _user
    }

  })

  app.patch('/login', async (request, response) => {
    const loginBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const {password, username} = loginBodySchema.parse(request.body);
    const user = await knex('users').where({ username }).first();
    if(!user) {
      return response.status(401).send({message: "username not exists"});
    }

    const sucess = await verifyPasswordHash(password, user.password_hash);

    if(!sucess) {
      return response.status(401).send({message: "invalid password"});
    }

    const sessionId = randomUUID();
    response.cookie('sessionId', sessionId, {
      path:'/',
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 dia
    })
    response.setCookie('_dailyDiet_username', username, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 dia
    })

    await knex('users').where('id', user.id).update({
      session_id: sessionId,
    })
    response.status(200).send({message: `logged in. Welcome ${user.username}`});
  })


  app.delete('/:id',{
    preHandler: [checkSessionId],
  }, async (request, response) => {
    const deleteUserParamsSchema = z.object({
      id: z.string().uuid()
    })

    try {
      const { id } = deleteUserParamsSchema.parse(request.params);

      const success = await knex('users').where({ 
        id,
        session_id: request.cookies.sessionId
      }).delete();

      if(!success)
        return response.status(401).send({message: 'Unauthorized'})

      return response.status(202).send();
      
    }catch(err) {
      return response.status(400).send({message: 'Invalid paramater'})
    }
  })
}
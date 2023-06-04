import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function checkMealsParameterUsername(
  request: FastifyRequest,
  response: FastifyReply
) {
  const routeMealsParams = z.object({
    username: z.string(),
  })
  
  const usernameCookie = request.cookies._dailyDiet_username;
  const session_id = request.cookies.sessionId;
  
  try {
    const { username } = routeMealsParams.parse(request.params);

    if( username !== usernameCookie) {
      return response.status(401).send({error: "Unauthorized", message: "Invalid username"})
    }

  }catch( err ) {
    return response.status(400).send({
      message: "Invalid params",
      error: err,
    })
  }
  const user = await knex('users').where({ session_id }).first(); 

  if(!user) {
    return response.status(401).send({
      error: "Unauthorized",
      message: "Invalid session"
    })
  }

  if(usernameCookie !== user.username) {
    return response.status(401).send({
      error: "Unauthorized",
      message: "Invalid session. Session username does not match the given username "
    })
  }
}
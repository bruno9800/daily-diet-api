import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionId(
  request: FastifyRequest,
  response: FastifyReply
) {
  const sessionId = request.cookies.sessionId;
  const username = request.cookies._dailyDiet_username;
    if(!sessionId || !username) {
      return response.status(401).send({
        error: 'Unauthorized',
        message: "invalid Cookies"
      })
  }
}
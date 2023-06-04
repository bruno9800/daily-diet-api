import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export async function getUserId(
  request: FastifyRequest,
  response: FastifyReply
) {
  const session_id = request.cookies.sessionId;

  const user = await knex('users').where({ session_id }).first();

  request.id = user?.id;
}
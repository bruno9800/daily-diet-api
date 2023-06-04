import { FastifyInstance } from "fastify";
import { checkMealsParameterUsername } from "../middlewares/check-meals-username-parameter";
import { checkSessionId } from "../middlewares/check-session-id";
import { z } from "zod";
import { knex } from "../database";
import { getUserId } from "../middlewares/get-userId";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionId);
  app.addHook('preHandler', checkMealsParameterUsername);
  app.addHook('preHandler', getUserId);

  app.get('/summary', async (request) => {
    const user_id = request.id;

    const [{ total }] = await knex('meals').where({user_id}).count('id', {as: 'total'});
    const [{ diet }] = await knex('meals').where({user_id, is_diet:true}).count('id', {as: 'diet'});

    const summary = {
      total: Number(total),
      diet: Number(diet),
      noDiet: Number(total) - Number(diet)
    }
    return {
      summary
    }

  })

  app.get('/', async (request) => {
    const id = request.id;
    const meals = await knex('meals').where({user_id: id});
    return {
      meals
    }
  })

  app.get('/diet', async (request) => {
    const id = request.id;
    const meals = await knex('meals').where({user_id: id, is_diet: true});
    return {
      meals
    }
  })

  app.get('/no-diet', async (request) => {
    const id = request.id;
    const meals = await knex('meals').where({user_id: id, is_diet: false});
    return {
      meals
    }
  })

  app.post('/', async (request, response) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      describe: z.string().nullable(),
      is_diet: z.boolean()
    })
    const { describe, is_diet, name } = createMealsBodySchema.parse(request.body);
    const user_id = request.id;

    const [meal] = await knex('meals').insert({
      id: randomUUID(),
      user_id,
      name,
      describe: describe ?? '',
      is_diet
    }).returning('*');

    return response.status(201).send()
  })

  app.get('/:id', async (request, response) => {
    const deleteMealParams = z.object({
      id: z.string().uuid(),
    })
    try {
      const { id } = deleteMealParams.parse(request.params);
      
      const meal = await knex('meals').where({ id }).first();

      if(!meal) {
        return response.status(404).send({
          message: "Meal not found"
        })
      }

      return response.status(200).send(meal);

    }catch(err) {
      return response.status(400).send({
        message: "Invalid params",
        error: err
      })
    }
  })

  app.put('/:id', async (request, response) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const updateMealBodySchema = z.object({
      name: z.string(),
      describe: z.string(),
      is_diet: z.boolean(),
    })

    const _body = updateMealBodySchema.safeParse(request.body);
    if(!_body.success){
      return response.status(400).send({
        message: "invalid Body Schema",
        err: _body.error
      })
    }
    const body  = _body.data;

    try {
      const { id } = updateMealParamsSchema.parse(request.params);
      
      const meal = await knex('meals').where({ id }).update({
        describe: body.describe,
        name: body.name,
        is_diet: body.is_diet
      });

      if(!meal) {
        return response.status(404).send({
          message: "Meal not found"
        })
      }


      return response.status(200).send(meal);

    }catch(err) {
      return response.status(400).send({
        message: "Invalid params",
        error: err
      })
    }
  })

  app.delete('/:id', async (request, response) => {
    const deleteMealParams = z.object({
      id: z.string().uuid(),
    })
    try {
      const { id } = deleteMealParams.parse(request.params);
      
      const deleteMealResponse = await knex('meals').where({ id }).delete();

      if(!deleteMealResponse) {
        return response.status(404).send({
          message: "Meal not found"
        })
      }

      return response.status(202).send();

    }catch(err) {
      return response.status(400).send({
        message: "Invalid params",
        error: err
      })
    }
  })

  //and instance
}
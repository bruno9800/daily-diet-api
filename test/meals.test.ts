import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import supertest from 'supertest';

async function createUserAndGetCookies(username: string, password: string) {
  const userResponse = await supertest(app.server)
      .post('/users')
      .send({
        username: username,
        email: "test@example.com",
        password: password
      })
  return userResponse.get('Set-Cookie');
}

async function LoggedInUserAndGetCookies(username: string, password: string) {
  const LoggedInResponse = await supertest(app.server)
      .patch('/users/login')
      .send({
        username: username,
        password: password
      })

  return LoggedInResponse.get('Set-Cookie');
}


describe("Meals Route", () => {

  beforeAll(async () => {
    await app.ready();
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  })
    
  afterAll(async () => {
    await app.close();
  })

  it("should be able to create meal in session user", async() => {
      await createUserAndGetCookies("test-user1", "test321");
      const cookie = await createUserAndGetCookies("test-user2", "test123");
      await supertest(app.server)
        .post('/test-user2/meals')
        .set('Cookie', cookie)
        .send({
          name: "meal-1",
          describe: "meal",
          is_diet: true
        })
        .expect(201);

      await supertest(app.server)
        .post('/test-user1/meals')
        .set('Cookie', cookie)
        .send({
          name: "meal-2",
          describe: "meal",
          is_diet: true
        })
        .expect(401);

      const newCookie = await LoggedInUserAndGetCookies("test-user1", "test321");

      await supertest(app.server)
      .post('/test-user1/meals')
      .set('Cookie', newCookie)
      .send({
        name: "meal-2",
        describe: "meal",
        is_diet: true
      })
      .expect(201);
  })

  it("should be able to list all your meals", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");
    await supertest(app.server)
        .post('/test-user/meals')
        .set('Cookie', cookie)
        .send({
          name: "meal-1",
          describe: "meal",
          is_diet: true
        })
        .expect(201);

    const getAllMealsReply = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200);

    expect(getAllMealsReply.body.meals).toEqual([
      expect.objectContaining({
        name: "meal-1",
        describe: "meal"
      })
    ])
    
  })

  it("should be able to get a specific meal", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getMealsResponse = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200)
    
    const [{ id }] = getMealsResponse.body.meals;

    const getSpecificMeal = await supertest(app.server)
      .get(`/test-user/meals/${id}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getSpecificMeal.body).toEqual(
      expect.objectContaining({
        name: "meal-1",
        describe: "meal",
        is_diet: 1
      })
    )
  })

  it("should not be able to get a specific meal from another user", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getMealsResponse = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200)
    
    const [{ id }] = getMealsResponse.body.meals;

    // nova sessão iniciada
    const newCookie = await createUserAndGetCookies("test-user2", "test321");

    await supertest(app.server)
      .get(`/test-user/meals/${id}`)
      .set('Cookie', newCookie)
      .expect(401)
  })

  it("should be able to delete a specific meal", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getMealsResponse = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200)
    
    const [{ id }] = getMealsResponse.body.meals;

    await supertest(app.server)
      .del(`/test-user/meals/${id}`)
      .set('Cookie', cookie)
      .expect(202)

    const getAllMeals = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200)

    expect(getAllMeals.body.meals).not.toEqual([
      expect.objectContaining({
        name: "meal-1",
        describe: "meal"
      })
    ])
  })

  it("should not be able to delete a specific meal from another user", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getMealsResponse = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie', cookie)
      .expect(200)
    
    const [{ id }] = getMealsResponse.body.meals;

    // nova sessão iniciada
    const newCookie = await createUserAndGetCookies("test-user2", "test321");

    await supertest(app.server)
      .del(`/test-user/meals/${id}`)
      .set('Cookie', newCookie)
      .expect(401)
  })

  it("should be able to update a specific meal", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");
    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getMealsResponse = await supertest(app.server)
      .get('/test-user/meals')
      .set('Cookie',cookie)
      .expect(200);
    
      const [oldMealData] = getMealsResponse.body.meals;

    await supertest(app.server)
      .put(`/test-user/meals/${oldMealData.id}`)
      .set('Cookie', cookie)
      .send({
        name: "meal-updated",
        describe: "update-test",
        is_diet: false,
      })
      .expect(200);

      const getSpecificMealResponse = await supertest(app.server)
      .get(`/test-user/meals/${oldMealData.id}`)
      .set('Cookie', cookie)
      .expect(200)

      const updateMealData = getSpecificMealResponse.body

      expect(updateMealData).toEqual(
        expect.objectContaining({
          name: "meal-updated",
          describe: "update-test",
          is_diet: 0,
          user_id: oldMealData.user_id,
          created_at: oldMealData.created_at,
          id: oldMealData.id
        })
      )

  })

  it("should a be able to get a summary of your diet", async () => {
    const cookie = await createUserAndGetCookies("test-user", "test123");
    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-1",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-2",
      describe: "meal",
      is_diet: false
    })
    .expect(201);

    await supertest(app.server)
    .post('/test-user/meals')
    .set('Cookie', cookie)
    .send({
      name: "meal-3",
      describe: "meal",
      is_diet: true
    })
    .expect(201);

    const getSummaryResponse = await supertest(app.server)
      .get('/test-user/meals/summary')
      .set('Cookie', cookie)
      .expect(200)

    const body = getSummaryResponse.body.summary

    expect(body).toEqual(
      expect.objectContaining({
        total: 3,
        diet: 2,
        noDiet: 1,
      })
    )

  })


  // end describe;
})
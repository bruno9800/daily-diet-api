import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { app } from '../src/app';
import { execSync } from 'node:child_process';
import supertest from 'supertest';

describe('User routes', () => {

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



  it("should be able to create new user", async () => {
    await supertest(app.server)
      .post('/users')
      .send({
          username: "test-user",
          email: "test@example.com",
          password: "test123"
      })
      .expect(201);
  })

  it("should be able to list all users", async () => {
    await supertest(app.server)
      .post('/users')
      .send({
          username: "test-user",
          email: "test@example.com",
          password: "test123"
      })
      .expect(201);

    const listAllUserReply = await supertest(app.server)
      .get('/users')
      .expect(200);
    
      expect(listAllUserReply.body.users).toEqual([
        expect.objectContaining({
          username: "test-user",
          email: "test@example.com"
        })
      ])
      
  })

  it("should be able to get a specific user", async () => {
    const createUserReply = await supertest(app.server)
      .post('/users')
      .send({
          username: "test-user",
          email: "test@example.com",
          password: "test123"
      })
      .expect(201);

      const { id } = createUserReply.body.user;
      //console.log(id);

      const cookies = createUserReply.get('Set-Cookie');
      //console.log(cookies);

      const getUserReply = await supertest(app.server)
        .get(`/users/${id}`)
        .set('Cookie',cookies)
        .expect(200)

        expect(getUserReply.body.user).toEqual(
          expect.objectContaining({
            username: 'test-user',
            email: 'test@example.com'
          })
        )
     

    
  })
  
  it('should be able to start a new session', async () => {
    await supertest(app.server)
    .post('/users')
    .send({
        username: "test-user",
        email: "test@example.com",
        password: "test123"
    })
    .expect(201);

    const createAnotherUserReply = await supertest(app.server)
    .post('/users')
    .send({
        username: "test-user2",
        email: "test2@example.com",
        password: "test321"
    })
    .expect(201);

    const loginResponse = await supertest(app.server)
      .patch('/users/login')
      .send({
        username: "test-user",
        password: "test123"
      })
      .expect(200)

      const cookiesBeforeLogin = createAnotherUserReply.get('Set-Cookie');
      const cookiesAfterLogin = loginResponse.get('Set-Cookie');

      expect(cookiesBeforeLogin).not.toEqual(cookiesAfterLogin);

  })

  // describe end
})

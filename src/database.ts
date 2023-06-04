import setupKnex, {Knex} from 'knex'
import { env } from './env'

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: 
    env.DATABASE_CLIENT === 'pg' ? {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  }: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    directory: './db/migrations',
    extension: 'ts'
  }
}

const knex = setupKnex(config);

export { config, knex };

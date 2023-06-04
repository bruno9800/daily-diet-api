import { config } from "dotenv";
import { z } from "zod";


if(process.env.NODE_ENV === 'test'){
  config({
    path: '.env.test',
  })
}else {
  config();
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_CLIENT: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_PORT: z.coerce.number(),
  SALT: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
})

const _env = envSchema.safeParse(process.env);

if(!_env.success) {
  console.error('Invalid environment variables!', _env.error.format());

  throw new Error("Invalid environment variables");
}

export const env = _env.data;
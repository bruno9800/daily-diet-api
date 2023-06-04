import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      username: string;
      email: string;
      password_hash: string;
      created_at: string;
      update_at: string;
      session_id?: string;
    }
    meals: {
      id: string;
      user_id: string;
      name: string;
      describe?: string;
      is_diet: boolean;
      created_at: string;
    }
  }
}
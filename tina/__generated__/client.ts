import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: '/app/tina/__generated__/.cache/1789031693747', url: 'http://localhost:4001/graphql', token: '', queries,  });
export default client;
  
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: '/workspace/tina/__generated__/.cache/1789026852628', url: 'http://localhost:4001/graphql', token: 'null', queries,  });
export default client;
  
import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '4cd1810eff88c89d8486cc6cc8e62098b304ac91', queries,  });
export default client;
  
import { Client, Databases, TablesDB } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setDevKey(process.env.APPWRITE_API_KEY!);

export const serverDatabases = new Databases(client);
export const serverTablesDB = new TablesDB(client);

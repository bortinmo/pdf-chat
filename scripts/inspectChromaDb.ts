import { ChromaClient } from 'chromadb';
import 'dotenv/config';

const client = new ChromaClient({ path: process.env.CHROMA_URL });

async function checkConnection() {
  try {
    const heartbeat = await client.heartbeat();
    console.log("Successfully connected to ChromaDB server in Docker!", heartbeat);

    const collections = await client.listCollections();
    console.log("Available collections:", collections);

    const collection = await client.getCollection({ name: "marketing-ops" });
    console.log("Collection:", collection);
    const count = await collection.count()
    console.log("Count:", count);

    const peeked = await collection.peek({limit: 2})
    console.log("Peeked:", peeked);

    // await client.deleteCollection({ name: "marketing-ops" });


  } catch (error) {
    console.error("Failed to connect or interact with ChromaDB server:", error);
    console.log("Ensure the ChromaDB container is running and port 8000 is mapped correctly.");
  }
}

checkConnection();
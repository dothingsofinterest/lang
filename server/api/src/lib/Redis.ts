import { createClient } from "redis";

class RedisClient {
    private client;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
            socket: {
                connectTimeout: 5000, // 连接超时时间
                timeout: 5000, // 操作超时时间
            },
        });

        this.client.on("error", (err) => {
            if (this.client.isOpen && !this.client.isReady) this.client.disconnect();
            throw new Error(err.message);
        });
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    async disconnect() {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }

    async set(key: string, value: string, expirySeconds?: number): Promise<void> {
        await this.connect();
        if (expirySeconds) {
            await this.client.setEx(key, expirySeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        await this.connect();
        return this.client.get(key);
    }

    async del(key: string): Promise<number> {
        await this.connect();
        return this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        await this.connect();
        const result = await this.client.exists(key);
        return result === 1;
    }
}

const redisClient = new RedisClient();

export default redisClient;

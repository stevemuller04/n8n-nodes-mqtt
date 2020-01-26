import {
	connect,
	MqttClient,
	IClientOptions,
	ISubscriptionGrant,
	OnMessageCallback
} from 'mqtt'; 

export class AsyncMqttClient {
	static async connect(brokerUrl?: string | any, opts?: IClientOptions): Promise<AsyncMqttClient> {
		return new Promise((resolve, reject) => {
			const client: MqttClient = connect(brokerUrl, opts);
			const onConnect = () => {
				client.removeListener("connect", onConnect);
				client.removeListener("error", onError);
				resolve(new AsyncMqttClient(client));
			};
			const onError = (err: string) => {
				client.removeListener("connect", onConnect);
				client.removeListener("error", onError);
				client.end();
				reject(err);
			};
			client.on("connect", onConnect);
			client.on("error", onError);
		});
	}

	constructor(private syncMqttClient: MqttClient) {
	}

	subscribe(topic: string | string[]): Promise<ISubscriptionGrant[]> {
		return new Promise((resolve, reject) => {
			this.syncMqttClient.subscribe(topic, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			});
		});
	}

	publish (topic: string, message: string | Buffer): Promise<void> {
		return new Promise((resolve, _reject) => {
			this.syncMqttClient.publish(topic, message, () => resolve());
		});
	}

	end(force?: boolean): Promise<void> {
		return new Promise((resolve, _reject) => {
			this.syncMqttClient.end(force, () => resolve());
		});
	}
	
	onMessage(callback: OnMessageCallback): void {
		this.syncMqttClient.on("message", callback);
	}
}
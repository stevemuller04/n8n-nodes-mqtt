import { ITriggerFunctions } from 'n8n-core';
import {
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';
import { AsyncMqttClient } from '../util/AsyncMqttClient';

export class MqttTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MQTT Trigger',
		name: 'mqttTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Node is triggered when a new MQTT message arrives',
		defaults: {
			name: 'MQTT',
			color: '#CCCCCC',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'mqtt',
				required: true,
			}
		],
		properties: [
			{
				displayName: 'Broker URL',
				name: 'url',
				type: 'string',
				typeOptions: {},
				default: 'mqtt://localhost',
				description: 'The URL of the MQTT broker',
			},
			{
				displayName: 'Client ID',
				name: 'clientId',
				type: 'string',
				typeOptions: {},
				default: 'n8n_' + Math.random().toString(16).substr(2, 8),
				description: 'A unique ID for the MQTT client',
			},
			{
				displayName: 'Topic',
				name: 'topic',
				type: 'string',
				typeOptions: {},
				default: '',
				description: 'The topic which the MQTT client shall subscribe to',
			},
		]
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		// Get parameters
		const configUrl = this.getNodeParameter('url') as string;
		const configClientId = this.getNodeParameter('clientId') as string;
		const configTopic = this.getNodeParameter('topic') as string;
		const credentials = this.getCredentials('mqtt') as ICredentialDataDecryptedObject;

		// Set up client connection
		const client: AsyncMqttClient = await AsyncMqttClient.connect(configUrl, {
			clientId: configClientId,
			username: credentials.username as string,
			password: credentials.password as string,
		});

		// Subscribe to topic
		await client.subscribe(configTopic);

		// Register trigger
		client.onMessage((topic: string, message: Buffer, _packet) => {
			const data = {
				topic,
				value: message.toString()
			};
			this.emit([this.helpers.returnJsonArray(data)]);
		});

		const closeFunction = async () => {
			await client.end();
		};

		return {
			closeFunction
		};
	}
}

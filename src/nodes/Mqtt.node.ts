import { IExecuteFunctions } from 'n8n-core';
import {
	INodeType,
	INodeTypeDescription,
	ICredentialDataDecryptedObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { AsyncMqttClient } from '../util/AsyncMqttClient';

export class Mqtt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MQTT',
		name: 'mqtt',
		group: ['transform'],
		version: 1,
		description: 'Node publishes a MQTT message when triggered',
		defaults: {
			name: 'MQTT',
			color: '#CCCCCC',
		},
		inputs: ['main'],
		outputs: [],
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
				description: 'The topic which the MQTT client shall push to',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {},
				default: '',
				description: 'The message which the MQTT client shall push',
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = this.getCredentials('mqtt') as ICredentialDataDecryptedObject;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			// Get parameters
			const configUrl = this.getNodeParameter('url', itemIndex) as string;
			const configClientId = this.getNodeParameter('clientId', itemIndex) as string;
			const configTopic = this.getNodeParameter('topic', itemIndex) as string;
			const configMessage = this.getNodeParameter('message', itemIndex) as string;

			// Set up client connection
			const client: AsyncMqttClient = await AsyncMqttClient.connect(configUrl, {
				clientId: configClientId,
				username: credentials.username as string,
				password: credentials.password as string,
			});

			// Publish message
			await client.publish(configTopic, configMessage);
			await client.end();
		}

		return this.prepareOutputData(items);
	}
}

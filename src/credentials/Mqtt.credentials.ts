import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class Mqtt implements ICredentialType {
	name = 'mqtt';
	displayName = 'MQTT credentials';
	properties = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}

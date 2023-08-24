export class SecretsManagerClient {
  secrets: Map<string, string>;

  constructor(secretKeys: string[]) {
    this.secrets = new Map<string, string>();
    for (const secretKey of secretKeys) {
      this.secrets.set(secretKey, "");
    }
  }

  async loadSecrets(): Promise<boolean> {
    try {
      console.log(`Loading secrets: ${this.secrets.keys()}`);
      
      const AWS = require('aws-sdk');
      const client = new AWS.SecretsManager();
      for (const secretKey of this.secrets.keys()) {
        const secret = await client.getSecretValue({ SecretId: secretKey }).promise();
        this.secrets.set(secretKey, secret.SecretString);
        console.log(`Loaded secret ${secretKey}, length = ${secret.SecretString.length}`);
      }

      console.log(`Successfully loaded ${this.secrets.size} secret(s) from secrets manager!`);
      return Promise.resolve(true);
    } catch (error) {
      console.error(`Error loading secrets: ${error}`);
      return Promise.reject(error);
    }
  }
}
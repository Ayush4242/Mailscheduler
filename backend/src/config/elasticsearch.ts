import { Client } from '@elastic/elasticsearch';
import { config } from './index.js';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!esClient) {
    esClient = new Client({
      node: config.elasticsearch.node,
      auth: config.elasticsearch.apiKey ? { apiKey: config.elasticsearch.apiKey } : undefined,
    });
  }
  return esClient;
}

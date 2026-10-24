import { getElasticsearchClient } from '../../config/elasticsearch.js';
import { config } from '../../config/index.js';

export interface EmailSearchDocument {
  id: string;
  userId: string;
  recipient: string;
  subject: string;
  status: string;
  scheduledAt: string;
  sentAt?: string | null;
  errorMessage?: string | null;
  campaignId?: string | null;
}

export class SearchService {
  private indexName = config.elasticsearch.index;
  private isIndexInitialized = false;

  private async ensureIndex(): Promise<boolean> {
    if (this.isIndexInitialized) return true;

    try {
      const client = getElasticsearchClient();
      const exists = await client.indices.exists({ index: this.indexName });
      if (!exists) {
        await client.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              id: { type: 'keyword' },
              userId: { type: 'keyword' },
              recipient: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              subject: { type: 'text' },
              status: { type: 'keyword' },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' },
              errorMessage: { type: 'text' },
              campaignId: { type: 'keyword' },
            },
          },
        });
        console.log(`[Elasticsearch] Index '${this.indexName}' created successfully.`);
      }
      this.isIndexInitialized = true;
      return true;
    } catch (err: any) {
      console.warn(`[Elasticsearch Warning] Cannot connect to ES (${err.message}). Search features will fall back gracefully.`);
      return false;
    }
  }

  async indexEmail(doc: EmailSearchDocument): Promise<void> {
    try {
      const ready = await this.ensureIndex();
      if (!ready) return;

      const client = getElasticsearchClient();
      await client.index({
        index: this.indexName,
        id: doc.id,
        document: doc,
      });
    } catch (err: any) {
      console.warn(`[Elasticsearch] Failed to index email ${doc.id}: ${err.message}. PostgreSQL remains authoritative.`);
    }
  }

  async searchEmails(userId: string, query?: string, status?: string): Promise<any[]> {
    try {
      const ready = await this.ensureIndex();
      if (!ready) return [];

      const client = getElasticsearchClient();
      const mustClauses: any[] = [{ term: { userId } }];

      if (status) {
        mustClauses.push({ term: { status } });
      }

      if (query && query.trim()) {
        mustClauses.push({
          multi_match: {
            query: query.trim(),
            fields: ['recipient', 'subject'],
            fuzziness: 'AUTO',
          },
        });
      }

      const res = await client.search({
        index: this.indexName,
        query: {
          bool: {
            must: mustClauses,
          },
        },
        sort: [{ scheduledAt: { order: 'desc' } }],
        size: 50,
      });

      return res.hits.hits.map((hit) => hit._source);
    } catch (err: any) {
      console.warn(`[Elasticsearch Search Fallback] ${err.message}`);
      return [];
    }
  }
}

export const searchService = new SearchService();

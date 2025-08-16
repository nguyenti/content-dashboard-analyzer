import { google } from 'googleapis';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { ContentScript } from '../types';

export class ContentIngestionService {
  private drive: any;
  private docs: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly',
      ],
    });

    this.drive = google.drive({ version: 'v3', auth });
    this.docs = google.docs({ version: 'v1', auth });
  }

  async ingestFromGoogleDoc(docUrl: string): Promise<ContentScript> {
    try {
      // Extract document ID from URL
      const docId = this.extractDocId(docUrl);
      
      // Get document metadata
      const docInfo = await this.drive.files.get({
        fileId: docId,
        fields: 'name,modifiedTime',
      });

      // Get document content
      const docContent = await this.docs.documents.get({
        documentId: docId,
      });

      const content = this.extractTextFromDoc(docContent.data);
      
      return {
        id: `gdoc_${docId}`,
        source: 'google_doc',
        title: docInfo.data.name || 'Untitled Document',
        content,
        url: docUrl,
        uploadedAt: new Date(docInfo.data.modifiedTime || Date.now()),
      };
    } catch (error) {
      console.error('Google Docs ingestion error:', error);
      throw new Error('Failed to ingest content from Google Docs');
    }
  }

  async ingestFromUpload(file: Express.Multer.File): Promise<ContentScript> {
    try {
      const content = await fs.readFile(file.path, 'utf-8');
      
      // Clean up uploaded file
      await fs.unlink(file.path);
      
      return {
        id: `upload_${Date.now()}`,
        source: 'upload',
        title: path.parse(file.originalname).name,
        content,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('File upload ingestion error:', error);
      throw new Error('Failed to ingest uploaded content');
    }
  }

  static getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    });

    return multer({
      storage,
      fileFilter: (req, file, cb) => {
        // Accept text files, markdown, and common document formats
        const allowedTypes = [
          'text/plain',
          'text/markdown',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only text, markdown, and document files are allowed'));
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    });
  }

  async validateGoogleDocAccess(docUrl: string): Promise<boolean> {
    try {
      const docId = this.extractDocId(docUrl);
      await this.drive.files.get({ fileId: docId });
      return true;
    } catch {
      return false;
    }
  }

  async getRecentGoogleDocs(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    modifiedTime: string;
    webViewLink: string;
  }>> {
    try {
      const response = await this.drive.files.list({
        q: "mimeType='application/vnd.google-apps.document'",
        orderBy: 'modifiedTime desc',
        pageSize: limit,
        fields: 'files(id,name,modifiedTime,webViewLink)',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching recent Google Docs:', error);
      return [];
    }
  }

  private extractDocId(url: string): string {
    // Extract document ID from various Google Docs URL formats
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/, // Direct ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new Error('Invalid Google Docs URL format');
  }

  private extractTextFromDoc(doc: any): string {
    let text = '';
    
    if (doc.body && doc.body.content) {
      for (const element of doc.body.content) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements || []) {
            if (textElement.textRun) {
              text += textElement.textRun.content;
            }
          }
        } else if (element.table) {
          // Handle tables
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              for (const cellElement of cell.content || []) {
                if (cellElement.paragraph) {
                  for (const textElement of cellElement.paragraph.elements || []) {
                    if (textElement.textRun) {
                      text += textElement.textRun.content;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return text.trim();
  }

  async syncGoogleDocContent(script: ContentScript): Promise<ContentScript> {
    if (script.source !== 'google_doc' || !script.url) {
      throw new Error('Invalid script for Google Docs sync');
    }

    return await this.ingestFromGoogleDoc(script.url);
  }
}
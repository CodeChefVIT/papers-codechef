import { Storage, type StorageOptions } from "@google-cloud/storage";

interface GCPCredentials {
  type: string;
  project_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

let storage: Storage | null = null;
let bucket: ReturnType<Storage["bucket"]> | null = null;

// Only initialize if environment variables are present
if (
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON &&
  process.env.GOOGLE_CLOUD_PROJECT &&
  process.env.GOOGLE_CLOUD_BUCKET
) {
  const credentials: GCPCredentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ) as GCPCredentials;

  storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    credentials,
  } as StorageOptions);

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET;
  bucket = storage.bucket(bucketName);
}

export async function uploadPDF(folder: string, buffer: Buffer) {
  if (!bucket) {
    throw new Error("Google Cloud Storage is not configured");
  }
  const bucketName = process.env.GOOGLE_CLOUD_BUCKET ?? "";
  const pdfFilename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;
  await bucket.file(pdfFilename).save(buffer, { resumable: false, contentType: "application/pdf" });
  return `https://storage.googleapis.com/${bucketName}/${pdfFilename}`;
}

export async function uploadThumbnail(buffer: Buffer, pdfFilename: string) {
  if (!bucket) {
    throw new Error("Google Cloud Storage is not configured");
  }
  const bucketName = process.env.GOOGLE_CLOUD_BUCKET ?? "";
  const thumbFilename = pdfFilename.replace(".pdf", ".png");
  await bucket.file(thumbFilename).save(buffer, { resumable: false, contentType: "image/png" });
  return `https://storage.googleapis.com/${bucketName}/${thumbFilename}`;
}
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3.config.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export class UploadController {
  // 1. Initialize Multipart Upload
  static startUpload = async (req, res, next) => {
    try {
      const { filename, type, fileType } = req.body;
      if (!filename) {
        throw new ApiError(400, 'Filename is required');
      }

      const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `courses/videos/${Date.now()}-${cleanFilename}`;
      const contentType = fileType || type || 'video/mp4';

      const command = new CreateMultipartUploadCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const response = await s3Client.send(command);

      return res.status(200).json({
        success: true,
        uploadId: response.UploadId,
        key: key,
        message: 'Multipart upload initialized',
        data: {
          uploadId: response.UploadId,
          key: key,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 2. Generate Presigned URLs for Chunks
  static getPresignedUrls = async (req, res, next) => {
    try {
      const { uploadId, key, partNumbers, parts } = req.body;
      if (!uploadId || !key) {
        throw new ApiError(400, 'UploadId and key are required');
      }

      const requestedParts = partNumbers || (Array.isArray(parts) ? parts.map((p) => (typeof p === 'number' ? p : p.number || p.partNumber)) : []);
      if (!requestedParts || requestedParts.length === 0) {
        throw new ApiError(400, 'Part numbers array is required');
      }

      const presignedUrls = {};
      await Promise.all(
        requestedParts.map(async (partNum) => {
          const command = new UploadPartCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
            PartNumber: Number(partNum),
          });

          const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          presignedUrls[partNum] = url;
        })
      );

      return res.status(200).json({
        success: true,
        presignedUrls,
        message: 'Presigned URLs generated',
        data: {
          presignedUrls,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 3. Complete Multipart Upload
  static completeUpload = async (req, res, next) => {
    try {
      const { uploadId, key, parts } = req.body;
      if (!uploadId || !key || !Array.isArray(parts)) {
        throw new ApiError(400, 'UploadId, key, and valid parts array are required');
      }

      const formattedParts = parts
        .map((p) => ({
          PartNumber: Number(p.PartNumber || p.number || p.partNumber),
          ETag: p.ETag || p.etag,
        }))
        .sort((a, b) => a.PartNumber - b.PartNumber);

      const command = new CompleteMultipartUploadCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: formattedParts,
        },
      });

      const response = await s3Client.send(command);

      const fileUrl =
        response.Location ||
        `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      return res.status(200).json({
        success: true,
        location: fileUrl,
        key: key,
        message: 'Multipart upload completed successfully',
        data: {
          location: fileUrl,
          key: key,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 4. Abort Multipart Upload
  static abortUpload = async (req, res, next) => {
    try {
      const { uploadId, key } = req.body;
      if (!uploadId || !key) {
        throw new ApiError(400, 'UploadId and key are required');
      }

      const command = new AbortMultipartUploadCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
      });

      await s3Client.send(command);

      return res.status(200).json(new ApiResponse(200, {}, 'Upload aborted successfully'));
    } catch (error) {
      next(error);
    }
  };
}

import AWS from 'aws-sdk';
import apiClient from './apiService';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_S3_SECRET_KEY,
  region: process.env.REACT_APP_S3_REGION
});

export const uploadFile = async (file) => {
  try {
    // 检查文件大小
    if (file.size > process.env.REACT_APP_FILE_UPLOAD_MAX_SIZE) {
      throw new Error('文件大小超过限制');
    }

    // 生成唯一的文件名
    const fileName = `${Date.now()}-${file.name}`;
    
    // 上传到S3
    const uploadParams = {
      Bucket: process.env.REACT_APP_S3_BUCKET,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    };

    const result = await s3.upload(uploadParams).promise();
    
    // 返回文件URL
    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
};

export const deleteFile = async (fileKey) => {
  try {
    const deleteParams = {
      Bucket: process.env.REACT_APP_S3_BUCKET,
      Key: fileKey
    };

    await s3.deleteObject(deleteParams).promise();
  } catch (error) {
    console.error('文件删除失败:', error);
    throw error;
  }
}; 
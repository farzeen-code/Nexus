import Document from '../models/Document.js';
import path from 'path';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, sharedWith, relatedTo } = req.body;

    const document = await Document.create({
      title: title || req.file.originalname,
      description,
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id,
      sharedWith: sharedWith ? JSON.parse(sharedWith) : [],
      relatedTo
    });

    const populatedDoc = await Document.findById(document._id)
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('sharedWith', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: populatedDoc
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { uploadedBy: req.user.id },
        { sharedWith: req.user.id }
      ]
    })
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('sharedWith', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

export const signDocument = async (req, res) => {
  try {
    const { signatureData } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.signature = {
      signedBy: req.user.id,
      signatureData,
      signedAt: new Date()
    };
    document.status = 'signed';

    await document.save();

    const populatedDoc = await Document.findById(document._id)
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('signature.signedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Document signed successfully',
      data: populatedDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sign document',
      error: error.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};
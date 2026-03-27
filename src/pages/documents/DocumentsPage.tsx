import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import { documentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getUserDocuments();
      setDocuments(response.data.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name);

    try {
      setUploading(true);
      await documentAPI.uploadDocument(formData);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Allow re-selecting the same file again
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      await documentAPI.deleteDocument(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Manage your documents and contracts</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />
        <Button
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No documents yet</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first document to get started</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploaded by {doc.uploadedBy.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-gray-700 mt-2">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
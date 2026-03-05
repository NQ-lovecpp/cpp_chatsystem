/**
 * FilePreviewModal - 文件预览弹窗
 *
 * 根据文件扩展名选择对应的 viewer：
 * - PDF: react-pdf
 * - docx/xlsx/pptx/csv/txt/image: @cyntler/react-doc-viewer
 * - 其他: 仅提供下载
 */

import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Modal, Spin, Button, Typography, message } from 'antd';
import {
    DownloadOutlined,
    ExpandOutlined,
    CompressOutlined,
    LeftOutlined,
    RightOutlined,
    FileUnknownOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const PREVIEWABLE_EXTENSIONS = new Set([
    'pdf',
    'doc', 'docx',
    'xls', 'xlsx',
    'ppt', 'pptx',
    'csv', 'txt',
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg',
]);

function getExtension(fileName) {
    return (fileName || '').split('.').pop().toLowerCase();
}

function isPreviewable(fileName) {
    return PREVIEWABLE_EXTENSIONS.has(getExtension(fileName));
}

const DocViewer = lazy(() => import('@cyntler/react-doc-viewer'));

/**
 * PDF Viewer using react-pdf
 */
function PdfViewer({ fileUrl }) {
    const { Document, Page, pdfjs } = require('react-pdf');
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // Set worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1, overflow: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    loading={<Spin tip="加载 PDF..." />}
                    error={<div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>PDF 加载失败</div>}
                >
                    <Page pageNumber={pageNumber} width={Math.min(window.innerWidth * 0.7, 800)} />
                </Document>
            </div>
            {numPages && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    <Button
                        size="small" icon={<LeftOutlined />}
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(p => p - 1)}
                    />
                    <Text style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                        {pageNumber} / {numPages}
                    </Text>
                    <Button
                        size="small" icon={<RightOutlined />}
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(p => p + 1)}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * Generic doc viewer for office docs
 */
function OfficeViewer({ fileUrl, fileName }) {
    const ext = getExtension(fileName);
    const docs = useMemo(() => [{ uri: fileUrl, fileName }], [fileUrl, fileName]);

    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin tip="加载预览组件..." /></div>}>
            <div style={{ height: '100%', overflow: 'auto' }}>
                <DocViewer
                    documents={docs}
                    config={{
                        header: { disableHeader: true },
                    }}
                    style={{ height: '100%' }}
                />
            </div>
        </Suspense>
    );
}

/**
 * Fallback for non-previewable files
 */
function UnsupportedViewer({ fileName, onDownload }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 16, padding: 40,
        }}>
            <FileUnknownOutlined style={{ fontSize: 64, color: 'var(--color-text-muted)' }} />
            <Text style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                该文件格式暂不支持在线预览
            </Text>
            <Text style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{fileName}</Text>
            <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
                下载文件
            </Button>
        </div>
    );
}

/**
 * FilePreviewModal
 *
 * @param {boolean} open
 * @param {function} onClose
 * @param {string} fileName
 * @param {string} fileUrl - data URL or blob URL of the file
 * @param {function} onDownload - download callback
 */
export default function FilePreviewModal({ open, onClose, fileName, fileUrl, fileId, onDownload }) {
    const ext = getExtension(fileName);
    const canPreview = isPreviewable(fileName);

    const handleDownload = useCallback(() => {
        if (onDownload) {
            onDownload();
            return;
        }
        if (fileUrl) {
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = fileName || 'file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            message.info('文件尚未加载，无法下载');
        }
    }, [fileUrl, fileName, onDownload]);

    const renderViewer = () => {
        if (!fileUrl) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Spin tip="加载文件内容..." />
                </div>
            );
        }

        if (!canPreview) {
            return <UnsupportedViewer fileName={fileName} onDownload={handleDownload} />;
        }

        if (ext === 'pdf') {
            return <PdfViewer fileUrl={fileUrl} />;
        }

        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', overflow: 'auto' }}>
                    <img src={fileUrl} alt={fileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
            );
        }

        return <OfficeViewer fileUrl={fileUrl} fileName={fileName} />;
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{fileName || '文件预览'}</span>
                </div>
            }
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button icon={<DownloadOutlined />} onClick={handleDownload}>下载</Button>
                    <Button onClick={onClose}>关闭</Button>
                </div>
            }
            width="80vw"
            style={{ top: 30 }}
            styles={{ body: { height: '70vh', padding: 0, overflow: 'hidden' } }}
            destroyOnClose
        >
            {renderViewer()}
        </Modal>
    );
}

export { isPreviewable, getExtension };

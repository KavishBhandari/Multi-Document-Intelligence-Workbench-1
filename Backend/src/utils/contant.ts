export const statusCode = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
};

export const messages = {
    // Session
    SESSION_CREATED: 'Analysis session created successfully!',
    SESSION_FETCHED: 'Analysis session fetched successfully!',
    SESSIONS_FETCHED: 'Analysis sessions fetched successfully!',
    SESSION_NOT_FOUND: 'Analysis session not found!',

    // Document
    DOCUMENTS_UPLOADED: 'Documents uploaded successfully!',
    DOCUMENT_NOT_FOUND: 'Document not found!',
    DOCUMENT_PROCESSING_FAILED: 'Document processing failed!',
    UNSUPPORTED_FORMAT: 'Unsupported document format!',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit!',
    NO_FILES_PROVIDED: 'No files were provided for upload!',
    INVALID_FILE: 'Invalid or unreadable file!',

    // Analysis
    ANALYSIS_STARTED: 'Analysis started successfully!',
    ANALYSIS_COMPLETED: 'Analysis completed successfully!',
    ANALYSIS_FAILED: 'Analysis failed!',
    ANALYSIS_RESULT_FETCHED: 'Analysis result fetched successfully!',
    NO_DOCUMENTS_TO_ANALYZE: 'No processable documents found for analysis!',

    // Generic
    INTERNAL_SERVER_ERROR: 'Internal server error!',
    VALIDATION_ERROR: 'Validation error!',
};

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
    'application/pdf': 'pdf',
    'text/plain': 'text',
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'csv',
};

export const MAX_FILE_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024;

export const MAX_CHUNK_SIZE = 2000; // characters per chunk

export const DOCUMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    FAILED: 'failed',
    UNSUPPORTED: 'unsupported',
} as const;

export const SESSION_STATUS = {
    CREATED: 'created',
    UPLOADING: 'uploading',
    PROCESSING: 'processing',
    ANALYZING: 'analyzing',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const;

export const FINDING_TYPES = {
    COMPARISON: 'comparison',
    DISCREPANCY: 'discrepancy',
    KEY_VALUE: 'key_value',
    MISSING_INFO: 'missing_info',
    SUMMARY: 'summary',
} as const;

export const FINDING_CLASSIFICATIONS = {
    EXTRACTED_FACT: 'extracted_fact',
    AI_INTERPRETATION: 'ai_interpretation',
} as const;

export const FINDING_SEVERITIES = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical',
} as const;
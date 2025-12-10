/**
 * Scamnemesis JavaScript SDK Type Definitions
 */

declare module '@scamnemesis/sdk' {
    export interface ScamnemesisConfig {
        apiKey?: string;
        apiUrl?: string;
        widgetUrl?: string;
        theme?: 'light' | 'dark' | 'auto';
        language?: 'en' | 'sk' | 'cs' | 'de';
        primaryColor?: string;
        borderRadius?: number;
        fontFamily?: string;
        onReady?: () => void;
        onError?: (error: Error) => void;
        onSearch?: (response: SearchResponse) => void;
        onReport?: (response: ReportResponse) => void;
        onVerify?: (response: VerifyResponse) => void;
    }

    export interface SearchWidgetOptions {
        placeholder?: string;
    }

    export interface ReportWidgetOptions {
        title?: string;
        successMessage?: string;
    }

    export interface VerifyWidgetOptions {
        placeholder?: string;
    }

    export interface SearchResult {
        id: string;
        identifier: string;
        type: string;
        description: string;
        risk_level: 'low' | 'medium' | 'high';
        report_count: number;
        created_at: string;
    }

    export interface SearchResponse {
        data: SearchResult[];
        total: number;
        page: number;
        pages: number;
    }

    export interface VerifyResponse {
        is_reported: boolean;
        report_count: number;
        risk_level?: 'low' | 'medium' | 'high';
        last_reported?: string;
    }

    export interface ReportData {
        type: string;
        identifier: string;
        description: string;
        scam_type?: string;
        amount_lost?: number;
        currency?: string;
        evidence_urls?: string[];
        contact_email?: string;
        anonymous?: boolean;
    }

    export interface ReportResponse {
        success: boolean;
        message: string;
        report_id?: string;
    }

    export interface StatsResponse {
        total_reports: number;
        total_amount_lost: number;
        users_protected: number;
    }

    export interface Widget {
        destroy(): void;
    }

    export class Scamnemesis {
        static VERSION: string;

        constructor(options?: ScamnemesisConfig);

        search(
            query: string,
            type?: string,
            page?: number,
            perPage?: number
        ): Promise<SearchResponse>;

        verify(
            identifier: string,
            type?: string
        ): Promise<VerifyResponse>;

        report(data: ReportData): Promise<ReportResponse>;

        getStats(): Promise<StatsResponse>;

        createSearchWidget(
            container: string | HTMLElement,
            options?: SearchWidgetOptions
        ): Widget | null;

        createReportWidget(
            container: string | HTMLElement,
            options?: ReportWidgetOptions
        ): Widget | null;

        createVerifyWidget(
            container: string | HTMLElement,
            options?: VerifyWidgetOptions
        ): Widget | null;

        destroy(): void;
    }

    export default Scamnemesis;
}

declare global {
    interface Window {
        Scamnemesis: typeof import('@scamnemesis/sdk').Scamnemesis;
    }
}

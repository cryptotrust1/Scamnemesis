/**
 * Type declarations for swagger-ui-dist
 */

declare module 'swagger-ui-dist/swagger-ui-bundle' {
  interface SwaggerUIBundleOptions {
    url?: string;
    urls?: Array<{ url: string; name: string }>;
    dom_id?: string;
    domNode?: HTMLElement;
    spec?: object;
    deepLinking?: boolean;
    presets?: Array<unknown>;
    plugins?: Array<unknown>;
    layout?: string;
    supportedSubmitMethods?: string[];
    persistAuthorization?: boolean;
    withCredentials?: boolean;
    requestInterceptor?: (req: unknown) => unknown;
    responseInterceptor?: (res: unknown) => unknown;
    onComplete?: () => void;
    syntaxHighlight?:
      | boolean
      | { activated?: boolean; theme?: string };
    tryItOutEnabled?: boolean;
    displayOperationId?: boolean;
    displayRequestDuration?: boolean;
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    defaultModelRendering?: 'example' | 'model';
    docExpansion?: 'list' | 'full' | 'none';
    filter?: boolean | string;
    maxDisplayedTags?: number;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    oauth2RedirectUrl?: string;
  }

  interface SwaggerUIBundle {
    (options: SwaggerUIBundleOptions): unknown;
    presets: {
      apis: unknown;
    };
    SwaggerUIStandalonePreset: unknown;
  }

  const SwaggerUIBundle: SwaggerUIBundle;
  export default SwaggerUIBundle;
}

declare module 'swagger-ui-dist/swagger-ui.css' {
  const content: string;
  export default content;
}

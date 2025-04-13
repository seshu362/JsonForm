// src/app/shared/types.ts

import { JsonFormsCore, JsonSchema } from '@jsonforms/core';

/**
 * Extend JsonFormsCore with an optional validationCompleted property.
 */
declare module '@jsonforms/core' {
  interface JsonFormsCore {
    validationCompleted?: boolean;
  }
}

/**
 * Additional schema extensions to support custom validations and UI enhancements.
 */
interface SchemaExtensions {
  errorMessage?: {
    [key: string]: string;
  };
  properties?: {
    [property: string]: ExtendedJsonSchema;
  };
  items?: ExtendedJsonSchema | ExtendedJsonSchema[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  required?: string[];
  minimum?: number;
  maximum?: number;
}

/**
 * Combines the base JsonSchema with the custom SchemaExtensions.
 */
export type ExtendedJsonSchema = JsonSchema & SchemaExtensions;


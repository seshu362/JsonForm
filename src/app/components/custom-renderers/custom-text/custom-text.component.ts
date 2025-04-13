import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { update } from '@jsonforms/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-text',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-group" [class.error-animation]="shouldAnimateError">
      <label [for]="id" class="form-label">
        {{ label }}
        <span *ngIf="isRequired" class="required-asterisk">*</span>
      </label>
      <input 
        [id]="id"
        type="text"
        class="form-control"
        [class.error-border]="showError"
        [value]="sanitizedData"
        (input)="onChange($event)"
        (blur)="onBlur()"
        [required]="isRequired"
        [disabled]="!enabled"
        [placeholder]="customDescription || ''"
      />
      <div *ngIf="showError" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1rem;
      transition: all 0.3s;
    }
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }
    .required-asterisk {
      color: #ef4444;
    }
    .form-control {
      display: block;
      width: 100%;
      padding: 0.625rem;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .error-border {
      border-color: #ef4444;
    }
    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    .error-animation {
      animation: shake 0.4s ease-in-out;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      50% { transform: translateX(8px); }
      75% { transform: translateX(-8px); }
    }
  `]
})
export class CustomTextComponent extends JsonFormsControl {
  touched = false;
  errors: string[] = [];
  private internalData: string = '';
  stateInitialized = false;
  lastSubmitState = false;
  shouldAnimateError = false;
  private inUpdate = false;

  constructor(
    service: JsonFormsAngularService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(service);
  }

  get sanitizedData(): string {
    return this.internalData;
  }

  set sanitizedData(value: any) {
    this.internalData = typeof value === 'string' ? value : '';
  }

  get customDescription(): string {
    return this.scopedSchema?.description || '';
  }

  get showError(): boolean {
    return this.errors.length > 0 && (this.touched || this.formSubmitted || this.validationCompleted);
  }

  get errorMessage(): string {
    return this.errors.length > 0 ? this.errors[0] : '';
  }

  get isRequired(): boolean {
    if (!this.scopedSchema || !this.path) return false;
    
    const pathSegments = this.path.split('/').filter(segment => 
      segment && segment !== 'properties' && segment !== '#');
    
    let currentSchema = this.rootSchema;
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      
      if (i === pathSegments.length - 1) {
        const parentPath = pathSegments.slice(0, -1);
        let parentSchema = this.rootSchema;
        
        for (const parentSegment of parentPath) {
          if (parentSchema.properties && parentSchema.properties[parentSegment]) {
            parentSchema = parentSchema.properties[parentSegment];
          } else {
            return false;
          }
        }
        
        return Array.isArray(parentSchema.required) && 
               parentSchema.required.includes(segment);
      }
      
      if (currentSchema.properties && currentSchema.properties[segment]) {
        currentSchema = currentSchema.properties[segment];
      } else {
        return false;
      }
    }
    
    return false;
  }

  override mapAdditionalProps() {
    // Prevent infinite loops during updates
    if (this.inUpdate) return;

    // Only update internal data if it differs from the current data
    if (this.data !== undefined && this.data !== this.sanitizedData) {
      this.sanitizedData = this.data;
    }
  }

  override onChange(event: Event) {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.sanitizedData = value;
    
    // Mark as being updated to prevent potential loops
    this.inUpdate = true;
    
    try {
      // Use the correct update function to update the data
      this.jsonFormsService.updateCore(update(this.path, () => value));
    } finally {
      this.inUpdate = false;
    }
    
    this.touched = true;
    
    // Validate after change
    this.validate();
  }

  onBlur() {
    this.touched = true;
    this.validate();
  }

  private get formSubmitted(): boolean {
    const state = this.jsonFormsService.getState();
    return state?.jsonforms?.core?.data?._formSubmitted === true;
  }

  private get validationCompleted(): boolean {
    const state = this.jsonFormsService.getState();
    return (state?.jsonforms?.core as any)?.validationCompleted === true;
  }

  override ngOnInit() {
    super.ngOnInit();
    
    // Set state as initialized and set up subscription after a short delay
    setTimeout(() => {
      this.stateInitialized = true;
      this.lastSubmitState = this.formSubmitted;
      
      this.jsonFormsService.$state.subscribe((state) => {
        if (!state?.jsonforms?.core) return;
        
        // Prevent updating during our own update cycle
        if (this.inUpdate) return;
        
        // Get current data value from the state
        const pathParts = this.path?.split('/').filter(p => p && p !== '#' && p !== 'properties') || [];
        let dataValue = state.jsonforms.core.data;
        
        // Navigate to the correct property in the data object
        for (const part of pathParts) {
          if (!dataValue || typeof dataValue !== 'object') break;
          dataValue = dataValue[part];
        }
        
        // Only update local data if it differs from current state
        if (dataValue !== undefined && this.sanitizedData !== dataValue) {
          this.sanitizedData = dataValue;
        }
        
        // Check if form was just submitted
        const currentSubmitState = state.jsonforms.core.data?._formSubmitted === true;
        if (currentSubmitState && !this.lastSubmitState) {
          // Form was just submitted, check for errors
          this.validate();
          if (this.showError) {
            this.shouldAnimateError = true;
            setTimeout(() => {
              this.shouldAnimateError = false;
            }, 500);
          }
        }
        this.lastSubmitState = currentSubmitState;
        
        // Validate whenever state changes
        this.validate();
      });
    }, 100);
  }

  private validate() {
    if (!this.stateInitialized) return;
    
    const state = this.jsonFormsService.getState();
    this.errors = [];
    
    if (!state?.jsonforms?.core) return;
    
    const currentValue = this.sanitizedData;
    const isEmpty = !currentValue || currentValue.trim() === '';
    
    // Check for required error
    if (this.isRequired && isEmpty && (this.touched || this.formSubmitted || this.validationCompleted)) {
      this.errors = ['*Required'];
      return;
    }

    // Don't validate empty non-required fields
    if (isEmpty && !this.isRequired) {
      return;
    }

    // Check for schema validation errors
    this.validateAgainstSchema(currentValue);
    
    // Check for errors in JSON Forms state
    const allErrors = state.jsonforms.core.errors || [];
    const cleanPath = this.path.replace(/^#\/properties\//, '').replace(/\/properties\//g, '/');
    
    // Find errors that match this field's path
    const escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const myErrors = allErrors.filter(err => {
      if (!err || !err.instancePath) return false;
      const errorPath = err.instancePath.replace(/^\//,'');
      return errorPath === cleanPath || 
             new RegExp(`^${escapeRegExp(cleanPath)}($|/)`).test(errorPath);
    });
    
    if (myErrors.length > 0 && this.errors.length === 0) {
      this.errors = myErrors.map(err => this.getErrorMessageForError(err));
    }
  }

  private validateAgainstSchema(value: string): void {
    // Skip if we already found errors or if there's no schema
    if (this.errors.length > 0 || !this.scopedSchema) return;
    
    const schema = this.scopedSchema;

    // Validate minLength
    if (schema.minLength && value.length < schema.minLength) {
      this.errors.push(`*Must have at least ${schema.minLength} characters`);
      return;
    }

    // Validate maxLength
    if (schema.maxLength && value.length > schema.maxLength) {
      this.errors.push(`*Maximum ${schema.maxLength} characters allowed`);
      return;
    }

    // Validate format
    if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push('*Invalid email format');
      return;
    }

    // Validate pattern
    if (schema.pattern) {
      const pattern = new RegExp(schema.pattern);
      if (!pattern.test(value)) {
        // Provide specific error messages based on field type or path
        if (this.path?.includes('phone')) {
          this.errors.push('*Invalid Number');
        } else if (this.path?.includes('zipCode')) {
          this.errors.push('*Invalid Zipcode');
        } else {
          this.errors.push('*Invalid format');
        }
        return;
      }
    }
  }

  private getErrorMessageForError(error: any): string {
    if (!error) return '*Invalid value';
    
    // First check if we have a custom error message in the schema
    if (error.params?.errorMessage) {
      return error.params.errorMessage;
    }
    
    const keyword = error.keyword;
    const params = error.params || {};
    
    // Return error messages based on the validation keyword
    switch (keyword) {
      case 'required': return '*Required';
      case 'minLength': return `*Must have at least ${params.limit} characters`;
      case 'maxLength': return `*Maximum ${params.limit} characters allowed`;
      case 'pattern': 
        // Customize error messages for specific fields based on path
        if (this.path?.includes('phone')) return '*Invalid Number';
        if (this.path?.includes('zipCode')) return '*Invalid Zipcode';
        return '*Invalid format';
      case 'format': 
        if (params.format === 'email') return '*Invalid email format';
        return '*Invalid format';
      default: return error.message || '*Invalid value';
    }
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonFormsModule, JsonFormsAngularService } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule, angularMaterialRenderers } from '@jsonforms/angular-material';
import { JsonSchema, UISchemaElement, createAjv, update } from '@jsonforms/core';
import { JsonSchemaService } from '../shared/json-schema.service';
import { customRenderers } from '../shared/custom-renderers.registry';
import { ExtendedJsonSchema } from '../shared/types';

@Component({
  selector: 'app-form3',
  standalone: true,
  imports: [CommonModule, JsonFormsModule, JsonFormsAngularMaterialModule],
  templateUrl: './form2.component.html',
  styleUrls: ['./form2.component.css'],
  providers: [JsonFormsAngularService]
})
export class Form2Component implements OnInit {
  formData: any = this.getInitialFormData();
  errors: any[] = [];
  schema!: JsonSchema;
  uischema!: UISchemaElement;
  renderers = [...angularMaterialRenderers, ...customRenderers];
  isSubmitted = false;
  showSuccessMessage = false;
  additionalContext: any = {};
  validationInProgress = false;

  private ajv = createAjv({
    allErrors: true,
    useDefaults: true,
    formats: {
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'phone': /^\d{10}$/
    }
  });

  constructor(
    private jsonSchemaService: JsonSchemaService,
    public jsonFormsService: JsonFormsAngularService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const formConfig = this.jsonSchemaService.getForm3Schema();
    this.schema = this.enhanceSchema(formConfig.schema);
    this.uischema = formConfig.uischema;

    this.jsonFormsService.init({
      core: {
        data: this.formData,
        schema: this.schema,
        uischema: this.uischema,
        ajv: this.ajv,
        validationMode: 'ValidateAndShow'
      }
    });

    this.jsonFormsService.$state.subscribe(state => {
      if (state?.jsonforms?.core) {
        this.errors = state.jsonforms.core.errors?.filter(err => 
          !err.instancePath?.includes('_formSubmitted')
        ) || [];
        
        this.formData = this.sanitizeData({...state.jsonforms.core.data});
        this.cdRef.detectChanges();
      }
    });
  }

  onFormChange(event: any): void {
    if (event?.data !== undefined) {
      this.formData = this.sanitizeData({...event.data});
    }
    if (event?.errors !== undefined) {
      this.errors = event.errors.filter((err: any) => 
        !err.instancePath?.includes('_formSubmitted')
      );
    }
  }

  private enhanceSchema(original: JsonSchema): JsonSchema {
    const schema = JSON.parse(JSON.stringify(original)) as ExtendedJsonSchema;
    
    // User Information Enhancements
    if (schema.properties?.['userInfo']?.properties) {
      const userInfo = schema.properties['userInfo'] as ExtendedJsonSchema;
      const props = userInfo.properties || {};
      
      if (props['name']) {
        props['name'].minLength = 2;
        (props['name'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 2 characters"
        };
      }
      
      if (props['email']) {
        props['email'].format = 'email';
        (props['email'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          format: "*Invalid email format"
        };
      }
      
      if (props['phone']) {
        props['phone'].pattern = "^\\d{10}$";
        (props['phone'] as ExtendedJsonSchema).errorMessage = {
          pattern: "*Invalid Number"
        };
      }

      userInfo.required = ['name', 'email'];
    }

    // Feedback Details Enhancements
    if (schema.properties?.['feedbackDetails']?.properties) {
      const feedbackDetails = schema.properties['feedbackDetails'] as ExtendedJsonSchema;
      const props = feedbackDetails.properties || {};
      
      if (props['subject']) {
        props['subject'].minLength = 3;
        (props['subject'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 3 characters"
        };
      }
      
      if (props['message']) {
        props['message'].minLength = 10;
        (props['message'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 10 characters"
        };
      }

      feedbackDetails.required = ['subject', 'type', 'message'];
    }

    return schema;
  }

  private sanitizeData(data: any): any {
    return {
      userInfo: {
        name: (data.userInfo?.name || '').toString().trim(),
        email: (data.userInfo?.email || '').toString().trim().toLowerCase(),
        phone: (data.userInfo?.phone || '').toString().replace(/\D/g, ''),
        customerType: data.userInfo?.customerType || ''
      },
      feedbackDetails: {
        subject: (data.feedbackDetails?.subject || '').toString().trim(),
        type: data.feedbackDetails?.type || '',
        priority: data.feedbackDetails?.priority || 'Medium',
        message: (data.feedbackDetails?.message || '').toString().trim(),
        attachFile: !!data.feedbackDetails?.attachFile
      },
      _formSubmitted: !!data._formSubmitted
    };
  }

  async submitForm(): Promise<void> {
    if (this.validationInProgress) return;
    this.validationInProgress = true;
    this.isSubmitted = true;
    this.showSuccessMessage = false;

    try {
      const updatedData = { ...this.formData, _formSubmitted: true };
      this.jsonFormsService.updateCore(update('', () => updatedData));
      this.jsonFormsService.updateCore(update('validationMode', () => 'ValidateAndShow'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const validationErrors = this.performValidation();
      this.errors = validationErrors;
      
      if (validationErrors.length > 0) {
        this.jsonFormsService.updateCore(update('errors', () => validationErrors));
      }
      
      this.jsonFormsService.updateCore(update('validationCompleted', () => true));
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (validationErrors.length === 0) {
        this.showSuccessMessage = true;
        setTimeout(() => this.resetForm(), 2000);
      }
    } finally {
      this.validationInProgress = false;
    }
  }

  private performValidation(): any[] {
    const validationErrors: any[] = [];
    const data = this.formData;

    // User Info Validation
    const requiredUserFields = ['name', 'email'];
    requiredUserFields.forEach(field => {
      const value = data?.userInfo?.[field];
      if (!value || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/userInfo/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });

    // Name Length Validation
    const name = data?.userInfo?.name;
    if (name && name.length < 2) {
      validationErrors.push({
        instancePath: '/userInfo/name',
        keyword: 'minLength',
        message: '*Must have at least 2 characters',
        schemaPath: '#/properties/name/minLength',
        params: { limit: 2 }
      });
    }

    // Email Format Validation
    const email = data?.userInfo?.email;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push({
        instancePath: '/userInfo/email',
        keyword: 'format',
        params: { format: 'email' },
        message: '*Invalid email format',
        schemaPath: '#/properties/email/format'
      });
    }

    // Phone Format Validation (if provided)
    const phone = data?.userInfo?.phone;
    if (phone && !/^\d{10}$/.test(phone)) {
      validationErrors.push({
        instancePath: '/userInfo/phone',
        keyword: 'pattern',
        message: '*Invalid Number',
        schemaPath: '#/properties/phone/pattern',
        params: { pattern: /^\d{10}$/.toString() }
      });
    }

    // Feedback Details Validation
    const requiredFeedbackFields = ['subject', 'type', 'message'];
    requiredFeedbackFields.forEach(field => {
      const value = data?.feedbackDetails?.[field];
      if (!value || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/feedbackDetails/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });

    // Subject Length Validation
    const subject = data?.feedbackDetails?.subject;
    if (subject && subject.length < 3) {
      validationErrors.push({
        instancePath: '/feedbackDetails/subject',
        keyword: 'minLength',
        message: '*Must have at least 3 characters',
        schemaPath: '#/properties/subject/minLength',
        params: { limit: 3 }
      });
    }

    // Message Length Validation
    const message = data?.feedbackDetails?.message;
    if (message && message.length < 10) {
      validationErrors.push({
        instancePath: '/feedbackDetails/message',
        keyword: 'minLength',
        message: '*Must have at least 10 characters',
        schemaPath: '#/properties/message/minLength',
        params: { limit: 10 }
      });
    }

    // If it's a bug report, priority must be specified
    if (data?.feedbackDetails?.type === 'Bug' && !data?.feedbackDetails?.priority) {
      validationErrors.push({
        instancePath: '/feedbackDetails/priority',
        keyword: 'required',
        message: '*Required for Bug reports',
        schemaPath: '#/required',
        params: { missingProperty: 'priority' }
      });
    }

    return validationErrors;
  }

  private getInitialFormData(): any {
    return {
      userInfo: {
        name: '',
        email: '',
        phone: '',
        customerType: ''
      },
      feedbackDetails: {
        subject: '',
        type: '',
        priority: 'Medium',
        message: '',
        attachFile: false
      },
      _formSubmitted: false
    };
  }

  private resetForm(): void {
    const initialData = this.getInitialFormData();
    this.jsonFormsService.updateCore(update('', () => initialData));
    this.formData = initialData;
    this.errors = [];
    this.isSubmitted = false;
    this.showSuccessMessage = false;
    this.cdRef.detectChanges();
  }
}
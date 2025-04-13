import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonFormsModule, JsonFormsAngularService } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule, angularMaterialRenderers } from '@jsonforms/angular-material';
import { JsonSchema, UISchemaElement, createAjv, update, setValidationMode } from '@jsonforms/core';
import { JsonSchemaService } from '../shared/json-schema.service';
import { customRenderers } from '../shared/custom-renderers.registry';
import { ExtendedJsonSchema } from '../shared/types';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule, JsonFormsModule, JsonFormsAngularMaterialModule],
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css'],
  providers: [JsonFormsAngularService]
})
export class Form1Component implements OnInit {
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
    validateFormats: true,
    formats: {
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'phone': /^\d{10}$/,
      'zip-code': /^\d{5}$/
    }
  });

  constructor(
    private jsonSchemaService: JsonSchemaService,
    public jsonFormsService: JsonFormsAngularService
  ) {}

  ngOnInit(): void {
    const formConfig = this.jsonSchemaService.getForm1Schema();
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
        // Filter out _formSubmitted errors from the error list
        this.errors = state.jsonforms.core.errors?.filter(err => 
          !err.instancePath?.includes('_formSubmitted')
        ) || [];
        
        // Always keep formData in sync with state
        this.formData = this.sanitizeData({...state.jsonforms.core.data});
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
    
    if (schema.properties?.['personalInfo']?.properties) {
      const personalInfo = schema.properties['personalInfo'] as ExtendedJsonSchema;
      const personalInfoProps = personalInfo.properties || {};
      
      if (personalInfoProps['firstName']) {
        personalInfoProps['firstName'].minLength = 2;
        // Cast to ExtendedJsonSchema to add errorMessage
        (personalInfoProps['firstName'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 2 characters"
        };
      }
      
      if (personalInfoProps['lastName']) {
        personalInfoProps['lastName'].minLength = 2;
        // Cast to ExtendedJsonSchema to add errorMessage
        (personalInfoProps['lastName'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 2 characters"
        };
      }
      
      if (personalInfoProps['email']) {
        personalInfoProps['email'].format = 'email';
        // Cast to ExtendedJsonSchema to add errorMessage
        (personalInfoProps['email'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          format: "*Invalid email format"
        };
      }
      
      if (personalInfoProps['phone']) {
        personalInfoProps['phone'].pattern = "^\\d{10}$";
        // Cast to ExtendedJsonSchema to add errorMessage
        (personalInfoProps['phone'] as ExtendedJsonSchema).errorMessage = {
          pattern: "*Invalid Number"  // Updated to show "Invalid Number"
        };
      }

      // Ensure required fields are set
      personalInfo.required = ['firstName', 'lastName', 'email'];
    }

    if (schema.properties?.['address']?.properties) {
      const address = schema.properties['address'] as ExtendedJsonSchema;
      const addressProps = address.properties || {};
      
      if (addressProps['zipCode']) {
        addressProps['zipCode'].pattern = "^\\d{5}$";
        // Cast to ExtendedJsonSchema to add errorMessage
        (addressProps['zipCode'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          pattern: "*Invalid Zipcode"  // Updated to show "Invalid Zipcode"
        };
      }
      
      address.required = ['street', 'city', 'state', 'zipCode'];
    }

    return schema;
  }

  private sanitizeData(data: any): any {
    return {
      personalInfo: {
        firstName: (data.personalInfo?.firstName || '').toString().trim(),
        lastName: (data.personalInfo?.lastName || '').toString().trim(),
        email: (data.personalInfo?.email || '').toString().trim().toLowerCase(),
        phone: (data.personalInfo?.phone || '').toString().replace(/\D/g, '')
      },
      address: {
        street: (data.address?.street || '').toString().trim(),
        city: (data.address?.city || '').toString().trim(),
        state: (data.address?.state || '').toString().trim().toUpperCase(),
        zipCode: (data.address?.zipCode || '').toString().replace(/\D/g, '')
      },
      _formSubmitted: !!data._formSubmitted
    };
  }

  async submitForm(): Promise<void> {
    // Prevent multiple submissions
    if (this.validationInProgress) {
      return;
    }
    
    this.validationInProgress = true;
    this.isSubmitted = true;
    this.showSuccessMessage = false;

    try {
      // Mark form as submitted to trigger validation for all fields
      const updatedData = { ...this.formData, _formSubmitted: true };
      
      // Update the JSON Forms state
      this.jsonFormsService.updateCore(update('', () => updatedData));
      
      // Force validation mode to display all errors
      this.jsonFormsService.updateCore(update('validationMode', () => 'ValidateAndShow'));
      
      // Give time for the state update to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Perform manual validation
      const validationErrors = this.performValidation();
      
      // Update the errors in the component state
      this.errors = validationErrors;
      
      // Update errors in JSON Forms state
      if (validationErrors.length > 0) {
        this.jsonFormsService.updateCore(
          update('errors', () => validationErrors)
        );
      }
      
      // Broadcast validation completion to mark all fields as touched
      this.jsonFormsService.updateCore(
        update('validationCompleted', () => true)
      );
      
      // Wait again to ensure UI is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if form is valid
      if (validationErrors.length === 0) {
        this.showSuccessMessage = true;
        setTimeout(() => this.resetForm(), 2000);
      } else {
        console.log('Form has validation errors:', validationErrors);
      }
    } finally {
      this.validationInProgress = false;
    }
  }
  
  private performValidation(): any[] {
    // Create a fresh array for errors
    const validationErrors: any[] = [];
    
    // Check required fields in personal info
    const requiredPersonalInfoFields = ['firstName', 'lastName', 'email'];
    
    requiredPersonalInfoFields.forEach(field => {
      const value = this.formData?.personalInfo?.[field];
      if (!value || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/personalInfo/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });
    
    // Check required fields in address
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    
    requiredAddressFields.forEach(field => {
      const value = this.formData?.address?.[field];
      if (!value || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/address/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });
    
    // Format validation for email
    const emailValue = this.formData?.personalInfo?.email;
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      validationErrors.push({
        instancePath: `/personalInfo/email`,
        keyword: 'format',
        params: { format: 'email' },
        message: `*Invalid email format`,
        schemaPath: '#/properties/email/format',
      });
    }
    
    // Format validation for phone
    const phoneValue = this.formData?.personalInfo?.phone;
    if (phoneValue && !/^\d{10}$/.test(phoneValue.replace(/\D/g, ''))) {
      validationErrors.push({
        instancePath: `/personalInfo/phone`,
        keyword: 'pattern',
        message: `*Invalid Number`,  // Updated to show "Invalid Number"
        schemaPath: '#/properties/phone/pattern',
        params: { pattern: /^\d{10}$/.toString() }
      });
    }
    
    // Format validation for zipCode
    const zipValue = this.formData?.address?.zipCode;
    if (zipValue && !/^\d{5}$/.test(zipValue.replace(/\D/g, ''))) {
      validationErrors.push({
        instancePath: `/address/zipCode`,
        keyword: 'pattern',
        message: `*Invalid Zipcode`,  // Updated to show "Invalid Zipcode"
        schemaPath: '#/properties/zipCode/pattern',
        params: { pattern: /^\d{5}$/.toString() }
      });
    }
    
    // Check minimum length for firstName (2 chars)
    const firstNameValue = this.formData?.personalInfo?.firstName;
    if (firstNameValue && firstNameValue.trim().length < 2) {
      validationErrors.push({
        instancePath: `/personalInfo/firstName`,
        keyword: 'minLength',
        message: `*Must have at least 2 characters`,
        schemaPath: '#/properties/firstName/minLength',
        params: { limit: 2 }
      });
    }
    
    // Check minimum length for lastName (2 chars)
    const lastNameValue = this.formData?.personalInfo?.lastName;
    if (lastNameValue && lastNameValue.trim().length < 2) {
      validationErrors.push({
        instancePath: `/personalInfo/lastName`,
        keyword: 'minLength',
        message: `*Must have at least 2 characters`,
        schemaPath: '#/properties/lastName/minLength',
        params: { limit: 2 }
      });
    }
    
    return validationErrors;
  }

  private getInitialFormData(): any {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
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
  }
}
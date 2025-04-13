import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonFormsModule, JsonFormsAngularService } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule, angularMaterialRenderers } from '@jsonforms/angular-material';
import { JsonSchema, UISchemaElement, createAjv, update } from '@jsonforms/core';
import { JsonSchemaService } from '../shared/json-schema.service';
import { customRenderers } from '../shared/custom-renderers.registry';
import { ExtendedJsonSchema } from '../shared/types';

@Component({
  selector: 'app-form2',
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
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  });

  constructor(
    private jsonSchemaService: JsonSchemaService,
    public jsonFormsService: JsonFormsAngularService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const formConfig = this.jsonSchemaService.getForm2Schema();
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
      this.formData = this.sanitizeData(this.deepMerge(this.formData, event.data));
    }
    if (event?.errors !== undefined) {
      this.errors = event.errors.filter((err: any) => 
        !err.instancePath?.includes('_formSubmitted')
      );
    }
  }

  private enhanceSchema(original: JsonSchema): JsonSchema {
    const schema = JSON.parse(JSON.stringify(original)) as ExtendedJsonSchema;
    
    // Product Info Enhancements
    if (schema.properties?.['productInfo']?.properties) {
      const productInfo = schema.properties['productInfo'] as ExtendedJsonSchema;
      const props = productInfo.properties || {};

      if (props['productName']) {
        props['productName'].minLength = 2;
        (props['productName'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minLength: "*Must have at least 2 characters"
        };
      }

      if (props['price']) {
        (props['price'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          minimum: "*Must be at least $0.01"
        };
      }

      productInfo.required = ['productName', 'category', 'price'];
    }

    // Supplier Info Enhancements
    if (schema.properties?.['supplierInfo']?.properties) {
      const supplierInfo = schema.properties['supplierInfo'] as ExtendedJsonSchema;
      const props = supplierInfo.properties || {};

      if (props['contactEmail']) {
        props['contactEmail'].format = 'email';
        (props['contactEmail'] as ExtendedJsonSchema).errorMessage = {
          required: "*Required",
          format: "*Invalid email format"
        };
      }

      supplierInfo.required = ['supplierName', 'contactEmail'];
    }

    return schema;
  }

  private sanitizeData(data: any): any {
    return {
      productInfo: {
        productName: (data.productInfo?.productName || '').toString().trim(),
        category: data.productInfo?.category || '',
        price: this.sanitizePrice(data.productInfo?.price),
        inStock: !!data.productInfo?.inStock,
        quantity: Math.max(0, parseInt(data.productInfo?.quantity || 0, 10)),
        warrantyPeriod: Math.max(0, parseInt(data.productInfo?.warrantyPeriod || 0, 10)),
        description: (data.productInfo?.description || '').toString().trim()
      },
      supplierInfo: {
        supplierName: (data.supplierInfo?.supplierName || '').toString().trim(),
        contactEmail: (data.supplierInfo?.contactEmail || '').toString().trim().toLowerCase(),
        rating: data.supplierInfo?.rating || ''
      },
      _formSubmitted: !!data._formSubmitted
    };
  }

  
  private sanitizePrice(value: any): number | null {
    const price = parseFloat(value);
    return isNaN(price) ? null : Math.max(0, price);
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

    // Product Info Validation
    const requiredProductFields = ['productName', 'category', 'price'];
    requiredProductFields.forEach(field => {
      const value = data?.productInfo?.[field];
      if (value === null || value === undefined || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/productInfo/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });

    // Conditional Validations
    if (data?.productInfo?.category === 'Electronics' && !data?.productInfo?.warrantyPeriod) {
      validationErrors.push({
        instancePath: '/productInfo/warrantyPeriod',
        keyword: 'required',
        message: '*Required for Electronics',
        schemaPath: '#/required',
        params: { missingProperty: 'warrantyPeriod' }
      });
    }

    if (data?.productInfo?.inStock && (!data?.productInfo?.quantity || data.productInfo.quantity < 1)) {
      validationErrors.push({
        instancePath: '/productInfo/quantity',
        keyword: 'minimum',
        message: '*Required when in stock',
        schemaPath: '#/minimum',
        params: { limit: 1 }
      });
    }

    // Supplier Info Validation
    const requiredSupplierFields = ['supplierName', 'contactEmail'];
    requiredSupplierFields.forEach(field => {
      const value = data?.supplierInfo?.[field];
      if (!value || String(value).trim() === '') {
        validationErrors.push({
          instancePath: `/supplierInfo/${field}`,
          keyword: 'required',
          message: `*Required`,
          schemaPath: '#/required',
          params: { missingProperty: field }
        });
      }
    });

    // Email Format Validation
    const email = data?.supplierInfo?.contactEmail;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push({
        instancePath: '/supplierInfo/contactEmail',
        keyword: 'format',
        params: { format: 'email' },
        message: '*Invalid email format',
        schemaPath: '#/properties/contactEmail/format'
      });
    }

    return validationErrors;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          output[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  private getInitialFormData(): any {
    return {
      productInfo: {
        productName: '',
        category: '',
        price: null,
        inStock: false,
        quantity: 0,
        warrantyPeriod: null,
        description: ''
      },
      supplierInfo: {
        supplierName: '',
        contactEmail: '',
        rating: ''
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
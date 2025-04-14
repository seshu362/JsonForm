import { Injectable } from '@angular/core';
import { JsonSchema } from '@jsonforms/core';

@Injectable({
  providedIn: 'root'
})
export class JsonSchemaService {
  getForm1Schema() {
    return {
      schema: {
        type: 'object',
        properties: {
          personalInfo: {
            type: 'object',
            properties: {
              firstName: { 
                type: 'string', 
                minLength: 2,
                description: 'Enter your legal first name'
              },
              lastName: { 
                type: 'string', 
                minLength: 2,
                description: 'Enter your legal last name'
              },
              email: { 
                type: 'string', 
                format: 'email',
                description: "We'll never share your email"
              },
              phone: { 
                type: 'string', 
                pattern: '^[0-9]{10}$',
                description: '10-digit phone number'
              }
            },
            required: ['firstName', 'lastName', 'email']
          },
          address: {
            type: 'object',
            properties: {
              street: { 
                type: 'string',
                description: 'Street address including apartment/unit number'
              },
              city: { 
                type: 'string',
                description: 'City name'
              },
              state: { 
                type: 'string',
                enum: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
                description: 'State abbreviation'
              },
              zipCode: { 
                type: 'string', 
                pattern: '^[0-9]{5}$',
                description: '5-digit ZIP code'
              }
            },
            required: ['street', 'city', 'state', 'zipCode']
          }
        }
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Group',
            label: 'Personal Information',
            elements: [
              {
                type: 'HorizontalLayout',
                elements: [
                  { 
                    type: 'Control', 
                    scope: '#/properties/personalInfo/properties/firstName',
                    options: { custom: true }
                  },
                  { 
                    type: 'Control', 
                    scope: '#/properties/personalInfo/properties/lastName',
                    options: { custom: true }
                  }
                ]
              },
              { 
                type: 'Control', 
                scope: '#/properties/personalInfo/properties/email',
                options: { custom: true }
              },
              { 
                type: 'Control', 
                scope: '#/properties/personalInfo/properties/phone',
                options: { custom: true }
              }
            ]
          },
          {
            type: 'Group',
            label: 'Address',
            elements: [
              { 
                type: 'Control', 
                scope: '#/properties/address/properties/street',
                options: { custom: true }
              },
              {
                type: 'HorizontalLayout',
                elements: [
                  { 
                    type: 'Control', 
                    scope: '#/properties/address/properties/city',
                    options: { custom: true }
                  },
                  { 
                    type: 'Control', 
                    scope: '#/properties/address/properties/state',
                    options: { custom: true }
                  },
                  { 
                    type: 'Control', 
                    scope: '#/properties/address/properties/zipCode',
                    options: { custom: true }
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }

  getForm2Schema() {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        productInfo: {
          type: 'object',
          properties: {
            productName: { 
              type: 'string', 
              minLength: 3,
              description: 'Product display name'
            },
            category: { 
              type: 'string',
              enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Other'],
              description: 'Product category'
            },
            price: { 
              type: 'number', 
              minimum: 0,
              description: 'USD price'
            },
            inStock: { 
              type: 'boolean',
              description: 'Is product currently available?'
            },
            quantity: { 
              type: 'integer', 
              minimum: 0,
              description: 'Available units'
            },
            warrantyPeriod: { 
              type: 'integer',
              minimum: 0,
              maximum: 36,
              description: 'Warranty duration in months (required for Electronics)'
            },
            totalPrice: {
              type: 'number',
              readOnly: true,
              description: 'Automatically calculated based on price and quantity'
            },
            description: { 
              type: 'string',
              description: 'Detailed product description' 
            }
          },
          required: ['productName', 'category', 'price', 'inStock']
        },
        supplierInfo: {
          type: 'object',
          properties: {
            supplierName: { 
              type: 'string',
              description: 'Name of product supplier'
            },
            contactEmail: { 
              type: 'string', 
              format: 'email',
              description: 'Supplier contact email'
            },
            rating: { 
              type: 'integer', 
              minimum: 1, 
              maximum: 5,
              description: 'Supplier rating (1-5 stars)'
            }
          },
          required: ['supplierName', 'contactEmail']
        },
        _formSubmitted: {
          type: 'boolean'
        }
      }
    };

    const uischema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          label: 'Product Information',
          elements: [
            {
              type: 'HorizontalLayout',
              elements: [
                { 
                  type: 'Control', 
                  scope: '#/properties/productInfo/properties/productName',
                  options: { custom: true }
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/productInfo/properties/category',
                  options: { custom: true }
                }
              ]
            },
            {
              type: 'HorizontalLayout',
              elements: [
                { 
                  type: 'Control', 
                  scope: '#/properties/productInfo/properties/price',
                  options: { custom: true }
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/productInfo/properties/inStock'
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/productInfo/properties/quantity',
                  rule: {
                    effect: 'ENABLE',
                    condition: {
                      scope: '#/properties/productInfo/properties/inStock',
                      schema: { const: true }
                    }
                  }
                }
              ]
            },
            {
              type: 'Control',
              scope: '#/properties/productInfo/properties/warrantyPeriod',
              rule: {
                effect: 'SHOW',
                condition: {
                  scope: '#/properties/productInfo/properties/category',
                  schema: { const: 'Electronics' }
                }
              }
            },
            { 
              type: 'Control', 
              scope: '#/properties/productInfo/properties/totalPrice',
              options: { 
                readonly: true
              }
            },
            { 
              type: 'Control', 
              scope: '#/properties/productInfo/properties/description',
              options: { multi: true }
            }
          ]
        },
        {
          type: 'Group',
          label: 'Supplier Information',
          elements: [
            { 
              type: 'Control', 
              scope: '#/properties/supplierInfo/properties/supplierName',
              options: { custom: true }
            },
            { 
              type: 'Control', 
              scope: '#/properties/supplierInfo/properties/contactEmail',
              options: { custom: true }
            },
            { 
              type: 'Control', 
              scope: '#/properties/supplierInfo/properties/rating'
            }
          ]
        },
        {
          type: 'Control',
          scope: '#/properties/_formSubmitted',
          options: {
            hidden: true
          }
        }
      ]
    };

    return { schema, uischema };
  }
  getForm3Schema() {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        userInfo: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              minLength: 2,
              description: 'Your full name'
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Email for contact purposes'
            },
            phone: { 
              type: 'string', 
              pattern: '^[0-9]{10}$',
              description: 'Optional contact number (10 digits)'
            },
            customerType: { 
              type: 'string',
              enum: ['New', 'Returning', 'VIP', 'Other'],
              description: 'Customer category'
            }
          },
          required: ['name', 'email']
        },
        feedbackDetails: {
          type: 'object',
          properties: {
            subject: { 
              type: 'string',
              minLength: 3,
              description: 'Brief subject of your feedback'
            },
            type: { 
              type: 'string',
              enum: ['Compliment', 'Suggestion', 'Question', 'Bug', 'Complaint'],
              description: 'Feedback category'
            },
            priority: { 
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
              default: 'Medium',
              description: 'Priority level (required for Bug reports)'
            },
            message: { 
              type: 'string',
              minLength: 10,
              description: 'Detailed feedback'
            },
            attachFile: { 
              type: 'boolean',
              description: 'Do you want to attach screenshots or files?'
            }
          },
          required: ['subject', 'type', 'message']
        },
        _formSubmitted: {
          type: 'boolean'
        }
      }
    };

    const uischema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          label: 'Your Information',
          elements: [
            {
              type: 'HorizontalLayout',
              elements: [
                { 
                  type: 'Control', 
                  scope: '#/properties/userInfo/properties/name',
                  options: { custom: true }
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/userInfo/properties/email',
                  options: { custom: true }
                }
              ]
            },
            {
              type: 'HorizontalLayout',
              elements: [
                { 
                  type: 'Control', 
                  scope: '#/properties/userInfo/properties/phone',
                  options: { custom: true }
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/userInfo/properties/customerType',
                  options: { custom: true }
                }
              ]
            }
          ]
        },
        {
          type: 'Group',
          label: 'Feedback',
          elements: [
            {
              type: 'HorizontalLayout',
              elements: [
                { 
                  type: 'Control', 
                  scope: '#/properties/feedbackDetails/properties/subject',
                  options: { custom: true }
                },
                { 
                  type: 'Control', 
                  scope: '#/properties/feedbackDetails/properties/type',
                  options: { custom: true }
                }
              ]
            },
            { 
              type: 'Control', 
              scope: '#/properties/feedbackDetails/properties/priority',
              rule: {
                effect: 'SHOW',
                condition: {
                  scope: '#/properties/feedbackDetails/properties/type',
                  schema: { const: 'Bug' }
                }
              }
            },
            { 
              type: 'Control', 
              scope: '#/properties/feedbackDetails/properties/message',
              options: { 
                multi: true,
                custom: true
              }
            },
            { 
              type: 'Control', 
              scope: '#/properties/feedbackDetails/properties/attachFile'
            }
          ]
        },
        {
          type: 'Control',
          scope: '#/properties/_formSubmitted',
          options: {
            hidden: true
          }
        }
      ]
    };

    return { schema, uischema };
  }
}
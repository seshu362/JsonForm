# Angular JSON Forms Application

This project is a responsive Angular application that demonstrates the implementation of dynamic forms using JSON Forms with custom validation and styling. The application features two distinct forms with different validation requirements, all built with a responsive design that works well on both mobile and desktop devices.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [JSON Schema Structure](#json-schema-structure)
- [Setup and Installation](#setup-and-installation)
- [Development Server](#development-server)
- [Custom Form Components](#custom-form-components)
- [Validation](#validation)
- [UI/UX Considerations](#uiux-considerations)
- [Form Navigation](#form-navigation)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)

## Overview

This application demonstrates how to create and validate complex forms in Angular using the JSON Forms library. It includes two sample forms:

1. **Personal Information Form**: Collects user personal details and address information
2. **Product Information Form**: Collects product details with conditional fields and supplier information

The forms include custom styling, validation, and responsive design for various screen sizes.

## Features

- Dynamic form generation using JSON Schema
- Custom form controls with enhanced validation
- Real-time form validation
- Responsive design for mobile and desktop
- Form navigation between different form types
- Conditional form fields (showing/hiding based on other field values)
- Success messaging and form reset functionality
- Custom error handling and display

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── form1/
│   │   │   ├── form1.component.ts
│   │   │   ├── form1.component.html
│   │   │   └── form1.component.css
│   │   ├── form2/
│   │   │   ├── form2.component.ts
│   │   │   ├── form2.component.html
│   │   │   └── form2.component.css
│   │   └── shared/
│   │       ├── custom-renderers/
│   │       │   └── custom-text/
│   │       │       └── custom-text.component.ts
│   │       ├── custom-renderers.registry.ts
│   │       ├── json-schema.service.ts
│   │       └── types.ts
│   ├── app.component.html
│   └── app.routes.ts
```

## JSON Schema Structure

The application uses two different JSON schemas for form generation:

### Personal Information Form Schema

```typescript
{
  personalInfo: {
    firstName: string,   // Required, min length: 2
    lastName: string,    // Required, min length: 2
    email: string,       // Required, format: email
    phone: string        // Optional, pattern: 10 digits
  },
  address: {
    street: string,      // Required
    city: string,        // Required
    state: string,       // Required, enum of US states
    zipCode: string      // Required, pattern: 5 digits
  }
}
```

### Product Information Form Schema

```typescript
{
  productInfo: {
    productName: string,     // Required, min length: 3
    category: string,        // Required, enum of categories
    price: number,           // Required, minimum: 0
    inStock: boolean,        // Required
    quantity: number,        // Required if inStock is true
    description: string      // Optional
  },
  supplierInfo: {
    supplierName: string,    // Required
    contactEmail: string,    // Required, format: email
    rating: number           // Optional, 1-5 stars
  }
}
```

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v15 or higher)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd angular-json-forms-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install required packages:
   ```bash
   npm install @jsonforms/angular @jsonforms/angular-material @jsonforms/core @jsonforms/material-renderers
   ```
4. Install Tailwind CSS v3.4.1 and dependencies:
   ```bash
   npm install -D tailwindcss@3.4.1 postcss@^8 autoprefixer@^10
   ```   

## Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Custom Form Components

The application implements custom form components to enhance the user experience:

### CustomTextComponent

This component provides:
- Custom styling for text inputs
- Enhanced error animations
- Improved validation messaging
- Required field indicators
- Accessibility improvements

## Validation

The application implements several validation approaches:

1. **JSON Schema Validation**: Basic validation using JSON Schema properties
2. **Custom Validation**: Enhanced validation with custom error messages
3. **Real-time Validation**: Validates as users type or blur fields
4. **Submit Validation**: Full validation on form submission

Validation features include:
- Required field validation
- Format validation (email, phone, zipcode)
- Min/max length validation
- Pattern validation
- Conditional validation based on other field values

## UI/UX Considerations

The application uses a responsive design approach:

- **Mobile**: Stacked layout for smaller screens
- **Desktop**: Multi-column layout for larger screens
- **Tailwind CSS Classes**: Used for styling components
- **Error Animations**: Visual feedback for validation errors
- **Success Messages**: Confirmation on successful form submission

## Form Navigation

The application implements Angular routing to navigate between forms:

- `/form1` - Personal Information Form
- `/form2` - Product Information Form
- Default route redirects to form1

## Assumptions and Design Decisions

1. **Form Reset**: Forms automatically reset after successful submission with a delay to show success message
2. **Data Sanitization**: All input data is sanitized before processing
3. **Validation Strategy**: Using a hybrid approach of JSON Schema validation and custom validation
4. **Error Display**: Errors display below each field only after interaction or submission
5. **Responsive Design**: Design adapts to both mobile and desktop viewports
6. **Progressive Enhancement**: Form works even without JavaScript but enhanced with JS
7. **Form Submission**: Currently handles form submission within the components, in a real application would likely send to a backend API
8. **Local Storage**: Does not persist form data between sessions
9. **Field Dependencies**: Implemented conditional fields based on other field values
10. **Accessibility**: Forms are built with accessibility in mind (labels, required indicators, etc.)

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).
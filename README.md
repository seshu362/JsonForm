# Angular JSON Forms Application

This project is a responsive Angular application that demonstrates the implementation of dynamic forms using JSON Forms with custom validation and styling. The application features three distinct forms with different validation requirements, all built with a responsive design that works well on both mobile and desktop devices.

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

This application demonstrates how to create and validate complex forms in Angular using the JSON Forms library. It includes three sample forms:

1. **Personal Information Form**: Collects user personal details and address information
2. **Product Information Form**: Collects product details with conditional fields and supplier information
3. **Feedback Form**: Collects customer feedback with conditional priority field

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
- Multi-field layouts (horizontal and vertical arrangements)

## Project Structure
```
src/
├── app/
│ ├── components/
│ │ ├── form1/
│ │ │ ├── form1.component.ts
│ │ │ ├── form1.component.html
│ │ │ └── form1.component.css
│ │ ├── form2/
│ │ │ ├── form2.component.ts
│ │ │ ├── form2.component.html
│ │ │ └── form2.component.css
│ │ ├── form3/
│ │ │ ├── form3.component.ts
│ │ │ ├── form3.component.html
│ │ │ └── form3.component.css
│ │ └── shared/
│ │ ├── custom-renderers/
│ │ │ └── custom-text/
│ │ │ └── custom-text.component.ts
│ │ ├── custom-renderers.registry.ts
│ │ ├── json-schema.service.ts
│ │ └── types.ts
│ ├── app.component.html
│ └── app.routes.ts
```

## JSON Schema Structure

The application uses three different JSON schemas for form generation:

### 1. Personal Information Form Schema

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
### 2. Feedback Form Schema

```typescript
{
  userInfo: {
    name: string,           // Required, min length: 2
    email: string,          // Required, format: email
    phone: string,          // Optional, pattern: 10 digits
    customerType: string    // Required, enum of customer types
  },
  feedbackDetails: {
    subject: string,        // Required, min length: 3
    type: string,           // Required, enum of feedback types
    priority: string,       // Required for Bug reports
    message: string,        // Required, min length: 10
    attachFile: boolean     // Optional
  }
}
```

### 3. Product Information Form Schema

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
git clone <https://github.com/seshu362/JsonForm>
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
- Format-specific error messages (email, phone, zipcode)
- Blur and change validation triggers

## Validation

The application implements several validation approaches:

- **JSON Schema Validation**: Basic validation using JSON Schema properties
- **Custom Validation**: Enhanced validation with custom error messages
- **Real-time Validation**: Validates as users type or blur fields
- **Submit Validation**: Full validation on form submission
- **Conditional Validation**: Fields validate based on other field values

Validation features include:
- Required field validation
- Format validation (email, phone, zipcode)
- Min/max length validation
- Pattern validation
- Conditional validation (e.g., warranty period required for electronics)
- Custom error messages for different validation scenarios

## UI/UX Considerations

The application uses a responsive design approach:

- **Mobile**: Stacked layout for smaller screens
- **Desktop**: Multi-column layout for larger screens
- **Tailwind CSS Classes**: Used for styling components
- **Error Animations**: Visual feedback for validation errors (shake animation)
- **Success Messages**: Confirmation on successful form submission with fade-in animation
- **Conditional Fields**: Fields appear/disappear based on user selections
- **Read-only Fields**: Calculated fields (like total price) are displayed but not editable
- **Multi-line Text Areas**: For longer text input like descriptions and messages

## Form Navigation

The application implements Angular routing to navigate between forms:

- `/form1` - Personal Information Form
- `/form2` - Feedback Form
- `/form3` - Product Information Form
- Default route redirects to form1

Navigation is available through a persistent header with styled buttons.

## Assumptions and Design Decisions

- **Form Reset**: Forms automatically reset after successful submission with a delay to show success message
- **Data Sanitization**: All input data is sanitized before processing (trimming, case normalization, etc.)
- **Validation Strategy**: Using a hybrid approach of JSON Schema validation and custom validation
- **Error Display**: Errors display below each field only after interaction or submission
- **Responsive Design**: Design adapts to both mobile and desktop viewports with Tailwind responsive classes
- **Progressive Enhancement**: Form works even without JavaScript but enhanced with JS
- **Form Submission**: Currently handles form submission within the components, in a real application 
- **Local Storage**: Does not persist form data between sessions
- **Field Dependencies**: Implemented conditional fields based on other field values using JSON Forms rules
- **Accessibility**: Forms are built with accessibility in mind (proper labels, required indicators, focus states)
- **Performance**: Uses lazy loading for form components
- **State Management**: Uses JSON Forms' built-in state management with custom extensions
- **Error Messages**: Custom, user-friendly error messages specific to each field type
- **Visual Differentiation**: Each form has slightly different styling for visual distinction

This project was generated with Angular CLI.

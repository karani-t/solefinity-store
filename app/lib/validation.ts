import { NextResponse } from "next/server";

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationRuleBuilder {
  private rules: Map<string, Array<(value: any) => string | null>> = new Map();

  addRule(
    field: string,
    validator: (value: any) => string | null
  ): ValidationRuleBuilder {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(validator);
    return this;
  }

  validate(data: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, validators] of this.rules.entries()) {
      const value = data[field];
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors.push({ field, message: error });
          break;
        }
      }
    }

    return errors;
  }
}

// Common validators
export const validators = {
  required: (fieldName: string) => (value: any) =>
    !value || (typeof value === "string" && value.trim().length === 0)
      ? `${fieldName} is required`
      : null,

  email: (value: any) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Invalid email format"
      : null,

  minLength: (min: number, fieldName: string) => (value: any) =>
    typeof value === "string" && value.length < min
      ? `${fieldName} must be at least ${min} characters`
      : null,

  maxLength: (max: number, fieldName: string) => (value: any) =>
    typeof value === "string" && value.length > max
      ? `${fieldName} must not exceed ${max} characters`
      : null,

  minValue: (min: number, fieldName: string) => (value: any) =>
    typeof value === "number" && value < min
      ? `${fieldName} must be at least ${min}`
      : null,

  maxValue: (max: number, fieldName: string) => (value: any) =>
    typeof value === "number" && value > max
      ? `${fieldName} must not exceed ${max}`
      : null,

  integer: (fieldName: string) => (value: any) =>
    !Number.isInteger(value)
      ? `${fieldName} must be an integer`
      : null,

  phone: (fieldName: string) => (value: any) =>
    !/^(\+254|0)[0-9]{9}$/.test(value)
      ? `${fieldName} must be a valid Kenyan phone number (254... or 0...)`
      : null,

  url: (fieldName: string) => (value: any) => {
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  enum: (allowedValues: string[], fieldName: string) => (value: any) =>
    !allowedValues.includes(value)
      ? `${fieldName} must be one of: ${allowedValues.join(", ")}`
      : null,
};

// Error response builders
export function validationErrorResponse(errors: ValidationError[]) {
  return NextResponse.json(
    {
      error: "Validation failed",
      errors: errors.map((e) => ({ field: e.field, message: e.message })),
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundResponse(message: string = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflictResponse(message: string = "Conflict") {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function internalErrorResponse(
  message: string = "Internal server error",
  error?: any
) {
  if (error) {
    console.error("API Error:", error);
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

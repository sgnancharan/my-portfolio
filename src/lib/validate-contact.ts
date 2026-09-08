import type { ContactErrors, ContactFormState } from "@/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptyContactForm: ContactFormState = {
  name: "",
  email: "",
  intent: "",
  message: "",
};

export function validateContact(values: ContactFormState): ContactErrors {
  const errors: ContactErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Name needs at least two characters.";
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.intent.trim().length < 3) {
    errors.intent = "State a short intent (study, collab, systems, etc.).";
  }

  if (values.message.trim().length < 16) {
    errors.message = "Message needs at least 16 characters.";
  }

  return errors;
}

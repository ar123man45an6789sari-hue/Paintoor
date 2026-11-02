/* Shared auth types: roles, session shape and the signup field schema. */
export type Role = "customer" | "provider" | "shopkeeper";

export type AuthMode = "signup" | "login";

export type AuthStep = "entry" | "role" | "form" | "otp" | "done";
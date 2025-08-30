// Provide a basic module declaration for react-polymorphic-types
// This is necessary because the package does not ship its own types
// and a community-provided @types package does not exist.

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'react-polymorphic-types' {
  import React, { ElementType } from 'react';

  // This is a simplified declaration to satisfy the compiler.
  // We are typing it as `any` to avoid having to replicate the
  // entire complex type structure of the original library.
  export type PolymorphicPropsWithoutRef<P, T extends ElementType> = any;
}

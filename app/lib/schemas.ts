import { z } from 'zod';

// Mirrors MIN_NAME_LENGTH / MAX_NAME_LENGTH on the server.
const nameField = z.string().trim()
  .min(3, 'Name must be at least 3 characters.')
  .max(40, 'Name must be 40 characters or fewer.');

const jobRoleField = z.enum(['Developer', 'Test', 'Observer'], {
  error: 'Please select a role.',
});

export const joinSchema = z.object({
  name: nameField,
  jobRole: jobRoleField,
});

export const joinHostSchema = z.object({
  name: nameField,
});

export const profileSchema = z.object({
  name: nameField,
});

import { z } from 'zod';

const nameField = z.string().trim().min(3, 'Name must be at least 3 characters.');

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

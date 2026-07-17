/**
 * Reusable utility to merge Tailwind CSS class names.
 */
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

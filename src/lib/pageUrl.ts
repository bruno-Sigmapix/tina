export function getPageUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const slug = relativePath.replace(/\.mdx?$/i, "");

  if (slug.toLowerCase() === "home") {
    return base;
  }

  return `${base}${slug}`;
}

export function shouldInitializeClarity(pathname: string, basePath: string): boolean {
  const normalizedBasePath = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const adminPath = `${normalizedBasePath}/admin`;

  return pathname !== adminPath && !pathname.startsWith(`${adminPath}/`);
}

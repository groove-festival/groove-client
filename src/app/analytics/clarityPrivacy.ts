// 관리자 화면에는 신청자의 이름·학번·학과 같은 비공개 정보가 있으므로 직접
// 진입한 세션에서는 Clarity 자체를 로드하지 않는다. 공개 화면에서 SPA로
// 이동하는 예외에도 대비해 관리자 루트 DOM은 별도로 마스킹한다.
export function shouldInitializeClarity(pathname: string, basePath: string): boolean {
  const normalizedBasePath = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const adminPath = `${normalizedBasePath}/admin`;

  return pathname !== adminPath && !pathname.startsWith(`${adminPath}/`);
}

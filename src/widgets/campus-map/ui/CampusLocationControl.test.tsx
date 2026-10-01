import { render, screen } from "@testing-library/react";

import { CampusLocationControl } from "./CampusLocationControl";

describe("CampusLocationControl", () => {
  it("shows the requested permission denial message", () => {
    render(
      <CampusLocationControl
        boundaryStatus={null}
        onClick={() => {}}
        status="permission-denied"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("위치 권한을 허용해주세요");
  });

  it("shows the requested outside-campus message", () => {
    render(
      <CampusLocationControl
        boundaryStatus="outside"
        onClick={() => {}}
        status="tracking"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("캠퍼스 외부에 있어요");
  });

  it("prioritizes a temporary in-app message", () => {
    render(
      <CampusLocationControl
        boundaryStatus={null}
        onClick={() => {}}
        status="permission-denied"
        temporaryMessage="인앱 브라우저 안내"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("인앱 브라우저 안내");
    expect(screen.queryByText("위치 권한을 허용해주세요")).not.toBeInTheDocument();
  });
});

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

    expect(screen.getByRole("status")).toHaveTextContent("권한을 허용해 주세요");
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
});

import { fireEvent, render, screen } from "@testing-library/react";

import { PubMenuFormDialog } from "./PubMenuFormDialog";

const renderDialog = () => {
  const onSubmit = vi.fn();

  render(
    <PubMenuFormDialog
      initialDraft={{
        category: "MAIN",
        description: "",
        name: "짜파게티",
        options: [{ label: "불파게티로 변경", priceDelta: "1000" }],
        price: "5000",
        separateCharge: false,
      }}
      isPending={false}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
      title="메뉴 수정"
    />,
  );

  return { onSubmit };
};

describe("PubMenuFormDialog options", () => {
  it("adds, edits and removes option rows and submits the whole list", () => {
    const { onSubmit } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "옵션 추가" }));
    fireEvent.change(screen.getByLabelText("옵션 2 이름"), {
      target: { value: "메인 메뉴와 함께 주문했어요" },
    });
    fireEvent.change(screen.getByLabelText("옵션 2 가격 차이 (원)"), {
      target: { value: "-1000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "옵션 1 삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [{ label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 }],
      }),
    );
  });

  it("blocks saving an option without a label", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "옵션 추가" }));

    expect(screen.getByText("옵션 이름을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("stops offering new rows at ten options", () => {
    renderDialog();

    for (let count = 1; count < 10; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: "옵션 추가" }));
    }

    expect(screen.getByLabelText("옵션 10 이름")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "옵션 추가" })).not.toBeInTheDocument();
  });
});

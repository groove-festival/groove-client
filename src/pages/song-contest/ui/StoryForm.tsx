import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { personalInfoCollectionUrl, serviceTermsUrl } from "@/shared/config";
import { AgreementCheckbox } from "@/shared/ui";

import { colleges, storyFormSchema, type StoryFormValues } from "../model/storyForm";

interface StoryFormProps {
  isSubmitting?: boolean;
  onSubmit: (values: StoryFormValues) => Promise<void>;
  submitErrorMessage?: string;
}

const fieldClass =
  "peer h-[55px] w-full rounded-2xl border border-[#fcfcfc] bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-transparent focus:border-[#00ffff] aria-[invalid=true]:border-[#ff5b5b]";

const placeholder = (label: string) => (
  <span className="pointer-events-none absolute top-[18px] left-[23px] text-sm font-medium text-[#a2a2a2] opacity-0 peer-placeholder-shown:opacity-100">
    {label.endsWith(" *") ? (
      <>
        {label.slice(0, -2)} <span className="text-[#00ffff]">*</span>
      </>
    ) : (
      label
    )}
  </span>
);

export function StoryForm({
  isSubmitting = false,
  onSubmit,
  submitErrorMessage,
}: StoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      department: "",
      studentNumber: "",
      name: "",
      nickname: "",
      title: "",
      content: "",
      termsAgreed: false,
      personalInfoCollectionAgreed: false,
    },
  });
  const college = watch("college");
  const termsAgreed = watch("termsAgreed");
  const personalInfoCollectionAgreed = watch("personalInfoCollectionAgreed");

  const input = (
    name: "department" | "studentNumber" | "name" | "nickname" | "title",
    label: string,
    maxLength?: number,
  ) => (
    <div className="relative">
      <input
        {...register(name)}
        aria-invalid={!!errors[name]}
        aria-label={label}
        className={fieldClass}
        maxLength={maxLength}
        placeholder=" "
        type="text"
      />
      {placeholder(label)}
      {errors[name] && (
        <p className="mt-1 text-xs text-[#ff9ab0]" role="alert">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  return (
    <section aria-labelledby="story-form-heading" className="mx-auto mt-20 w-full px-0">
      <h1 className="text-2xl font-bold" id="story-form-heading">
        사연 신청하기
      </h1>
      <p className="mt-1 text-xs leading-[15px] text-[#a2a2a2]">
        *한 계정당 하나의 사연만 등록 가능
      </p>
      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            단대 선택 <span className="text-[#00ffff]">*</span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {colleges.map((item) => (
              <button
                aria-pressed={college === item}
                className={`h-14 rounded-2xl border text-sm font-semibold ${college === item ? "border-[#ff0080] bg-[#ff0080]" : "border-[#fcfcfc]"}`}
                key={item}
                onClick={() => setValue("college", item, { shouldValidate: true })}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          {errors.college && (
            <p className="mt-1 text-xs text-[#ff9ab0]" role="alert">
              {errors.college.message}
            </p>
          )}
        </fieldset>
        {input("department", "학과 *", 60)}
        {input("studentNumber", "학번 *", 20)}
        {input("name", "이름 *", 30)}
        {input("nickname", "별명 (미입력 시 본명으로 사연 소개)", 30)}
        {input("title", "사연 제목 *", 40)}
        <div className="relative">
          <textarea
            {...register("content")}
            aria-invalid={!!errors.content}
            aria-label="사연 내용 *"
            className={`${fieldClass} h-[280px] resize-none py-[18px]`}
            maxLength={500}
            placeholder=" "
          />
          {placeholder("사연 내용 *")}
          {errors.content && (
            <p className="mt-1 text-xs text-[#ff9ab0]" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-[#3a3a3a] bg-[#232323] p-4">
          <AgreementCheckbox
            accent="pink"
            inputId="story-terms-agreed"
            label="GROOVE 웹서비스 이용약관에 동의합니다."
            linkHref={serviceTermsUrl}
            linkLabel="약관 전문 보기"
            {...register("termsAgreed")}
          />
          <AgreementCheckbox
            accent="pink"
            inputId="story-personal-info-collection-agreed"
            label="개인정보 수집 및 이용에 동의합니다."
            linkHref={personalInfoCollectionUrl}
            linkLabel="동의서 전문 보기"
            {...register("personalInfoCollectionAgreed")}
          />
        </div>
        {errors.termsAgreed && (
          <p className="-mt-4 text-xs leading-[15px] text-[#ff5b5b]" role="alert">
            {errors.termsAgreed.message}
          </p>
        )}
        {errors.personalInfoCollectionAgreed && (
          <p className="-mt-4 text-xs leading-[15px] text-[#ff5b5b]" role="alert">
            {errors.personalInfoCollectionAgreed.message}
          </p>
        )}
        {submitErrorMessage && (
          <p className="text-xs leading-[15px] text-[#ff5b5b]" role="alert">
            {submitErrorMessage}
          </p>
        )}
        <button
          className="h-14 rounded-2xl bg-[#ff0080] text-base font-semibold disabled:cursor-not-allowed disabled:bg-[#cfcfcf]"
          disabled={isSubmitting || !termsAgreed || !personalInfoCollectionAgreed}
          type="submit"
        >
          사연 접수하기
        </button>
      </form>
    </section>
  );
}

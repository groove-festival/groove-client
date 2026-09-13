const privacyPolicyUrl =
  "https://knu-cse-sysdev.notion.site/festival-personal-info-processing-policy";
const serviceTermsUrl = "https://knu-cse-sysdev.notion.site/festival-terms-of-services";
const personalInfoCollectionUrl =
  "https://knu-cse-sysdev.notion.site/festival-personal-information-collection-and-use-consent";
const emailHarvestingProhibitedUrl =
  "https://knu-cse-sysdev.notion.site/email-address-harvesting-prohibited";

export const songRequestAgreementLinks = {
  serviceTermsUrl,
  personalInfoCollectionUrl,
} as const;

export const playlistFooterLinks = [
  { label: "개인정보처리방침", href: privacyPolicyUrl },
  { label: "서비스 이용약관", href: serviceTermsUrl },
  { label: "이메일무단수집거부", href: emailHarvestingProhibitedUrl },
] as const;

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import {
  authQueryKeys,
  isGoogleParticipant,
  useAuthMe,
  useLoginWithGoogle,
} from "@/entities/auth";
import { type StagePhase } from "@/entities/festival";
import { googleLoginErrorMessage } from "@/features/google-auth";
import { ApiError } from "@/shared/api";

import {
  toSubmitContestStoryBody,
  useSubmitContestStory,
} from "../api/submitContestStory";
import { contestStorySubmitErrorMessage } from "./contestStoryErrorMessages";
import { type StoryFormValues } from "./storyForm";

type StoryView = "intro" | "form" | "success";

export const useStorySubmission = (storyPhase: StagePhase | undefined) => {
  const queryClient = useQueryClient();
  const auth = useAuthMe();
  const login = useLoginWithGoogle();
  const submitStory = useSubmitContestStory();
  const [view, setView] = useState<StoryView>("intro");
  const [guideOpen, setGuideOpen] = useState(false);
  const guideOpenRef = useRef(false);
  const guideVersionRef = useRef(0);
  const [hasGoogleLogin, setHasGoogleLogin] = useState(false);
  const [requiresGoogleLogin, setRequiresGoogleLogin] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>();
  const canWriteStory =
    hasGoogleLogin || (!requiresGoogleLogin && isGoogleParticipant(auth.data));
  const effectiveView =
    storyPhase === "OPEN" && (view !== "form" || canWriteStory) ? view : "intro";
  const loginWithGoogle = login.mutate;

  const handleGoogleCredential = useCallback(
    (idToken: string) => {
      const guideVersion = guideVersionRef.current;
      loginWithGoogle(idToken, {
        onSuccess: () => {
          if (!guideOpenRef.current || guideVersion !== guideVersionRef.current) return;
          guideOpenRef.current = false;
          setHasGoogleLogin(true);
          setRequiresGoogleLogin(false);
          setSubmitErrorMessage(undefined);
          setGuideOpen(false);
          setView("form");
        },
      });
    },
    [loginWithGoogle],
  );

  const handleCloseGuide = useCallback(() => {
    guideOpenRef.current = false;
    setGuideOpen(false);
  }, []);
  const handleContinueToForm = useCallback(() => {
    guideOpenRef.current = false;
    setGuideOpen(false);
    setView("form");
  }, []);
  const handleOpenGuide = () => {
    setSubmitErrorMessage(undefined);
    submitStory.reset();
    login.reset();
    guideVersionRef.current += 1;
    guideOpenRef.current = true;
    setGuideOpen(true);
  };

  const handleSubmit = async (values: StoryFormValues) => {
    if (submitStory.isPending || storyPhase !== "OPEN" || !canWriteStory) return;
    setSubmitErrorMessage(undefined);
    try {
      await submitStory.mutateAsync(toSubmitContestStoryBody(values));
      setView("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiError && error.code === "C003") {
        void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
        setHasGoogleLogin(false);
        setRequiresGoogleLogin(true);
        setView("intro");
        login.reset();
        guideVersionRef.current += 1;
        guideOpenRef.current = true;
        setGuideOpen(true);
      }
      setSubmitErrorMessage(contestStorySubmitErrorMessage(error));
    }
  };

  return {
    effectiveView,
    canWriteStory,
    guideOpen: guideOpen && storyPhase === "OPEN",
    authError: auth.isError,
    authPending: auth.isPending,
    wrongRole: auth.data?.loggedIn === true && auth.data.role !== "USER",
    isLoginPending: login.isPending,
    loginErrorMessage:
      login.error == null
        ? requiresGoogleLogin
          ? submitErrorMessage
          : undefined
        : googleLoginErrorMessage(login.error),
    isSubmitting: submitStory.isPending,
    submitErrorMessage,
    handleGoogleCredential,
    handleCloseGuide,
    handleContinueToForm,
    handleOpenGuide,
    handleRetryAuth: () => void auth.refetch(),
    handleSubmit,
    showIntro: () => setView("intro"),
  };
};

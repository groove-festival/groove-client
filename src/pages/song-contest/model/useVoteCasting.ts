import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { isGoogleParticipant, useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import { contestQueryKeys, type Vote, useVotes } from "@/entities/contest";
import { googleLoginErrorMessage } from "@/features/google-auth";
import {
  getIsSafariBrowser,
  getRestrictedInAppBrowser,
} from "@/shared/lib/in-app-browser";

import { useMyBallots } from "../api/getMyBallots";
import { songContestQueryKeys } from "../api/queryKeys";
import { useSubmitBallot } from "../api/submitBallot";
import { submitBallotErrorMessage } from "./submitBallotErrorMessage";
import { useContestLocationGate } from "./useContestLocationGate";

type CastingTab = "cast" | "mine";

export const useVoteCasting = () => {
  const [tab, setTab] = useState<CastingTab>("cast");
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [confirmVote, setConfirmVote] = useState<Vote | undefined>();

  const [completedParticipantName, setCompletedParticipantName] = useState<
    string | undefined
  >();
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);
  const googleGuideOpenRef = useRef(false);
  const googleGuideVersionRef = useRef(0);
  const [pendingSelection, setPendingSelection] = useState<
    { vote: Vote; voteParticipantId: number } | undefined
  >();
  const [restrictedInAppBrowser] = useState(() => getRestrictedInAppBrowser());
  const [safariBrowser] = useState(getIsSafariBrowser);

  const queryClient = useQueryClient();
  const location = useContestLocationGate(restrictedInAppBrowser === null);
  const auth = useAuthMe();

  const isLoggedIn = isGoogleParticipant(auth.data);
  const votesQuery = useVotes();
  const myBallotsQuery = useMyBallots(isLoggedIn);
  const submitBallot = useSubmitBallot();
  const loginWithGoogle = useLoginWithGoogle();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const myBallotByVoteId = new Map(
    (myBallotsQuery.data ?? []).map((ballot) => [
      ballot.singingVoteId,
      ballot.voteParticipantId,
    ]),
  );

  const votes = votesQuery.data ?? [];
  const castableVotes = votes.filter(
    (vote) =>
      vote.status === "OPEN" &&
      vote.participants.length > 0 &&
      !myBallotByVoteId.has(vote.singingVoteId),
  );
  const myVotes = votes.filter((vote) => myBallotByVoteId.has(vote.singingVoteId));

  const handleSelectParticipant = (vote: Vote, voteParticipantId: number) => {
    if (!isLoggedIn) {
      setPendingSelection({ vote, voteParticipantId });
      loginWithGoogle.reset();
      googleGuideVersionRef.current += 1;
      googleGuideOpenRef.current = true;
      setShowGoogleGuide(true);
      return;
    }
    setSelected((prev) => ({ ...prev, [vote.singingVoteId]: voteParticipantId }));
  };

  const applyPendingSelection = () => {
    if (!pendingSelection || !googleGuideOpenRef.current) return;
    setSelected((prev) => ({
      ...prev,
      [pendingSelection.vote.singingVoteId]: pendingSelection.voteParticipantId,
    }));
    setPendingSelection(undefined);
    googleGuideOpenRef.current = false;
    setShowGoogleGuide(false);
  };

  const handleConfirm = () => {
    if (!confirmVote || submitBallot.isPending) return;
    const voteParticipantId = selected[confirmVote.singingVoteId];
    if (voteParticipantId === undefined) return;
    const participantName =
      confirmVote.participants.find((p) => p.voteParticipantId === voteParticipantId)
        ?.name ?? "";

    submitBallot.mutate(
      {
        singingVoteId: confirmVote.singingVoteId,
        voteParticipantId,
        idempotencyKey: crypto.randomUUID(),
      },
      {
        onSuccess: () => {
          setConfirmVote(undefined);
          setCompletedParticipantName(participantName);
          setSelected((prev) => {
            const next = { ...prev };
            delete next[confirmVote.singingVoteId];
            return next;
          });
        },

        onError: () => {
          void queryClient.invalidateQueries({ queryKey: contestQueryKeys.votes() });
          void queryClient.invalidateQueries({
            queryKey: songContestQueryKeys.myBallots(),
          });
        },
      },
    );
  };

  return {
    tab,
    setTab,
    now,
    selected,
    confirmVote,
    completedParticipantName,
    showGoogleGuide,
    restrictedInAppBrowser,
    safariBrowser,
    location,
    castableVotes,
    myVotes,
    myBallotByVoteId,
    voteErrorMessage: submitBallot.isError
      ? submitBallotErrorMessage(submitBallot.error)
      : undefined,
    isSubmitting: submitBallot.isPending,
    isLoginPending: loginWithGoogle.isPending,
    loginErrorMessage:
      loginWithGoogle.error == null
        ? undefined
        : googleLoginErrorMessage(loginWithGoogle.error),
    handleSelectParticipant,
    handleConfirm,
    openConfirm: (vote: Vote) => {
      submitBallot.reset();
      setConfirmVote(vote);
    },
    closeConfirm: () => setConfirmVote(undefined),
    closeCompleted: () => setCompletedParticipantName(undefined),
    closeGoogleGuide: () => {
      googleGuideOpenRef.current = false;
      setShowGoogleGuide(false);
      setPendingSelection(undefined);
    },
    handleGoogleCredential: (idToken: string) => {
      const guideVersion = googleGuideVersionRef.current;
      loginWithGoogle.mutate(idToken, {
        onSuccess: () => {
          if (guideVersion === googleGuideVersionRef.current) applyPendingSelection();
        },
      });
    },
  };
};

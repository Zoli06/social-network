import React, { useEffect } from "react";
import "./MessageActions.scss";
import { gql, useMutation } from "@apollo/client";
import Twemoji from "react-twemoji";
import { v4 as uuidv4 } from "uuid";

import { IGroupQueryGQLData } from "./Group";

const VOTE_MUTATION = gql`
  mutation VoteMutation($messageId: ID!, $type: VoteType) {
    createVote(messageId: $messageId, type: $type)
  }
`;

const REACTION_MUTATION = gql`
  mutation ReactionMutation($messageId: ID!, $type: Int) {
    createReaction(messageId: $messageId, type: $type) {
      type
    }
  }
`;

const MESSAGE_VOTED_SUBSCRIPTION = gql`
  subscription MessageVoted($messageId: ID!) {
    messageVoted(messageId: $messageId) {
      upVotes
      downVotes
    }
  }
`;

const MESSAGE_REACTED_SUBSCRIPTION = gql`
  subscription MessageReacted($messageId: ID!) {
    messageReacted(messageId: $messageId) {
      type
    }
  }
`;

export const MessageActions = ({
  messageData: {
    upVotes,
    downVotes,
    responsesCount,
    messageId,
    vote,
    reactions,
    reaction,
  },
  subscribeToMore,
  messageVotedUpdateFunc,
  messageReactedUpdateFunc,
}: IMessageActionsProps) => {
  const [voteMutation] = useMutation(VOTE_MUTATION, {
    update(cache, { data: { createVote } }) {
      cache.modify({
        id: cache.identify({ __typename: "Message", messageId }),
        fields: {
          vote: () => createVote,
        },
      });
    },
  });

  const [reactionMutation] = useMutation(REACTION_MUTATION, {
    update(cache, { data: { createReaction } }) {
      cache.modify({
        id: cache.identify({ __typename: "Message", messageId }),
        fields: {
          reaction: () => createReaction,
        },
      });
    },
  });

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_VOTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: IGroupQueryGQLData,
        { subscriptionData }: IMessageVotedSubscriptionData
      ) => messageVotedUpdateFunc(prev, { subscriptionData }, messageId),
    });

    subscribeToMore({
      document: MESSAGE_REACTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: IGroupQueryGQLData,
        { subscriptionData }: IMessageReactedSubscriptionData
      ) => messageReactedUpdateFunc(prev, { subscriptionData }, messageId),
    });
  }, [
    subscribeToMore,
    messageId,
    messageVotedUpdateFunc,
    messageReactedUpdateFunc,
  ]);

  const possibleReactions = ["👍", "❤", "🥰", "🤣", "😲", "😢", "😠"];

  const handleVote = (newVote: string | null) => {
    if (vote === newVote) newVote = null;
    voteMutation({ variables: { messageId, type: newVote } });
  };

  const handleAddReaction = (newVote: string | null) => {
    reactionMutation({
      variables: { messageId, type: newVote ? newVote.codePointAt(0) : null },
    });
  };

  return (
    <div className="message-actions">
      <svg
        className={`upvote icon ${vote === "up" ? "active" : ""}`}
        onClick={() => handleVote("up")}
      >
        <use
          href={`./assets/images/svg-bundle.svg#upvote${
            vote === "up" ? "-active" : ""
          }`}
        />
      </svg>
      <p className="upvote-count">{upVotes}</p>
      <svg
        className={`downvote icon ${vote === "down" ? "active" : ""}`}
        onClick={() => handleVote("down")}
      >
        <use
          href={`./assets/images/svg-bundle.svg#downvote${
            vote === "down" ? "-active" : ""
          }`}
        />
      </svg>
      <p className="downvote-count">{downVotes}</p>
      <svg className="response icon">
        <use href="./assets/images/svg-bundle.svg#response" />
      </svg>
      <p className="responses-count">{responsesCount}</p>
      <div className="space-holder" />
      <div className="reactions-container">
        <Twemoji noWrapper>
          <div className="common-reactions">
            {[...new Set(reactions.map((reaction) => reaction.type))]
              .slice(0, 3)
              .map((reactionType) => (
                <div className="common-reaction-emoji" key={uuidv4()}>
                  {String.fromCodePoint(reactionType)}
                </div>
              ))}
          </div>
        </Twemoji>
        <div className="add-reaction-container">
          <div className="add-reaction-button">
            <div className="space-holder" />
            {reaction ? (
              <div className="add-reaction-icon icon user-have-reaction">
                <Twemoji options={{ className: "icon" }} noWrapper>
                  <span>{String.fromCodePoint(reaction.type)}</span>
                  <svg
                    className="remove-reaction icon"
                    onClick={() => handleAddReaction(null)}
                  >
                    <use href="./assets/images/svg-bundle.svg#close-button" />
                  </svg>
                </Twemoji>
              </div>
            ) : (
              <svg className="add-reaction-icon icon">
                <use href="./assets/images/svg-bundle.svg#plus" />
              </svg>
            )}
          </div>
          <div className="add-reaction-popup">
            <Twemoji
              options={{ className: "add-reaction-popup-emoji" }}
              noWrapper
            >
              {possibleReactions.map((reaction) => (
                <span
                  key={uuidv4()}
                  onClick={() => handleAddReaction(reaction)}
                >
                  {reaction}
                </span>
              ))}
            </Twemoji>
          </div>
        </div>
      </div>
    </div>
  );
};

MessageActions.fragments = {
  message: gql`
    fragment MessageActions on Message {
      upVotes
      downVotes
      responsesCount
      vote
      reactions {
        type
      }
      reaction {
        type
      }
    }
  `,
};

export interface IMessageVotedSubscriptionData {
  subscriptionData: {
    data: { messageVoted: { upVotes: number; downVotes: number } };
  };
}

export interface IMessageReactedSubscriptionData {
  subscriptionData: {
    data: { messageReacted: number }
  }
}

export interface IMessageActionsGQLData {
  upVotes: number;
  downVotes: number;
  responsesCount: number;
  messageId: string;
  vote: string;
  reactions: {
    type: number;
  }[];
  reaction: {
    type: number;
  } | null;
}

export interface IMessageActionsProps {
  messageData: IMessageActionsGQLData;
  subscribeToMore: Function;
  messageVotedUpdateFunc: Function;
  messageReactedUpdateFunc: Function;
}

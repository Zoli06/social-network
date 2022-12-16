import { useEffect } from "react";
import "./MessageActions.scss";
import { gql, useMutation } from "@apollo/client";
import Twemoji from "react-twemoji";
import { v4 as uuidv4 } from "uuid";
import { openEditor } from "../Editor/Editor";
import { GroupQueryGQLData } from "../Group/Group";
import { MessageGQLData } from "./Message";


const ADD_RESPONSE_MUTATION = gql`
  mutation AddResponseMutation($message: MessageInput!) {
    sendMessage(message: $message) {
      messageId
    }
  }
`;

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
  message: {
    messageId,
    upVotes,
    downVotes,
    responsesCount,
    vote,
    reactions,
    reaction,
    group: { groupId },
  },
  subscribeToMore,
}: MessageActionsProps) => {
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

  const [addResponseMutation] = useMutation(ADD_RESPONSE_MUTATION);

  useEffect(() => {
    subscribeToMore({
      document: MESSAGE_VOTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: GroupQueryGQLData,
        { subscriptionData }: MessageVotedSubscriptionData
      ) => {
        if (!subscriptionData.data) return prev;
        const { messageVoted } = subscriptionData.data;
        return {
          ...prev,
          group: {
            ...prev.group,
            messages: prev.group.messages.map((message: MessageGQLData) => {
              if (message.messageId === messageId) {
                return {
                  ...message,
                  upVotes: messageVoted.upVotes,
                  downVotes: messageVoted.downVotes,
                };
              } else {
                return message;
              }
            }),
          },
        };
      },
    });

    subscribeToMore({
      document: MESSAGE_REACTED_SUBSCRIPTION,
      variables: {
        messageId,
      },
      updateQuery: (
        prev: GroupQueryGQLData,
        { subscriptionData }: MessageReactedSubscriptionData
      ) => {
        if (!subscriptionData.data) return prev;
        const { messageReacted } = subscriptionData.data;
        return {
          ...prev,
          group: {
            ...prev.group,
            messages: prev.group.messages.map((message: MessageGQLData) => {
              if (message.messageId === messageId) {
                return {
                  ...message,
                  reactions: messageReacted,
                };
              } else {
                return message;
              }
            }),
          },
        };
      },
    });
  }, [subscribeToMore, messageId]);

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

  const handleAddResponse = (text: string) => {
    addResponseMutation({
      variables: {
        message: {
          text,
          responseToMessageId: messageId,
          groupId,
        }
      }
    });
  };

  return (
    <div className="message-actions">
      <svg
        className={`upvote icon ${vote === "up" ? "active" : ""}`}
        onClick={() => handleVote("up")}
      >
        <use
          href={`/assets/images/svg-bundle.svg#upvote${vote === "up" ? "-active" : ""
            }`}
        />
      </svg>
      <p className="upvote-count">{upVotes}</p>
      <svg
        className={`downvote icon ${vote === "down" ? "active" : ""}`}
        onClick={() => handleVote("down")}
      >
        <use
          href={`/assets/images/svg-bundle.svg#downvote${vote === "down" ? "-active" : ""
            }`}
        />
      </svg>
      <p className="downvote-count">{downVotes}</p>
      <svg
        className="response icon"
        onClick={() => openEditor(handleAddResponse)}
      >
        <use href="/assets/images/svg-bundle.svg#response" />
      </svg>
      <p className="responses-count">{responsesCount}</p>
      <div className="space-holder" />
      <div className="reactions-container">
        <Twemoji noWrapper>
          <div className="common-reactions">
            {[...new Set(reactions.map((reaction) => reaction.type))]
              .slice(0, 2)
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
                </Twemoji>
              </div>
            ) : (
              <svg className="add-reaction-icon icon">
                <use href="/assets/images/svg-bundle.svg#plus" />
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
            {reaction && (
              <svg
                className="remove-reaction add-reaction-popup-emoji icon"
                onClick={() => handleAddReaction(null)}
              >
                <use href="/assets/images/svg-bundle.svg#close-button-3" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type MessageVotedSubscriptionData = {
  subscriptionData: {
    data: { messageVoted: { upVotes: number; downVotes: number } };
  };
};

type MessageReactedSubscriptionData = {
  subscriptionData: {
    data: { messageReacted: number };
  };
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
      group {
        groupId
      }
    }
  `,
};

export type MessageActionsGQLData = {
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
  group: {
    groupId: string;
  };
};

type MessageActionsProps = {
  message: MessageActionsGQLData;
  subscribeToMore: Function;
};
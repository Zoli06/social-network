import { gql, useLazyQuery } from '@apollo/client';
import { Messages, MessagesGQLData } from '../Messages/Messages';
import { useEffect, useState } from 'react';
import { Tabs } from 'react-daisyui';
import { cache } from '../../index';

const HomeMessagesCategory = ({
  title,
  messages,
  subscribeToMore,
}: {
  title?: string;
  messages: HomeMessagesGQLData[];
  subscribeToMore: Function;
}) => {
  return (
    <div>
      {title && (
        <h1 className='text-3xl font-bold text-center mb-2'>{title}</h1>
      )}
      <Messages
        messages={messages}
        subscribeToMore={subscribeToMore}
        queriedDepth={0}
        maxDepth={0}
        maxDisplayedResponses={0}
        renderAsLink={true}
      />
    </div>
  );
};

export const HomeMessages = ({
  topMessages,
  trendingMessages,
  subscribeToMore,
  topMessagesLimit,
  trendingMessagesLimit,
  topMessagesOffset,
  trendingMessagesOffset,
}: HomeMessagesProps) => {
  const fetchWhenScrollingTo = 0.8;

  const [fetchMoreTopMessages] = useLazyQuery(FetchMoreTopMessages);
  const [fetchMoreTrendingMessages] = useLazyQuery(FetchMoreTrendingMessages);
  const [noMoreTopMessages, setNoMoreTopMessages] = useState(false);
  const [noMoreTrendingMessages, setNoMoreTrendingMessages] = useState(false);

  const [currentTopMessagesOffset, setCurrentTopMessagesOffset] =
    useState(topMessagesOffset);
  const [currentTrendingMessagesOffset, setCurrentTrendingMessagesOffset] =
    useState(trendingMessagesOffset);

  const tabs = [
    {
      label: 'Top posts',
      content: (
        <HomeMessagesCategory
          messages={topMessages}
          subscribeToMore={subscribeToMore}
        />
      ),
    },
    {
      label: 'Trending posts',
      content: (
        <HomeMessagesCategory
          messages={trendingMessages}
          subscribeToMore={subscribeToMore}
        />
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  // Fetch more messages when the user scrolls to the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight * fetchWhenScrollingTo
      ) {
        if (activeTab === 0) {
          const newOffset = currentTopMessagesOffset + topMessagesLimit;

          if (noMoreTopMessages) return;

          fetchMoreTopMessages({
            variables: {
              offset: newOffset,
              limit: topMessagesLimit,
            },
            onCompleted: (data) => {
              cache.modify({
                fields: {
                  topMessages(existingMessages = []) {
                    const newMessages = data.topMessages.filter(
                      (newMessage: any) => {
                        return !existingMessages.some(
                          (existingMessage: any) =>
                            existingMessage.messageId === newMessage.messageId
                        );
                      }
                    );

                    if (newMessages.length === 0) {
                      setNoMoreTopMessages(true);
                    }

                    return [...existingMessages, ...newMessages];
                  },
                },
              });
              setCurrentTopMessagesOffset(newOffset);
            },
          });
        } else {
          const newOffset = currentTrendingMessagesOffset + trendingMessagesLimit;

          if (noMoreTrendingMessages) return;

          fetchMoreTrendingMessages({
            variables: {
              offset: newOffset,
              limit: trendingMessagesLimit,
            },
            onCompleted: (data) => {
              cache.modify({
                fields: {
                  trendingMessages(existingMessages = []) {
                    const newMessages = data.trendingMessages.filter(
                      (newMessage: any) => {
                        return !existingMessages.some(
                          (existingMessage: any) =>
                            existingMessage.messageId === newMessage.messageId
                        );
                      }
                    );

                    if (newMessages.length === 0) {
                      setNoMoreTrendingMessages(true);
                    }

                    return [...existingMessages, ...newMessages];
                  },
                },
              });
              setCurrentTrendingMessagesOffset(newOffset);
            },
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    activeTab,
    currentTopMessagesOffset,
    currentTrendingMessagesOffset,
    fetchMoreTopMessages,
    fetchMoreTrendingMessages,
    noMoreTopMessages,
    noMoreTrendingMessages,
    topMessagesLimit,
    trendingMessagesLimit,
  ]);

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value)}
        variant='bordered'
        size='lg'
        className='flex flex-row'
      >
        {tabs.map((tab, index) => (
          <Tabs.Tab key={index} value={index} className='flex-grow'>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs>
      {tabs[activeTab].content}
    </>
  );
};

HomeMessages.fragments = {
  message: gql`
    fragment HomeMessages on Message {
      messageId
      ...Messages
    }

    ${Messages.fragments.message}
  `,
};

const FetchMoreTopMessages = gql`
  query FetchMoreTopMessages($offset: Int!, $limit: Int!) {
    topMessages(limit: $limit, offset: $offset) {
      messageId
      ...HomeMessages
    }
  }
  ${HomeMessages.fragments.message}
`;

const FetchMoreTrendingMessages = gql`
  query FetchMoreTrendingMessages($offset: Int!, $limit: Int!) {
    trendingMessages(limit: $limit, offset: $offset) {
      messageId
      ...HomeMessages
    }
  }
  ${HomeMessages.fragments.message}
`;

export type HomeMessagesGQLData = {
  messageId: string;
} & MessagesGQLData;

export type HomeMessagesProps = {
  topMessages: HomeMessagesGQLData[];
  trendingMessages: HomeMessagesGQLData[];
  subscribeToMore: Function;
  topMessagesLimit: number;
  trendingMessagesLimit: number;
  topMessagesOffset: number;
  trendingMessagesOffset: number;
};

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

  const [topMessagesPage, setTopMessagesPage] = useState(1);
  const [trendingMessagesPage, setTrendingMessagesPage] = useState(1);

  const [isFetching, setIsFetching] = useState(false);

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

  useEffect(() => {
    fetchMoreTopMessages({
      variables: {
        offset: topMessagesPage * topMessagesLimit + topMessagesOffset,
        limit: topMessagesLimit,
      },
      onCompleted: (data) => {
        cache.modify({
          fields: {
            topMessages(existingMessages = []) {
              const newMessages = data.topMessages.filter((newMessage: any) => {
                return !existingMessages.some(
                  (existingMessage: any) =>
                    existingMessage.messageId === newMessage.messageId
                );
              });

              if (newMessages.length === 0) {
                setNoMoreTopMessages(true);
              }

              setIsFetching(false);
              return [...existingMessages, ...newMessages];
            },
          },
        });

      },
    });
  }, [
    fetchMoreTopMessages,
    noMoreTopMessages,
    topMessagesLimit,
    topMessagesOffset,
    topMessagesPage,
  ]);

  useEffect(() => {
    fetchMoreTrendingMessages({
      variables: {
        offset:
          trendingMessagesPage * trendingMessagesLimit + trendingMessagesOffset,
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

              setIsFetching(false);
              return [...existingMessages, ...newMessages];
            },
          },
        });

      },
    });
  }, [
    fetchMoreTrendingMessages,
    noMoreTrendingMessages,
    trendingMessagesLimit,
    trendingMessagesOffset,
    trendingMessagesPage,
  ]);

  // Fetch more messages when the user scrolls to the bottom of the page
  // BUG: after a few fetch no more message fetched
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const scrollPosition = scrollTop + clientHeight;
      const scrollPercentage = scrollPosition / scrollHeight;

      if (scrollPercentage > fetchWhenScrollingTo && !isFetching) {
        setIsFetching(true);

        if (activeTab === 0) {
          setTopMessagesPage(topMessagesPage + 1);
        } else {
          setTrendingMessagesPage(trendingMessagesPage + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, fetchWhenScrollingTo, isFetching, topMessagesPage, trendingMessagesPage]);

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

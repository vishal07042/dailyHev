import React, { forwardRef, ReactElement, Ref, useRef, useState } from 'react';
import ActionButtons from './ActionButtons';
import { SharedPostText } from '../SharedPostText';
import { SharedPostCardFooter } from '../SharedPostCardFooter';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { useFeedPreviewMode } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import { PostCardHeader } from './PostCardHeader';
import SquadHeaderPicture from '../common/SquadHeaderPicture';

export const SharePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onShareClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type } = post;
  const onPostCardClick = () => onPostClick(post);
  const [isSharedPostShort, setSharedPostShort] = useState(true);
  const containerRef = useRef<HTMLDivElement>();
  const onSharedPostTextHeightChange = (height: number) => {
    if (!containerRef.current) {
      return;
    }
    setSharedPostShort(containerRef.current.offsetHeight - height < 40);
  };
  const isFeedPreview = useFeedPreviewMode();
  const isVideoType = isVideoPost(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
    >
      <PostCardHeader
        post={post}
        onMenuClick={(event) => onMenuClick?.(event, post)}
        metadata={{
          topLabel: enableSourceHeader ? post.source.name : post.author.name,
          bottomLabel: enableSourceHeader
            ? post.author.name
            : `@${post.sharedPost?.source.handle}`,
        }}
      >
        <SquadHeaderPicture
          author={post.author}
          source={post.source}
          reverse={!enableSourceHeader}
        />
      </PostCardHeader>
      <SharedPostText
        title={post.title}
        onHeightChange={onSharedPostTextHeightChange}
      />
      <Container ref={containerRef} className="min-h-0 justify-end">
        <SharedPostCardFooter
          sharedPost={post.sharedPost}
          isShort={isSharedPostShort}
          isVideoType={isVideoType}
        />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onShareClick={onShareClick}
          onBookmarkClick={onBookmarkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});

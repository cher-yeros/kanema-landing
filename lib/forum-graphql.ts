import { gql } from "@apollo/client";

export const FORUM_COMMUNITY_FIELDS = gql`
  fragment ForumCommunityFields on ForumCommunity {
    id
    slug
    name
    description
    cover_url
    icon_url
    rules_md
    member_count
    is_active
    display_order
  }
`;

export const FORUM_THREAD_FIELDS = gql`
  fragment ForumThreadFields on ForumThread {
    id
    community_id
    category_id
    author_id
    title
    body_md
    status
    accepted_reply_id
    score
    reply_count
    view_count
    hot_score
    is_featured
    user_vote
    createdAt
    updatedAt
    author {
      id
      full_name
    }
    author_profile {
      avatar_url
      reputation_tier
    }
    tags {
      id
      slug
      name
    }
    community {
      slug
      name
      icon_url
    }
  }
`;

export const FORUM_REPLY_FIELDS = gql`
  fragment ForumReplyFields on ForumReply {
    id
    thread_id
    parent_reply_id
    author_id
    body_md
    depth
    score
    status
    user_vote
    createdAt
    author {
      id
      full_name
    }
    author_profile {
      avatar_url
      reputation_tier
    }
  }
`;

export const FORUM_COMMUNITIES_QUERY = gql`
  query ForumCommunities($activeOnly: Boolean) {
    forumCommunities(activeOnly: $activeOnly) {
      ...ForumCommunityFields
    }
  }
  ${FORUM_COMMUNITY_FIELDS}
`;

export const FORUM_COMMUNITY_QUERY = gql`
  query ForumCommunity($slug: String!) {
    forumCommunity(slug: $slug) {
      ...ForumCommunityFields
      categories {
        id
        name
        slug
        display_order
      }
    }
  }
  ${FORUM_COMMUNITY_FIELDS}
`;

export const FORUM_THREADS_QUERY = gql`
  query ForumThreads(
    $community_slug: String
    $category_id: ID
    $tag_slug: String
    $sort: ForumFeedSort
    $limit: Int
    $skip: Int
  ) {
    forumThreads(
      community_slug: $community_slug
      category_id: $category_id
      tag_slug: $tag_slug
      sort: $sort
      limit: $limit
      skip: $skip
    ) {
      threads {
        ...ForumThreadFields
      }
      total
    }
  }
  ${FORUM_THREAD_FIELDS}
`;

export const FORUM_THREAD_QUERY = gql`
  query ForumThread($id: ID!) {
    forumThread(id: $id) {
      ...ForumThreadFields
      body_md
      media {
        id
        kind
        url
        meta_json
      }
      accepted_reply {
        ...ForumReplyFields
      }
    }
  }
  ${FORUM_THREAD_FIELDS}
  ${FORUM_REPLY_FIELDS}
`;

export const FORUM_REPLIES_QUERY = gql`
  query ForumReplies($thread_id: ID!) {
    forumReplies(thread_id: $thread_id) {
      ...ForumReplyFields
      media {
        id
        kind
        url
      }
    }
  }
  ${FORUM_REPLY_FIELDS}
`;

export const TRENDING_FEED_QUERY = gql`
  query TrendingFeed($sort: ForumFeedSort, $limit: Int) {
    trendingFeed(sort: $sort, limit: $limit) {
      ...ForumThreadFields
    }
  }
  ${FORUM_THREAD_FIELDS}
`;

export const PERSONALIZED_FEED_QUERY = gql`
  query PersonalizedFeed($limit: Int) {
    personalizedFeed(limit: $limit) {
      ...ForumThreadFields
    }
  }
  ${FORUM_THREAD_FIELDS}
`;

export const FORUM_SEARCH_QUERY = gql`
  query ForumSearch(
    $query: String!
    $community_id: ID
    $tag_slug: String
    $sort: String
    $limit: Int
  ) {
    forumSearch(
      query: $query
      community_id: $community_id
      tag_slug: $tag_slug
      sort: $sort
      limit: $limit
    ) {
      threads {
        ...ForumThreadFields
      }
      wiki_articles {
        id
        slug
        title
        summary: current_version {
          summary
        }
      }
      threads_total
      wiki_total
    }
  }
  ${FORUM_THREAD_FIELDS}
`;

export const CREATE_THREAD_MUTATION = gql`
  mutation CreateForumThread($input: CreateForumThreadInput!) {
    createForumThread(input: $input) {
      id
      title
    }
  }
`;

export const CREATE_REPLY_MUTATION = gql`
  mutation CreateForumReply($input: CreateForumReplyInput!) {
    createForumReply(input: $input) {
      id
      thread_id
      body_md
      depth
      author {
        id
        full_name
      }
      createdAt
    }
  }
`;

export const VOTE_THREAD_MUTATION = gql`
  mutation VoteForumContent($input: VoteForumContentInput!) {
    voteForumContent(input: $input) {
      id
      score
      user_vote
    }
  }
`;

export const VOTE_REPLY_MUTATION = gql`
  mutation VoteForumReply($input: VoteForumContentInput!) {
    voteForumReply(input: $input) {
      id
      score
      user_vote
    }
  }
`;

export const ACCEPT_REPLY_MUTATION = gql`
  mutation AcceptForumReply($thread_id: ID!, $reply_id: ID!) {
    acceptForumReply(thread_id: $thread_id, reply_id: $reply_id) {
      id
      accepted_reply_id
    }
  }
`;

export const JOIN_COMMUNITY_MUTATION = gql`
  mutation JoinForumCommunity($community_id: ID!) {
    joinForumCommunity(community_id: $community_id) {
      id
      member_count
    }
  }
`;

export const FOLLOW_MUTATION = gql`
  mutation FollowTarget($input: FollowInput!) {
    followTarget(input: $input) {
      id
    }
  }
`;

export const UNFOLLOW_MUTATION = gql`
  mutation UnfollowTarget($input: FollowInput!) {
    unfollowTarget(input: $input)
  }
`;

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      bio
      avatar_url
      city
      creative_role
      portfolio_url
      website_url
      social_links_json
      reputation_points
      reputation_tier
      badges {
        id
        slug
        name
        icon
        description
      }
    }
  }
`;

export const USER_PROFILE_QUERY = gql`
  query UserProfile($user_id: ID!) {
    userProfile(user_id: $user_id) {
      id
      bio
      avatar_url
      city
      creative_role
      portfolio_url
      website_url
      reputation_points
      reputation_tier
      badges {
        id
        slug
        name
        icon
      }
      user {
        id
        full_name
      }
    }
    userForumThreads(user_id: $user_id, limit: 10) {
      ...ForumThreadFields
    }
  }
  ${FORUM_THREAD_FIELDS}
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($input: UpdateUserProfileInput!) {
    updateMyProfile(input: $input) {
      id
      bio
      avatar_url
      city
      creative_role
      portfolio_url
      website_url
    }
  }
`;

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($unreadOnly: Boolean, $limit: Int) {
    myNotifications(unreadOnly: $unreadOnly, limit: $limit) {
      id
      type
      title
      body
      link_path
      read_at
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read_at
    }
  }
`;

export const FORUM_REPLY_SUBSCRIPTION = gql`
  subscription ForumReplyAdded($thread_id: ID!) {
    forumReplyAdded(thread_id: $thread_id) {
      ...ForumReplyFields
    }
  }
  ${FORUM_REPLY_FIELDS}
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      type
      title
      body
      link_path
      createdAt
    }
  }
`;

export const WIKI_ARTICLES_QUERY = gql`
  query WikiArticles($community_id: ID, $limit: Int, $skip: Int) {
    wikiArticles(community_id: $community_id, limit: $limit, skip: $skip) {
      articles {
        id
        slug
        title
        status
        view_count
        community {
          slug
          name
        }
        current_version {
          summary
        }
      }
      total
    }
  }
`;

export const WIKI_ARTICLE_QUERY = gql`
  query WikiArticle($slug: String!) {
    wikiArticle(slug: $slug) {
      id
      slug
      title
      status
      view_count
      community {
        slug
        name
      }
      author {
        full_name
      }
      current_version {
        id
        version_number
        title
        body_md
        summary
        author {
          full_name
        }
        createdAt
      }
      tags {
        slug
        name
      }
    }
  }
`;

export const WIKI_HISTORY_QUERY = gql`
  query WikiArticleHistory($slug: String!) {
    wikiArticleHistory(slug: $slug) {
      id
      version_number
      title
      summary
      change_note
      author {
        full_name
      }
      createdAt
    }
  }
`;

export const CREATE_WIKI_MUTATION = gql`
  mutation CreateWikiArticle($input: CreateWikiArticleInput!) {
    createWikiArticle(input: $input) {
      id
      slug
    }
  }
`;

export const UPDATE_WIKI_MUTATION = gql`
  mutation UpdateWikiArticle($input: UpdateWikiArticleInput!) {
    updateWikiArticle(input: $input) {
      id
      slug
      title
    }
  }
`;

export const REVERT_WIKI_MUTATION = gql`
  mutation RevertWikiArticle($slug: String!, $version_id: ID!) {
    revertWikiArticle(slug: $slug, version_id: $version_id) {
      id
      slug
      title
    }
  }
`;

export const PORTFOLIO_QUERY = gql`
  query MyPortfolioProjects {
    myPortfolioProjects {
      id
      title
      description
      cover_url
      media_json
      tags_json
      display_order
    }
  }
`;

export const UPSERT_PORTFOLIO_MUTATION = gql`
  mutation UpsertPortfolioProject($input: PortfolioProjectInput!) {
    upsertPortfolioProject(input: $input) {
      id
      title
      description
      cover_url
      display_order
    }
  }
`;

export const DELETE_PORTFOLIO_MUTATION = gql`
  mutation DeletePortfolioProject($id: ID!) {
    deletePortfolioProject(id: $id)
  }
`;

export const USER_PORTFOLIO_QUERY = gql`
  query UserPortfolioProjects($user_id: ID!) {
    userPortfolioProjects(user_id: $user_id) {
      id
      title
      description
      cover_url
      media_json
      display_order
    }
  }
`;

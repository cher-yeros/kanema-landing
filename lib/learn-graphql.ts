import { gql } from "@apollo/client";

export const PUBLISHED_CURRICULUM_QUERY = gql`
  query PublishedCourseCurriculum($slug: String!) {
    publishedCourseCurriculum(slug: $slug) {
      id
      course_id
      title
      sort_order
      is_free_preview
      lessons {
        id
        section_id
        title
        sort_order
        content_type
        content_url
        duration_seconds
        is_free_preview
        content_unlocked
        resources_json
        is_completed
        watch_time_seconds
      }
    }
  }
`;

export const MY_ELEARN_ENROLLMENTS_QUERY = gql`
  query MyELearnEnrollments {
    myEnrollments {
      id
      course_id
      status
      course {
        id
        slug
        title
      }
    }
  }
`;

export const ENROLL_ELEARN_COURSE_MUTATION = gql`
  mutation EnrollELearn($course_id: ID!) {
    enrollInELearnCourse(course_id: $course_id) {
      id
      course_id
      status
    }
  }
`;

export const MARK_ELEARN_LESSON_COMPLETE_MUTATION = gql`
  mutation MarkELearnLesson($lesson_id: ID!) {
    markELearnLessonComplete(lesson_id: $lesson_id) {
      id
      is_completed
    }
  }
`;

export const UPDATE_ELEARN_WATCH_MUTATION = gql`
  mutation UpdateELearnWatch(
    $lesson_id: ID!
    $watch_time_seconds: Int!
    $mark_complete_if_threshold: Boolean
  ) {
    updateELearnLessonWatchProgress(
      lesson_id: $lesson_id
      watch_time_seconds: $watch_time_seconds
      mark_complete_if_threshold: $mark_complete_if_threshold
    ) {
      id
      watch_time_seconds
      is_completed
    }
  }
`;

export const SUBMIT_ELEARN_REVIEW_MUTATION = gql`
  mutation SubmitELearnReview(
    $course_id: ID!
    $rating: Int!
    $comment: String
  ) {
    submitELearnCourseReview(
      course_id: $course_id
      rating: $rating
      comment: $comment
    ) {
      id
      rating
      comment
      createdAt
      author {
        id
        full_name
      }
    }
  }
`;

export const PUBLISHED_COURSE_REVIEWS_QUERY = gql`
  query PublishedCourseReviews($slug: String!) {
    publishedCourseReviews(slug: $slug) {
      id
      rating
      comment
      createdAt
      author {
        full_name
      }
    }
  }
`;

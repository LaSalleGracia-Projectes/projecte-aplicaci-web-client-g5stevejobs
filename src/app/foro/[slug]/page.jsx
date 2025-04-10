import { use } from 'react';
import PostDetailClient from './PostDetailClient';

export default function PostDetail({ params }) {
  const slug = use(Promise.resolve(params.slug));
  
  return <PostDetailClient slug={slug} />;
}
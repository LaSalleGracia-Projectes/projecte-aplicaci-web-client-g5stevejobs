import { use } from 'react';
import PostDetailClient from './PostDetailClient';

export default function PostDetail({ params }) {
  const slug = use(Promise.resolve(params.slug));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-850">
      <div className="container mx-auto px-4 py-8">
        <PostDetailClient slug={slug} />
      </div>
    </div>
  );
}
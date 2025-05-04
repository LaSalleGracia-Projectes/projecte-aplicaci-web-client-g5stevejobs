import PostListClient from './PostListClient';

export default function ForoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-850">
      <div className="container mx-auto px-4 py-8">
        <PostListClient />
      </div>
    </div>
  );
}
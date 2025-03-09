"use client";

import React, { useState } from "react";
import { useParams } from 'next/navigation';

const ForumDiscussionPage = () => {
  const { slug } = useParams();

  const [comments, setComments] = useState([
    {
      author: "User1",
      content: "This is the first comment on this topic!",
      postedAt: "2 hours ago",
    },
    {
      author: "User2",
      content: "I agree with the points mentioned above.",
      postedAt: "1 hour ago",
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const forumTopics = {
    "pinned-topic-1": {
      title: "Pinned Topic 1",
      description: "Discussion about Pinned Topic 1.",
      author: "Username1",
      postedDate: "xx of December of 202X",
      upvotes: 222,
      commentsCount: comments.length,
      pinnedTopics: [],
      otherTopics: [],
    },
    "pinned-topic-2": {
      title: "Pinned Topic 2",
      description: "Discussion about Pinned Topic 2.",
      author: "Username2",
      postedDate: "xx of January of 202X",
      upvotes: 333,
      commentsCount: comments.length,
      pinnedTopics: [],
      otherTopics: [],
    },
    "other-topic-1": {
      title: "Other Topic 1",
      description: "Discussion about Other Topic 1.",
      author: "Username3",
      postedDate: "xx of February of 202X",
      upvotes: 111,
      commentsCount: comments.length,
      pinnedTopics: [],
      otherTopics: [],
    },
    // Add other topics similarly...
  };

  const forumData = forumTopics[slug] || null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          author: "CurrentUser",
          content: newComment,
          postedAt: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  if (!forumData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Forum not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="container mx-auto px-6 py-8">
        {/* Forum Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            {forumData.title}
          </h1>
          <p className="text-gray-400 mb-4">{forumData.description}</p>
          <div className="text-sm text-gray-500 flex gap-4">
            <span>Posted by: {forumData.author}</span>
            <span>On: {forumData.postedDate}</span>
            <span>Upvotes: {forumData.upvotes}</span>
            <span>Comments: {forumData.commentsCount}</span>
          </div>
        </header>

        {/* Comments Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Comments
          </h2>
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-lg shadow hover:shadow-md transition-all"
              >
                <p className="text-sm text-gray-100">{comment.content}</p>
                <div className="text-xs text-gray-400 mt-2 flex justify-between">
                  <span>By: {comment.author}</span>
                  <span>{comment.postedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Comment Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Add a Comment
          </h2>
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring focus:ring-blue-300 focus:outline-none"
              rows="4"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Post Comment
            </button>
          </form>
        </section>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Forums
          </button>
        </div>
      </main>
    </div>
  );
};

export default ForumDiscussionPage;
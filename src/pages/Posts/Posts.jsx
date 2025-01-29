import React, { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast, Bounce } from "react-toastify";

const Posts = () => {
  // State Variables
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [query, setQuery] = useState("");
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const [newComment, setNewComment] = useState({});
  const [currentPost, setCurrentPost] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialLimit = 3;

  // Query Client
  const queryClient = useQueryClient();

  // Get the Authorization header for API requests
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });

  // Fetch posts function considering the query
  const fetchPosts = async ({ pageParam = 1 }) => {
    console.log("Fetching posts with query:", query);
    const response = await axios.get("http://127.0.0.1:8000/api/v1/posts", {
      params: { page: pageParam, query },
      headers: getAuthHeaders(),
    });
    console.log(response.data);
    return response.data;
  };

  // Use react-query's infinite query to fetch posts with search query
  const {
    data,
    isError,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", query],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) =>
      lastPage.data.next_page_url ? lastPage.data.current_page + 1 : undefined,
  });

  // Fetch comments function
  const fetchComments = async ({ pageParam = 1 }) => {
    const response = await axios.get("http://127.0.0.1:8000/api/v1/comments", {
      params: { page: pageParam },
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  // Mutation to create a new post
  const { mutate: createPost } = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/posts",
        newPost,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Create posted successfully!", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setNewPost({ title: "", body: "" });
      queryClient.invalidateQueries(["posts"]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });

  // Modal Handling for Create Post
  const openModalForCreate = () => {
    setCurrentPost(null);
    setFormData({ title: "", body: "" });
    setIsModalOpen(true);
  };

  // Mutation to add a comment to a post
  const { mutate: addComment } = useMutation({
    mutationFn: async (postId) => {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/posts/${postId}/comments`,
        { body: newComment[postId] },
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    },
    onMutate: (postId) => {
      queryClient.setQueryData(["posts", query], (oldData) => {
        if (!oldData) return;

        const newCommentData = {
          body: newComment[postId],
          post_id: postId,
          created_at: new Date().toISOString(),
        };

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: Array.isArray(page.data)
              ? page.data.map((post) =>
                  post.id === postId
                    ? {
                        ...post,
                        comments: [
                          newCommentData,
                          ...(post.comments || []),
                        ].sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        ),
                      }
                    : post
                )
              : page.data,
          })),
        };
      });
    },
    onSuccess: (newCommentData) => {
      queryClient.invalidateQueries(["posts", query]);

      queryClient.setQueryData(["posts", query], (oldData) => {
        if (!oldData) return;

        console.log("Old Data after mutation:", oldData);

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: Array.isArray(page.data)
              ? page.data.map((post) =>
                  post.id === newCommentData.post_id
                    ? {
                        ...post,
                        comments: [
                          newCommentData,
                          ...(post.comments || []),
                        ].sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        ),
                      }
                    : post
                )
              : page.data,
          })),
        };
      });

      setNewComment((prev) => ({ ...prev, [newCommentData.post_id]: "" }));
    },
  });

  // Load more posts when scroll reaches the end
  const loadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  useEffect(() => {
    document.title = "Posts - Task Management";
  });

  // Flatten the pages of posts into one array for display
  const allPosts = data ? data.pages.flatMap((page) => page.data.data) : [];

  return (
    <>
      <h1 className="font-poppins font-bold text-3xl text-black py-8 text-center">
        Posts and Comments
      </h1>

      {/* {isError && (
        <div className="text-red-500 text-center mb-4">
          Failed to fetch posts. Please try again later.
        </div>
      )}
      {isLoading && <div className="text-center mb-4">Loading...</div>} */}

      <div className="flex flex-col items-center gap-5 w-full">
        <div className="bg-blue-400 bg-opacity-95 flex flex-col items-start gap-6 p-8 w-full max-w-5xl rounded-md font-poppins">
          <div className="flex w-full">
            <input
              className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-blue-300 w-full"
              type="text"
              placeholder="What's on your mind, User?"
              onClick={openModalForCreate}
            />
          </div>
        </div>

        <div className="bg-blue-400 bg-opacity-95 p-6 rounded-md w-full max-w-5xl">
          <h2 className="text-black text-2xl font-bold mb-4 text-center">
            All Posts
          </h2>

          <div className="bg-white p-6 rounded-md w-full max-w-5xl">
            <h2 className="text-black font-bold text-2xl mb-5">Search Posts</h2>
            <input
              className="p-2 rounded-md w-full border border-gray-300 font-poppins"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="py-10">
            <InfiniteScroll
              dataLength={allPosts.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={<h4 className="text-center">Loading more posts...</h4>}
              endMessage={
                <p className="text-center text-gray-500">
                  No more posts available.
                </p>
              }
            >
              {allPosts.length > 0 ? (
                allPosts.map((post) => (
                  <div key={post.id} className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="mb-4 text-gray-700">{post.body}</p>

                    <div className="mt-4 bg-gray-100 rounded-md p-4 shadow-md">
                      <h4 className="font-bold text-lg mb-3">Comments</h4>
                      <div
                        className="overflow-y-auto p-4 rounded-md bg-white border border-gray-200"
                        style={{ maxHeight: "200px" }}
                      >
                        {post.comments && post.comments.length > 0 ? (
                          <ul className="space-y-2">
                            {post.comments
                              .sort(
                                (a, b) =>
                                  new Date(b.created_at) -
                                  new Date(a.created_at)
                              )
                              .slice(
                                0,
                                showAllComments
                                  ? post.comments.length
                                  : initialLimit
                              )
                              .map((comment) => (
                                <li
                                  key={comment.id}
                                  className="text-sm text-gray-600"
                                >
                                  {comment.body}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No comments yet.
                          </p>
                        )}
                        <div>
                          {post.comments.length > initialLimit && (
                            <button
                              className="text-blue-500 hover:underline mt-2"
                              onClick={toggleComments}
                            >
                              {showAllComments ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <textarea
                          className="px-4 py-2 rounded-md w-full border border-gray-300"
                          placeholder="Add a comment"
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              [post.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 transition"
                          onClick={() => addComment(post.id)}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-6">
                  No posts available.
                </p>
              )}
            </InfiniteScroll>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          className="bg-blue-400"
          closeModal={() => setIsModalOpen(false)}
        >
          <div className="flex flex-col items-center gap-2 pt-5 w-[360px]">
            <h2 className="text-2xl font-bold text-black">Create Post</h2>
            <form
              className="flex flex-col w-full gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                createPost(formData);
              }}
            >
              <label className="text-black font-bold">Title:</label>
              <input
                className="w-full px-4 py-2 border rounded-md mb-3"
                name="Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <label className="text-black font-bold">Body:</label>
              <textarea
                className="w-full px-4 py-2 border rounded-md mb-3"
                name="Body"
                value={newPost.body}
                onChange={(e) =>
                  setNewPost((prev) => ({ ...prev, body: e.target.value }))
                }
                rows="5"
              />
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  type="button"
                  className="bg-gray-400 text-white rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 text-white rounded-md"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Posts;

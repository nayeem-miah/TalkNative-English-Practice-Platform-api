/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const createPost = async (userId: string, payload: any) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          role: true,
        },
      },
    },
  });
  return result;
};

const getAllPosts = async (userId: string | undefined, query: Record<string, any>) => {
  const queryObj = { ...query };
  if (!queryObj.status) {
    queryObj.status = "ACTIVE";
  }

  const qb = new PrismaQueryBuilder(queryObj)
    .filter()
    .search(["title", "body"])
    .sort()
    .paginate();

  const prismaQuery = qb.build();


  if (query.category) {
    prismaQuery.where = {
      ...prismaQuery.where,
      category: query.category,
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: prismaQuery.where,
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where: prismaQuery.where }),
  ]);

  let likedPostIds = new Set<string>();
  if (userId) {
    const postIds = posts.map((p) => p.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: {
        postId: true,
      },
    });
    likedPostIds = new Set(userLikes.map((l) => l.postId));
  }

  const postsWithLikes = posts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post.id),
  }));

  return {
    meta: qb.getMeta(total),
    data: postsWithLikes,
  };
};

const getSinglePost = async (postId: string, userId?: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          role: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }

  let isLiked = false;
  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    isLiked = !!like;
  }

  return {
    ...post,
    isLiked,
  };
};

const updatePost = async (userId: string, postId: string, payload: any) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }

  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to update this post!");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          role: true,
        },
      },
    },
  });

  return result;
};

const deletePost = async (userId: string, postId: string, userRole: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }

  if (post.authorId !== userId && userRole !== "ADMIN") {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to delete this post!");
  }

  return await prisma.post.delete({
    where: { id: postId },
  });
};

const toggleLike = async (userId: string, postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    return { liked: true };
  }
};

const createComment = async (userId: string, postId: string, payload: any) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
  }

  const comment = await prisma.comment.create({
    data: {
      content: payload.content,
      postId,
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          role: true,
        },
      },
    },
  });

  return comment;
};

const updateComment = async (userId: string, commentId: string, payload: any) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Comment not found!");
  }

  if (comment.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to update this comment!");
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: payload.content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          role: true,
        },
      },
    },
  });

  return result;
};

const deleteComment = async (userId: string, commentId: string, userRole: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: true,
    },
  });

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Comment not found!");
  }

  // Deletion allowed if commenter, post author, or admin
  if (comment.authorId !== userId && comment.post.authorId !== userId && userRole !== "ADMIN") {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to delete this comment!");
  }

  return await prisma.comment.delete({
    where: { id: commentId },
  });
};

export const CommunityService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  toggleLike,
  createComment,
  updateComment,
  deleteComment,
};

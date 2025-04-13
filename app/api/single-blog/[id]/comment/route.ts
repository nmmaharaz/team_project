import dbConnect, { collectionNameObj } from "@/lib/dbConnect"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"


export const GET = async (request: NextRequest | Request, { params }: RouteParams) => {
    const blogCollection = dbConnect(collectionNameObj.blogCollection)
    const query = { _id: new ObjectId(params.id) }
    const singleBlog = await (await blogCollection).findOne(query)
    return NextResponse.json(singleBlog)
  }

export const PATCH = async (req: Request, { params }: RouteParams) => {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const blogCollection = dbConnect(collectionNameObj.blogCollection)
  const postId = new ObjectId(params.id)
  const body = await req.json()
  const { userName, userEmail, userImage, comment } = body

  if (!userEmail || !comment) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
  }

  const post = await (await blogCollection).findOne({ _id: postId })
  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 })
  }

  const newComment = {
    userName,
    userEmail,
    userImage,
    comment,
    createdAt: new Date(),
  }

  const updateComments = [...(post.comments || []), newComment]
  const updateRes = await (await blogCollection).updateOne(
    { _id: postId },
    { $set: { comments: updateComments } }
  )

  return NextResponse.json({
    message: "Comment added",
    updateRes,
  })
}

import mongoose from "mongoose";
declare global {
  // eslint-disable-next-line no-var
    var mongoose: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null } | undefined; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

cached ??= global.mongoose = { conn: null, promise: null };

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  if (cached?.conn) {
    return cached.conn;
  }
  if (cached && !cached.promise) {

    cached.promise = mongoose.connect(MONGODB_URI, {
      maxConnecting: 2,
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }

  return cached?.conn;
}